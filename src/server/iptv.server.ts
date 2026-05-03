// IPTV server-only helpers. Keep DNS, credentials and stream URLs on this side.

type ContentType = "live" | "movie" | "series";

const USER_AGENT = "CentralPlayPlus/1.0";
const SESSION_TTL = 6 * 60 * 60 * 1000;
const CATALOG_TTL = 5 * 60 * 1000;
const MODE_TTL = 30 * 60 * 1000;

function getBaseUrl(): string {
  const url = process.env.IPTV_BASE_URL;
  if (!url) throw new Error("IPTV_BASE_URL not configured");
  return url.replace(/\/+$/, "");
}

function hash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function providerKey(): string {
  return hash(getBaseUrl());
}

function makeContentId(type: ContentType, name: string, categoryId: string, ref: string): string {
  return `${type}_${hash(`${providerKey()}:${type}:${name}:${categoryId}:${ref}`)}`;
}

function now() {
  return Date.now();
}

export interface IptvCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface SafeChannel {
  id: string;
  num: number;
  name: string;
  stream_id: string;
  stream_type: "live";
  stream_icon: string;
  epg_channel_id: string | null;
  category_id: string;
  tv_archive: number;
}

export interface SafeVodItem {
  id: string;
  num: number;
  name: string;
  stream_id: string;
  stream_type: "movie";
  stream_icon: string;
  rating: string;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
}

export interface SafeSeriesItem {
  id: string;
  num: number;
  name: string;
  series_id: string;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  last_modified: string;
  rating: string;
  rating_5based: number;
  backdrop_path: string[];
  youtube_trailer: string;
  episode_run_time: string;
  category_id: string;
}

export interface SafeEpisode {
  id: string;
  episode_num: number;
  title: string;
  container_extension: string;
  info?: {
    duration?: string;
    plot?: string;
    movie_image?: string;
  };
}

interface IptvAuthResult {
  user_info?: {
    status?: string;
    exp_date?: string;
    is_trial?: string;
    active_cons?: string;
    created_at?: string;
    max_connections?: string;
  };
}

interface RawChannel {
  num?: number;
  name?: string;
  stream_type?: string;
  stream_id?: number | string;
  stream_icon?: string;
  epg_channel_id?: string | null;
  category_id?: string;
  tv_archive?: number;
}

interface RawVodItem {
  num?: number;
  name?: string;
  stream_id?: number | string;
  stream_icon?: string;
  rating?: string;
  rating_5based?: number;
  added?: string;
  category_id?: string;
  container_extension?: string;
}

interface RawSeriesItem {
  num?: number;
  name?: string;
  series_id?: number | string;
  cover?: string;
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  releaseDate?: string;
  last_modified?: string;
  rating?: string;
  rating_5based?: number;
  backdrop_path?: string[];
  youtube_trailer?: string;
  episode_run_time?: string;
  category_id?: string;
}

interface E2Channel {
  title: string;
  description: string;
  categoryId: string;
  streamUrl: string;
  descImage: string;
}

interface AppSession {
  token: string;
  username: string;
  password: string;
  mode: "xtream" | "enigma2";
  providerKey: string;
  createdAt: number;
  touchedAt: number;
}

interface PlaybackRef {
  type: ContentType;
  mode: "xtream" | "enigma2";
  streamId?: string;
  categoryId?: string;
  container?: string;
  url?: string;
}

const sessions = new Map<string, AppSession>();
const modeCache = new Map<string, { mode: "xtream" | "enigma2"; ts: number }>();
const catalogCache = new Map<string, { data: unknown; ts: number }>();
const playbackRefs = new Map<string, PlaybackRef>();

function cacheKey(session: AppSession, type: string, categoryId = "all") {
  return `${session.providerKey}:${hash(session.username)}:${session.mode}:${type}:${categoryId}`;
}

function getCached<T>(key: string): T | null {
  const cached = catalogCache.get(key);
  if (!cached || now() - cached.ts > CATALOG_TTL) return null;
  return cached.data as T;
}

function setCached(key: string, data: unknown) {
  catalogCache.set(key, { data, ts: now() });
}

function touchSession(session: AppSession) {
  session.touchedAt = now();
}

