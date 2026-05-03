import {
  createAppSession,
  getLiveStreams,
  getPlaybackUrl,
  getSeries,
  getVodStreams,
} from "../src/server/iptv.server.ts";

type ContentType = "live" | "movie" | "series";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function hasTechnicalUrl(value: unknown): boolean {
  if (typeof value === "string") {
    return (
      /https?:\/\//i.test(value) ||
      /player_api\.php|\/enigma2|\.m3u8?|\/live\/|\/movie\/|\/series\//i.test(value)
    );
  }
  if (Array.isArray(value)) return value.some(hasTechnicalUrl);
  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, nested]) => {
      if (key === "stream_icon" || key === "cover" || key === "backdrop_path") return false;
      return key.toLowerCase().includes("stream_url") || hasTechnicalUrl(nested);
    });
  }
  return false;
}

function assertSafeCatalog(items: Array<Record<string, unknown>>, label: string) {
  assert(items.length > 0, `${label}: no items returned`);
  for (const item of items) {
    assert(!("stream_url" in item), `${label}: stream_url leaked in catalog`);
    assert(!hasTechnicalUrl(item), `${label}: technical URL leaked in catalog`);
    assert(
      typeof item.id === "string" && /^[a-z]+_[a-z0-9]+$/i.test(item.id),
      `${label}: id is not opaque`,
    );
    const compatibilityId = item.stream_id || item.series_id;
    if (compatibilityId) {
      assert(
        String(compatibilityId) === String(item.id),
        `${label}: compatibility id differs from opaque id`,
      );
      assert(
        /^[a-z]+_[a-z0-9]+$/i.test(String(compatibilityId)),
        `${label}: compatibility id is not opaque`,
      );
    }
  }
}

async function main() {
  process.env.IPTV_BASE_URL = requiredEnv("IPTV_BASE_URL");
  const username = requiredEnv("IPTV_TEST_USERNAME");
  const password = requiredEnv("IPTV_TEST_PASSWORD");

  const session = await createAppSession(username, password);
  assert(session.appSessionToken.startsWith("sess_"), "Login did not return an app session token");

  const [channels, movies, series] = await Promise.all([
    getLiveStreams(session.appSessionToken),
    getVodStreams(session.appSessionToken),
    getSeries(session.appSessionToken),
  ]);

  assertSafeCatalog(channels as unknown as Array<Record<string, unknown>>, "channels");
  assertSafeCatalog(movies as unknown as Array<Record<string, unknown>>, "movies");
  assertSafeCatalog(series as unknown as Array<Record<string, unknown>>, "series");

  const playbackCandidate =
    (channels[0]?.id && { id: channels[0].id, type: "live" as ContentType }) ||
    (movies[0]?.id && { id: movies[0].id, type: "movie" as ContentType }) ||
    (series[0]?.id && { id: series[0].id, type: "series" as ContentType });

  assert(playbackCandidate, "No playback candidate found");
  const playbackUrl = await getPlaybackUrl(
    session.appSessionToken,
    playbackCandidate.id,
    playbackCandidate.type,
  );
  assert(
    typeof playbackUrl === "string" && /^https?:\/\//i.test(playbackUrl),
    "Playback URL was not resolved on demand",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: session.mode,
        counts: {
          channels: channels.length,
          movies: movies.length,
          series: series.length,
        },
        catalogHasStreamUrl: false,
        catalogHasTechnicalUrl: false,
        opaqueIds: true,
        playbackResolvedOnDemand: true,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
});
