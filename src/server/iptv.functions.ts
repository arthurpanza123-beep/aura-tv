import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
});

const credWithCat = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
  categoryId: z.string().max(20).optional(),
});

export const iptvLoginFn = createServerFn({ method: "POST" })
  .inputValidator((data) => credSchema.parse(data))
  .handler(async ({ data }) => {
    const { iptvLogin } = await import("./iptv.server");
    try {
      const result = await iptvLogin(data.username, data.password);
      if (!result.user_info || result.user_info.status !== "Active") {
        return { success: false, error: "Conta inativa ou credenciais inválidas" };
      }
      return {
        success: true,
        user: {
          status: result.user_info.status,
          expDate: result.user_info.exp_date,
          isTrial: result.user_info.is_trial,
          activeCons: result.user_info.active_cons,
          maxConnections: result.user_info.max_connections,
          createdAt: result.user_info.created_at,
        },
      };
    } catch (err) {
      console.error("IPTV login error:", err);
      return { success: false, error: "Erro ao conectar ao servidor" };
    }
  });

export const fetchLiveCategoriesFn = createServerFn({ method: "POST" })
  .inputValidator((data) => credSchema.parse(data))
  .handler(async ({ data }) => {
    const { getLiveCategories } = await import("./iptv.server");
    return getLiveCategories(data.username, data.password);
  });

export const fetchLiveStreamsFn = createServerFn({ method: "POST" })
  .inputValidator((data) => credWithCat.parse(data))
  .handler(async ({ data }) => {
    const { getLiveStreams } = await import("./iptv.server");
    return getLiveStreams(data.username, data.password, data.categoryId);
  });

export const fetchVodCategoriesFn = createServerFn({ method: "POST" })
  .inputValidator((data) => credSchema.parse(data))
  .handler(async ({ data }) => {
    const { getVodCategories } = await import("./iptv.server");
    return getVodCategories(data.username, data.password);
  });

export const fetchVodStreamsFn = createServerFn({ method: "POST" })
  .inputValidator((data) => credWithCat.parse(data))
  .handler(async ({ data }) => {
    const { getVodStreams } = await import("./iptv.server");
    return getVodStreams(data.username, data.password, data.categoryId);
  });

export const fetchSeriesCategoriesFn = createServerFn({ method: "POST" })
  .inputValidator((data) => credSchema.parse(data))
  .handler(async ({ data }) => {
    const { getSeriesCategories } = await import("./iptv.server");
    return getSeriesCategories(data.username, data.password);
  });

export const fetchSeriesFn = createServerFn({ method: "POST" })
  .inputValidator((data) => credWithCat.parse(data))
  .handler(async ({ data }) => {
    const { getSeries } = await import("./iptv.server");
    return getSeries(data.username, data.password, data.categoryId);
  });

export const fetchSeriesInfoFn = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
    seriesId: z.number(),
  }).parse(data))
  .handler(async ({ data }): Promise<{ info: string }> => {
    const { getSeriesInfo } = await import("./iptv.server");
    const result = await getSeriesInfo(data.username, data.password, data.seriesId);
    return { info: JSON.stringify(result) };
  });

export const getStreamUrlFn = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
    streamId: z.number(),
    type: z.enum(["live", "movie", "series"]),
    container: z.string().max(10).optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { buildStreamUrl } = await import("./iptv.server");
    return { url: buildStreamUrl(data.username, data.password, data.streamId, data.type, data.container || "ts") };
  });
