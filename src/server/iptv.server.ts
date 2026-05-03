// IPTV Xtream Codes API — server-only helpers
// DNS is read from the IPTV_BASE_URL secret at runtime

function getBaseUrl(): string {
  const url = process.env.IPTV_BASE_URL;
  if (!url) throw new Error("IPTV_BASE_URL not configured");
  return url.replace(/\/+$/, "");
}

export interface IptvUserInfo {
  username: string;
  password: string;
  status: string;
  exp_date: string;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
}

export interface IptvAuthResult {
  user_info: IptvUserInfo;
  server_info: {
    url: string;
    port: string;
    https_port: string;
    server_protocol: string;
    rtmp_port: string;
    timezone: string;
  };
}

export interface IptvCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface IptvChannel {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string | null;
  added: string;
  category_id: string;
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
}

export interface IptvVodItem {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  rating: string;
  rating_5based: number;
  added: string;
  category_id: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
}

export interface IptvSeriesItem {
  num: number;
  name: string;
  series_id: number;
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

async function iptvFetch<T>(params: Record<string, string>): Promise<T> {
  const base = getBaseUrl();
  const url = new URL(`${base}/player_api.php`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "CentralPlayPlus/1.0" },
  });
  if (!res.ok) {
    throw new Error(`IPTV API error [${res.status}]`);
  }
  return res.json() as Promise<T>;
}

export async function iptvLogin(username: string, password: string): Promise<IptvAuthResult> {
  return iptvFetch<IptvAuthResult>({ username, password });
}

export async function getLiveCategories(username: string, password: string): Promise<IptvCategory[]> {
  return iptvFetch<IptvCategory[]>({ username, password, action: "get_live_categories" });
}

export async function getLiveStreams(username: string, password: string, categoryId?: string): Promise<IptvChannel[]> {
  const params: Record<string, string> = { username, password, action: "get_live_streams" };
  if (categoryId) params.category_id = categoryId;
  return iptvFetch<IptvChannel[]>(params);
}

export async function getVodCategories(username: string, password: string): Promise<IptvCategory[]> {
  return iptvFetch<IptvCategory[]>({ username, password, action: "get_vod_categories" });
}

export async function getVodStreams(username: string, password: string, categoryId?: string): Promise<IptvVodItem[]> {
  const params: Record<string, string> = { username, password, action: "get_vod_streams" };
  if (categoryId) params.category_id = categoryId;
  return iptvFetch<IptvVodItem[]>(params);
}

export async function getSeriesCategories(username: string, password: string): Promise<IptvCategory[]> {
  return iptvFetch<IptvCategory[]>({ username, password, action: "get_series_categories" });
}

export async function getSeries(username: string, password: string, categoryId?: string): Promise<IptvSeriesItem[]> {
  const params: Record<string, string> = { username, password, action: "get_series" };
  if (categoryId) params.category_id = categoryId;
  return iptvFetch<IptvSeriesItem[]>(params);
}

export async function getSeriesInfo(username: string, password: string, seriesId: number): Promise<unknown> {
  return iptvFetch({ username, password, action: "get_series_info", series_id: String(seriesId) });
}

export async function getVodInfo(username: string, password: string, vodId: number): Promise<unknown> {
  return iptvFetch({ username, password, action: "get_vod_info", vod_id: String(vodId) });
}

/** Build a stream URL (live, VOD, or series episode) */
export function buildStreamUrl(username: string, password: string, streamId: number, type: "live" | "movie" | "series", container = "ts"): string {
  const base = getBaseUrl();
  if (type === "live") {
    return `${base}/live/${username}/${password}/${streamId}.${container}`;
  }
  if (type === "movie") {
    return `${base}/movie/${username}/${password}/${streamId}.${container}`;
  }
  return `${base}/series/${username}/${password}/${streamId}.${container}`;
}