function getSession(appSessionToken: string): AppSession {
  const session = sessions.get(appSessionToken);
  if (!session || now() - session.touchedAt > SESSION_TTL) {
    if (session) sessions.delete(appSessionToken);
    throw new Error("Sessao expirada");
  }
  touchSession(session);
  return session;
}

async function iptvFetch<T>(session: AppSession, params: Record<string, string>): Promise<T> {
  const url = new URL(`${getBaseUrl()}/player_api.php`);
  url.searchParams.set("username", session.username);
  url.searchParams.set("password", session.password);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`IPTV API error [${res.status}]`);
  return res.json() as Promise<T>;
}

async function xtreamAvailable(username: string, password: string): Promise<boolean> {
  try {
    const url = new URL(`${getBaseUrl()}/player_api.php`);
    url.searchParams.set("username", username);
    url.searchParams.set("password", password);
    const res = await fetch(url.toString(), { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return false;
    const text = await res.text();
    try {
      return !!JSON.parse(text).user_info;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

async function detectMode(username: string, password: string): Promise<"xtream" | "enigma2"> {
  const key = `${providerKey()}:${hash(username)}`;
  const cached = modeCache.get(key);
  if (cached && now() - cached.ts < MODE_TTL) return cached.mode;
  const mode = (await xtreamAvailable(username, password)) ? "xtream" : "enigma2";
  modeCache.set(key, { mode, ts: now() });
  console.log(`[IPTV] Mode: ${mode}`);
  return mode;
}

function b64Decode(str: string): string {
  try {
    return atob(str);
  } catch {
    return str;
  }
}

async function enigma2Fetch(session: AppSession, type: string, catId?: string): Promise<string> {
  const url = new URL(`${getBaseUrl()}/enigma2`);
  url.searchParams.set("username", session.username);
  url.searchParams.set("password", session.password);
  url.searchParams.set("type", type);
  if (catId) url.searchParams.set("cat_id", catId);
  const res = await fetch(url.toString(), { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Enigma2 API error [${res.status}]`);
  return res.text();
}

function extractTag(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1] : "";
}

function extractCdata(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}><!\\[CDATA\\[([^\\]]*?)\\]\\]></${tag}>`));
  return m ? m[1] : "";
}

function parseE2Xml(xml: string): E2Channel[] {
  const channels: E2Channel[] = [];
  const channelRegex = /<channel>([\s\S]*?)<\/channel>/g;
  let match: RegExpExecArray | null;
  while ((match = channelRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const description = extractTag(block, "description");
    channels.push({
      title: title ? b64Decode(title) : "",
      description: description ? b64Decode(description) : "",
      categoryId: extractTag(block, "category_id") || "0",
      streamUrl: extractCdata(block, "stream_url") || extractCdata(block, "playlist_url"),
      descImage: extractCdata(block, "desc_image"),
    });
  }
  return channels;
}

function parseE2Description(desc: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of desc.split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) result[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return result;
}

function parseE2Categories(xml: string): IptvCategory[] {
  return parseE2Xml(xml)
    .filter((ch) => ch.title.toLowerCase() !== "all")
    .map((ch) => ({ category_id: ch.categoryId, category_name: ch.title, parent_id: 0 }));
}

function remember(contentId: string, ref: PlaybackRef) {
  playbackRefs.set(contentId, ref);
}

function sanitizeXtreamChannel(item: RawChannel, i: number): SafeChannel {
  const streamId = String(item.stream_id ?? i + 1);
  const categoryId = String(item.category_id ?? "0");
  const name = item.name || "Sem nome";
  const id = makeContentId("live", name, categoryId, streamId);
  remember(id, { type: "live", mode: "xtream", streamId, container: "ts" });
  return {
    id,
    num: item.num ?? i + 1,
    name,
    stream_id: id,
    stream_type: "live",
    stream_icon: item.stream_icon || "",
    epg_channel_id: item.epg_channel_id ?? null,
    category_id: categoryId,
    tv_archive: item.tv_archive ?? 0,
  };
}

function sanitizeXtreamVod(item: RawVodItem, i: number): SafeVodItem {
  const streamId = String(item.stream_id ?? i + 1);
  const categoryId = String(item.category_id ?? "0");
  const name = item.name || "Sem titulo";
  const container = item.container_extension || "mp4";
  const id = makeContentId("movie", name, categoryId, `${streamId}.${container}`);
  remember(id, { type: "movie", mode: "xtream", streamId, container });
  return {
    id,
    num: item.num ?? i + 1,
    name,
    stream_id: id,
    stream_type: "movie",
    stream_icon: item.stream_icon || "",
    rating: item.rating || "0",
    rating_5based: item.rating_5based ?? 0,
    added: item.added || "",
    category_id: categoryId,
    container_extension: container,
  };
}

function sanitizeXtreamSeries(item: RawSeriesItem, i: number): SafeSeriesItem {
  const seriesId = String(item.series_id ?? i + 1);
  const categoryId = String(item.category_id ?? "0");
  const name = item.name || "Sem titulo";
  const id = makeContentId("series", name, categoryId, seriesId);
  remember(id, { type: "series", mode: "xtream", streamId: seriesId, container: "mp4" });
  return {
    id,
    num: item.num ?? i + 1,
    name,
    series_id: id,
    cover: item.cover || "",
    plot: item.plot || "",
    cast: item.cast || "",
    director: item.director || "",
    genre: item.genre || "",
    releaseDate: item.releaseDate || "",
    last_modified: item.last_modified || "",
    rating: item.rating || "",
    rating_5based: item.rating_5based ?? 0,
    backdrop_path: item.backdrop_path || [],
    youtube_trailer: item.youtube_trailer || "",
    episode_run_time: item.episode_run_time || "",
    category_id: categoryId,
  };
}

function sanitizeE2Channel(ch: E2Channel, i: number, categoryId: string): SafeChannel {
  const id = makeContentId(
    "live",
    ch.title,
    categoryId,
    ch.streamUrl || `${categoryId}:${ch.title}`,
  );
  remember(id, { type: "live", mode: "enigma2", categoryId, url: ch.streamUrl });
  return {
    id,
    num: i + 1,
    name: ch.title,
    stream_id: id,
    stream_type: "live",
    stream_icon: ch.descImage,
    epg_channel_id: null,
    category_id: categoryId,
    tv_archive: 0,
  };
}

function sanitizeE2Vod(ch: E2Channel, i: number, categoryId: string): SafeVodItem {
  const meta = parseE2Description(ch.description);
  const ratingStr = meta.RATING || "0";
  const rating = parseFloat(ratingStr) || 0;
  const id = makeContentId(
    "movie",
    ch.title,
    categoryId,
    ch.streamUrl || `${categoryId}:${ch.title}`,
  );
  remember(id, { type: "movie", mode: "enigma2", categoryId, url: ch.streamUrl, container: "mp4" });
  return {
    id,
    num: i + 1,
    name: ch.title,
    stream_id: id,
    stream_type: "movie",
    stream_icon: ch.descImage || meta.COVER_BIG || "",
    rating: ratingStr,
    rating_5based: rating > 5 ? rating / 2 : rating,
    added: meta.RELEASEDATE || meta.RELEASE_DATE || "",
    category_id: categoryId,
    container_extension: "mp4",
  };
}

function sanitizeE2SeriesCategory(cat: IptvCategory, i: number): SafeSeriesItem {
  const id = makeContentId("series", cat.category_name, cat.category_id, cat.category_id);
  remember(id, { type: "series", mode: "enigma2", categoryId: cat.category_id });
  return {
    id,
    num: i + 1,
    name: cat.category_name,
    series_id: id,
    cover: "",
    plot: "",
    cast: "",
    director: "",
    genre: cat.category_name,
    releaseDate: "",
    last_modified: "",
    rating: "",
    rating_5based: 0,
    backdrop_path: [],
    youtube_trailer: "",
    episode_run_time: "",
    category_id: cat.category_id,
  };
}

export async function createAppSession(username: string, password: string) {
  const mode = await detectMode(username, password);
  const tempSession: AppSession = {
    token: "validation",
    username,
    password,
    mode,
    providerKey: providerKey(),
    createdAt: now(),
    touchedAt: now(),
  };

  if (mode === "enigma2") {
    const xml = await enigma2Fetch(tempSession, "get_live_categories");
    if (!xml.includes("<channel>")) throw new Error("Credenciais invalidas");
  } else {
    const result = await iptvFetch<IptvAuthResult>(tempSession, {});
    if (!result.user_info || result.user_info.status !== "Active") throw new Error("Conta inativa");
  }

  const token = `sess_${crypto.randomUUID()}`;
  const session = { ...tempSession, token };
  sessions.set(token, session);

  return {
    appSessionToken: token,
    mode,
    user: { status: "Active" },
  };
}

export async function getLiveCategories(appSessionToken: string): Promise<IptvCategory[]> {
  const session = getSession(appSessionToken);
  const key = cacheKey(session, "liveCategories");
  const cached = getCached<IptvCategory[]>(key);
  if (cached) return cached;
  const data =
    session.mode === "enigma2"
      ? parseE2Categories(await enigma2Fetch(session, "get_live_categories"))
      : await iptvFetch<IptvCategory[]>(session, { action: "get_live_categories" });
  setCached(key, data);
  return data;
}

export async function getLiveStreams(
  appSessionToken: string,
  categoryId?: string,
): Promise<SafeChannel[]> {
  const session = getSession(appSessionToken);
  const key = cacheKey(session, "liveStreams", categoryId || "all");
  const cached = getCached<SafeChannel[]>(key);
  if (cached) return cached;
  let data: SafeChannel[];
  if (session.mode === "enigma2") {
    const categories = categoryId
      ? [{ category_id: categoryId, category_name: "", parent_id: 0 }]
      : await getLiveCategories(appSessionToken);
    const results = await Promise.all(
      categories.slice(0, 30).map(async (cat) => {
        const xml = await enigma2Fetch(session, "get_live_streams", cat.category_id);
        return parseE2Xml(xml).map((ch, i) => sanitizeE2Channel(ch, i, cat.category_id));
      }),
    );
    data = results.flat().map((item, i) => ({ ...item, num: i + 1 }));
  } else {
    const params: Record<string, string> = { action: "get_live_streams" };
    if (categoryId) params.category_id = categoryId;
    data = (await iptvFetch<RawChannel[]>(session, params)).map(sanitizeXtreamChannel);
  }
  setCached(key, data);
  return data;
}

export async function getVodCategories(appSessionToken: string): Promise<IptvCategory[]> {
  const session = getSession(appSessionToken);
  const key = cacheKey(session, "vodCategories");
  const cached = getCached<IptvCategory[]>(key);
  if (cached) return cached;
  const data =
    session.mode === "enigma2"
      ? parseE2Categories(await enigma2Fetch(session, "get_vod_categories"))
      : await iptvFetch<IptvCategory[]>(session, { action: "get_vod_categories" });
  setCached(key, data);
  return data;
}

export async function getVodStreams(
  appSessionToken: string,
  categoryId?: string,
): Promise<SafeVodItem[]> {
  const session = getSession(appSessionToken);
  const key = cacheKey(session, "vodStreams", categoryId || "all");
  const cached = getCached<SafeVodItem[]>(key);
  if (cached) return cached;
  let data: SafeVodItem[];
  if (session.mode === "enigma2") {
    const categories = categoryId
      ? [{ category_id: categoryId, category_name: "", parent_id: 0 }]
      : await getVodCategories(appSessionToken);
    const results = await Promise.all(
      categories.slice(0, 20).map(async (cat) => {
        const xml = await enigma2Fetch(session, "get_vod_streams", cat.category_id);
        return parseE2Xml(xml).map((ch, i) => sanitizeE2Vod(ch, i, cat.category_id));
      }),
    );
    data = results.flat().map((item, i) => ({ ...item, num: i + 1 }));
  } else {
    const params: Record<string, string> = { action: "get_vod_streams" };
    if (categoryId) params.category_id = categoryId;
    data = (await iptvFetch<RawVodItem[]>(session, params)).map(sanitizeXtreamVod);
  }
  setCached(key, data);
  return data;
}

export async function getSeriesCategories(appSessionToken: string): Promise<IptvCategory[]> {
  const session = getSession(appSessionToken);
  const key = cacheKey(session, "seriesCategories");
  const cached = getCached<IptvCategory[]>(key);
  if (cached) return cached;
  const data =
    session.mode === "enigma2"
      ? parseE2Categories(await enigma2Fetch(session, "get_series_categories"))
      : await iptvFetch<IptvCategory[]>(session, { action: "get_series_categories" });
  setCached(key, data);
  return data;
}

export async function getSeries(
  appSessionToken: string,
  categoryId?: string,
): Promise<SafeSeriesItem[]> {
  const session = getSession(appSessionToken);
  const key = cacheKey(session, "series", categoryId || "all");
  const cached = getCached<SafeSeriesItem[]>(key);
  if (cached) return cached;
  let data: SafeSeriesItem[];
  if (session.mode === "enigma2") {
    const cats = await getSeriesCategories(appSessionToken);
    data = cats
      .filter((cat) => !categoryId || cat.category_id === categoryId)
      .map(sanitizeE2SeriesCategory);
  } else {
    const params: Record<string, string> = { action: "get_series" };
    if (categoryId) params.category_id = categoryId;
    data = (await iptvFetch<RawSeriesItem[]>(session, params)).map(sanitizeXtreamSeries);
  }
  setCached(key, data);
  return data;
}

export async function getSeriesInfo(appSessionToken: string, seriesId: string): Promise<unknown> {
  const session = getSession(appSessionToken);
  const ref = playbackRefs.get(seriesId);
  if (session.mode === "enigma2") {
    const categoryId = ref?.categoryId;
    if (!categoryId) return { info: null, episodes: {} };
    const xml = await enigma2Fetch(session, "get_vod_streams", categoryId);
    const channels = parseE2Xml(xml);
    const episodes: Record<string, SafeEpisode[]> = { "1": [] };
    channels.forEach((ch, i) => {
      const id = makeContentId(
        "series",
        ch.title,
        categoryId,
        ch.streamUrl || `${categoryId}:${ch.title}`,
      );
      remember(id, {
        type: "series",
        mode: "enigma2",
        categoryId,
        url: ch.streamUrl,
        container: "mp4",
      });
      episodes["1"].push({
        id,
        episode_num: i + 1,
        title: ch.title,
        container_extension: "mp4",
        info: { movie_image: ch.descImage },
      });
    });
    return { info: { name: "" }, episodes };
  }

  const streamId = ref?.streamId;
  if (!streamId) return { info: null, episodes: {} };
  const raw = await iptvFetch<Record<string, unknown>>(session, {
    action: "get_series_info",
    series_id: streamId,
  });
  const episodes = raw.episodes as Record<string, Array<Record<string, unknown>>> | undefined;
  if (episodes) {
    for (const eps of Object.values(episodes)) {
      for (const ep of eps) {
        const epId = String(ep.id || "");
        const title = String(ep.title || ep.name || epId);
        const container = String(ep.container_extension || "mp4");
        const id = makeContentId("series", title, streamId, `${epId}.${container}`);
        remember(id, { type: "series", mode: "xtream", streamId: epId, container });
        ep.id = id;
      }
    }
  }
  return raw;
}

export async function getPlaybackUrl(
  appSessionToken: string,
  contentId: string,
  type: ContentType,
): Promise<string> {
  const session = getSession(appSessionToken);
  let ref = playbackRefs.get(contentId);
  if (!ref) {
    if (type === "live") await getLiveStreams(appSessionToken);
    if (type === "movie") await getVodStreams(appSessionToken);
    if (type === "series") await getSeries(appSessionToken);
    ref = playbackRefs.get(contentId);
  }
  if (!ref || ref.type !== type) throw new Error("Conteudo nao encontrado");
  if (ref.mode === "enigma2") {
    if (!ref.url && type === "series" && ref.categoryId)
      await getSeriesInfo(appSessionToken, contentId);
    const refreshed = playbackRefs.get(contentId);
    if (refreshed?.url) return refreshed.url;
    if (ref.url) return ref.url;
    throw new Error("URL de playback nao encontrada");
  }

  const base = getBaseUrl();
  const streamId = ref.streamId;
  if (!streamId) throw new Error("Stream invalido");
  if (type === "live")
    return `${base}/live/${session.username}/${session.password}/${streamId}.${ref.container || "ts"}`;
  if (type === "movie")
    return `${base}/movie/${session.username}/${session.password}/${streamId}.${ref.container || "mp4"}`;
  return `${base}/series/${session.username}/${session.password}/${streamId}.${ref.container || "mp4"}`;
}
