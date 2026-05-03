import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
});

const sessionSchema = z.object({
  appSessionToken: z.string().min(10).max(100),
});

const sessionWithCat = sessionSchema.extend({
  categoryId: z.string().max(100).optional(),
});

export const iptvLoginFn = createServerFn({ method: "POST" })
  .inputValidator((data) => credSchema.parse(data))
  .handler(async ({ data }) => {
    const { createAppSession } = await import("../server/iptv.server");
    try {
      const result = await createAppSession(data.username, data.password);
      return {
        success: true as const,
        mode: result.mode,
        appSessionToken: result.appSessionToken,
        user: result.user,
      };
    } catch (err) {
      console.error("IPTV login error:", err);
      return { success: false as const, error: "Usuario ou senha invalidos." };
    }
  });

export const fetchLiveCategoriesFn = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { getLiveCategories } = await import("../server/iptv.server");
    return getLiveCategories(data.appSessionToken);
  });

export const fetchLiveStreamsFn = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionWithCat.parse(data))
  .handler(async ({ data }) => {
    const { getLiveStreams } = await import("../server/iptv.server");
    return getLiveStreams(data.appSessionToken, data.categoryId);
  });

export const fetchVodCategoriesFn = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { getVodCategories } = await import("../server/iptv.server");
    return getVodCategories(data.appSessionToken);
  });

export const fetchVodStreamsFn = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionWithCat.parse(data))
  .handler(async ({ data }) => {
    const { getVodStreams } = await import("../server/iptv.server");
    return getVodStreams(data.appSessionToken, data.categoryId);
  });

export const fetchSeriesCategoriesFn = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionSchema.parse(data))
  .handler(async ({ data }) => {
    const { getSeriesCategories } = await import("../server/iptv.server");
    return getSeriesCategories(data.appSessionToken);
  });

export const fetchSeriesFn = createServerFn({ method: "POST" })
  .inputValidator((data) => sessionWithCat.parse(data))
  .handler(async ({ data }) => {
    const { getSeries } = await import("../server/iptv.server");
    return getSeries(data.appSessionToken, data.categoryId);
  });

export const fetchSeriesInfoFn = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    sessionSchema
      .extend({
        seriesId: z.string().min(1).max(100),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<{ info: string }> => {
    const { getSeriesInfo } = await import("../server/iptv.server");
    const result = await getSeriesInfo(data.appSessionToken, data.seriesId);
    return { info: JSON.stringify(result) };
  });

export const getPlaybackUrlFn = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    sessionSchema
      .extend({
        contentId: z.string().min(1).max(100),
        type: z.enum(["live", "movie", "series"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { getPlaybackUrl } = await import("../server/iptv.server");
    const url = await getPlaybackUrl(data.appSessionToken, data.contentId, data.type);
    return { url };
  });
