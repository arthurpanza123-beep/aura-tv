// IPTV server-only helpers — Xtream API + M3U fallback
// DNS is read from the IPTV_BASE_URL secret at runtime

function getBaseUrl(): string {
  const url = process.env.IPTV_BASE_URL;
  if (!url) throw new Error("IPTV_BASE_URL not configured");
  return url.replace(/\/+$/, "");
}

// ─── Shared interfaces ───

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
  stream_url?: string; // populated from M3U
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
  stream_url?: string;
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
  stream_url?: string;
}

// ─── Xtream API helpers ───

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

async function xtreamAvailable(username: string, password: string): Promise<boolean> {
  try {
    const base = getBaseUrl();
    const url = `${base}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "CentralPlayPlus/1.0" },
    });
    if (!res.ok) return false;
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return !!json.user_info;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

// ─── M3U Parser ───

interface M3uEntry {
  name: string;
  logo: string;
  group: string;
  url: string;
  tvgId: string;
  tvgName: string;
}

async function fetchM3u(username: string, password: string): Promise<string> {
  const base = getBaseUrl();
  const url = `${base}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=m3u_plus&output=mpegts`;
  const res = await fetch(url, {
    headers: { "User-Agent": "CentralPlayPlus/1.0" },
  });
  if (!res.ok) throw new Error(`M3U fetch error [${res.status}]`);
  const text = await res.text();
  if (!text.trim().startsWith("#EXTM3U")) {
    throw new Error("Invalid M3U response");
  }
  return text;
}

function parseM3u(content: string): M3uEntry[] {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  const entries: M3uEntry[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("#EXTINF")) continue;
    const info = lines[i];
    const urlLine = lines[i + 1];
    if (!urlLine || urlLine.startsWith("#")) continue;

    const tvgName = extractAttr(info, "tvg-name");
    const logo = extractAttr(info, "tvg-logo");
    const group = extractAttr(info, "group-title");
    const tvgId = extractAttr(info, "tvg-id");
    // Display name is after the last comma
    const commaIdx = info.lastIndexOf(",");
    const displayName = commaIdx >= 0 ? info.slice(commaIdx + 1).trim() : tvgName;

    entries.push({
      name: displayName || tvgName || "Sem nome",
      logo,
      group,
      url: urlLine,
      tvgId,
      tvgName,
    });
  }
  return entries;
}

function extractAttr(line: string, attr: string): string {
  const regex = new RegExp(`${attr}="([^"]*)"`, "i");
  const m = line.match(regex);
  return m ? m[1] : "";
}

// ─── Content classification ───

type ContentType = "live" | "movie" | "series" | "other";

function classifyEntry(entry: M3uEntry): ContentType {
  const url = entry.url.toLowerCase();
  const group = entry.group.toLowerCase();

  if (url.includes("/live/") || url.endsWith(".ts")) return "live";
  if (url.includes("/movie/")) return "movie";
  if (url.includes("/series/")) return "series";

  // Heuristics based on group name
  const liveKeywords = ["ao vivo", "live", "canais", "channels", "tv", "aberto", "esporte", "sport", "news", "notícia", "24h", "adulto", "xxx"];
  const movieKeywords = ["filme", "filmes", "movie", "movies", "cinema", "ação", "action", "comédia", "comedy", "terror", "horror", "drama", "aventura", "ficção", "animação", "documentário", "documentary", "romance", "thriller", "suspense", "guerra", "war"];
  const seriesKeywords = ["série", "séries", "series", "novela", "novelas", "temporada", "season", "episódio", "episode", "anime", "animes", "cartoon", "desenho"];

  if (liveKeywords.some(k => group.includes(k))) return "live";
  if (movieKeywords.some(k => group.includes(k))) return "movie";
  if (seriesKeywords.some(k => group.includes(k))) return "series";

  return "other";
}

// ─── M3U-based data cache (per-user, in-memory for request lifetime) ───

interface M3uParsedData {
  entries: M3uEntry[];
  live: M3uEntry[];
  movies: M3uEntry[];
  series: M3uEntry[];
  other: M3uEntry[];
  liveCategories: IptvCategory[];
  movieCategories: IptvCategory[];
  seriesCategories: IptvCategory[];
}

const m3uCache = new Map<string, { data: M3uParsedData; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 min

async function getM3uData(username: string, password: string): Promise<M3uParsedData> {
  const key = `${username}:${password}`;
  const cached = m3uCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const raw = await fetchM3u(username, password);
  const entries = parseM3u(raw);

  const live: M3uEntry[] = [];
  const movies: M3uEntry[] = [];
  const series: M3uEntry[] = [];
  const other: M3uEntry[] = [];

  for (const e of entries) {
    const type = classifyEntry(e);
    if (type === "live") live.push(e);
    else if (type === "movie") movies.push(e);
    else if (type === "series") series.push(e);
    else other.push(e);
  }

  const liveCategories = extractCategories(live);
  const movieCategories = extractCategories(movies);
  const seriesCategories = extractCategories(series);

  const data: M3uParsedData = { entries, live, movies, series, other, liveCategories, movieCategories, seriesCategories };
  m3uCache.set(key, { data, ts: Date.now() });
  return data;
}

function extractCategories(items: M3uEntry[]): IptvCategory[] {
  const groups = new Map<string, number>();
  for (const item of items) {
    const g = item.group || "Outros";
    groups.set(g, (groups.get(g) || 0) + 1);
  }
  let id = 1;
  return Array.from(groups.keys())
    .sort()
    .map(name => ({
      category_id: String(id++),
      category_name: name,
      parent_id: 0,
    }));
}

function groupToCatId(categories: IptvCategory[], groupName: string): string {
  const cat = categories.find(c => c.category_name === (groupName || "Outros"));
  return cat ? cat.category_id : "0";
}

// Convert M3U entries to channel/vod/series interfaces
function m3uToChannels(items: M3uEntry[], categories: IptvCategory[]): IptvChannel[] {
  return items.map((e, i) => ({
    num: i + 1,
    name: e.name,
    stream_type: "live",
    stream_id: i + 1,
    stream_icon: e.logo,
    epg_channel_id: e.tvgId || null,
    added: "",
    category_id: groupToCatId(categories, e.group),
    custom_sid: "",
    tv_archive: 0,
    direct_source: "",
    tv_archive_duration: 0,
    stream_url: e.url,
  }));
}

function m3uToVod(items: M3uEntry[], categories: IptvCategory[]): IptvVodItem[] {
  return items.map((e, i) => ({
    num: i + 1,
    name: e.name,
    stream_type: "movie",
    stream_id: i + 1,
    stream_icon: e.logo,
    rating: "",
    rating_5based: 0,
    added: "",
    category_id: groupToCatId(categories, e.group),
    container_extension: e.url.split(".").pop()?.split("?")[0] || "mp4",
    custom_sid: "",
    direct_source: "",
    stream_url: e.url,
  }));
}

function m3uToSeries(items: M3uEntry[], categories: IptvCategory[]): IptvSeriesItem[] {
  return items.map((e, i) => ({
    num: i + 1,
    name: e.name,
    series_id: i + 1,
    cover: e.logo,
    plot: "",
    cast: "",
    director: "",
    genre: e.group,
    releaseDate: "",
    last_modified: "",
    rating: "",
    rating_5based: 0,
    backdrop_path: [],
    youtube_trailer: "",
    episode_run_time: "",
    category_id: groupToCatId(categories, e.group),
    stream_url: e.url,
  }));
}

// ─── Public API (with Xtream→M3U fallback) ───

let _useM3u: boolean | null = null;

async function shouldUseM3u(username: string, password: string): Promise<boolean> {
  if (_useM3u !== null) return _useM3u;
  const ok = await xtreamAvailable(username, password);
  _useM3u = !ok;
  console.log(`[IPTV] Mode: ${_useM3u ? "M3U" : "Xtream"}`);
  return _useM3u;
}

export async function iptvLogin(username: string, password: string): Promise<IptvAuthResult | { m3u: true; valid: boolean; totalItems: number }> {
  // Try Xtream first
  const useM3u = await shouldUseM3u(username, password);
  if (!useM3u) {
    return iptvFetch<IptvAuthResult>({ username, password });
  }
  // M3U fallback — validate by fetching M3U
  try {
    const data = await getM3uData(username, password);
    return {
      m3u: true,
      valid: data.entries.length > 0,
      totalItems: data.entries.length,
    };
  } catch (err) {
    console.error("[IPTV] M3U login validation failed:", err);
    return { m3u: true, valid: false, totalItems: 0 };
  }
}

export async function getLiveCategories(username: string, password: string): Promise<IptvCategory[]> {
  if (await shouldUseM3u(username, password)) {
    const data = await getM3uData(username, password);
    return data.liveCategories;
  }
  return iptvFetch<IptvCategory[]>({ username, password, action: "get_live_categories" });
}

export async function getLiveStreams(username: string, password: string, categoryId?: string): Promise<IptvChannel[]> {
  if (await shouldUseM3u(username, password)) {
    const data = await getM3uData(username, password);
    const channels = m3uToChannels(data.live, data.liveCategories);
    if (categoryId) return channels.filter(c => c.category_id === categoryId);
    return channels;
  }
  const params: Record<string, string> = { username, password, action: "get_live_streams" };
  if (categoryId) params.category_id = categoryId;
  return iptvFetch<IptvChannel[]>(params);
}

export async function getVodCategories(username: string, password: string): Promise<IptvCategory[]> {
  if (await shouldUseM3u(username, password)) {
    const data = await getM3uData(username, password);
    return data.movieCategories;
  }
  return iptvFetch<IptvCategory[]>({ username, password, action: "get_vod_categories" });
}

export async function getVodStreams(username: string, password: string, categoryId?: string): Promise<IptvVodItem[]> {
  if (await shouldUseM3u(username, password)) {
    const data = await getM3uData(username, password);
    const vods = m3uToVod(data.movies, data.movieCategories);
    if (categoryId) return vods.filter(v => v.category_id === categoryId);
    return vods;
  }
  const params: Record<string, string> = { username, password, action: "get_vod_streams" };
  if (categoryId) params.category_id = categoryId;
  return iptvFetch<IptvVodItem[]>(params);
}

export async function getSeriesCategories(username: string, password: string): Promise<IptvCategory[]> {
  if (await shouldUseM3u(username, password)) {
    const data = await getM3uData(username, password);
    return data.seriesCategories;
  }
  return iptvFetch<IptvCategory[]>({ username, password, action: "get_series_categories" });
}

export async function getSeries(username: string, password: string, categoryId?: string): Promise<IptvSeriesItem[]> {
  if (await shouldUseM3u(username, password)) {
    const data = await getM3uData(username, password);
    const seriesList = m3uToSeries(data.series, data.seriesCategories);
    if (categoryId) return seriesList.filter(s => s.category_id === categoryId);
    return seriesList;
  }
  const params: Record<string, string> = { username, password, action: "get_series" };
  if (categoryId) params.category_id = categoryId;
  return iptvFetch<IptvSeriesItem[]>(params);
}

export async function getSeriesInfo(username: string, password: string, seriesId: number): Promise<unknown> {
  if (await shouldUseM3u(username, password)) {
    // For M3U, series info is limited — return the entry as-is
    const data = await getM3uData(username, password);
    const seriesList = m3uToSeries(data.series, data.seriesCategories);
    const item = seriesList.find(s => s.series_id === seriesId);
    return item ? { info: item, episodes: {} } : { info: null, episodes: {} };
  }
  return iptvFetch({ username, password, action: "get_series_info", series_id: String(seriesId) });
}

export async function getVodInfo(username: string, password: string, vodId: number): Promise<unknown> {
  if (await shouldUseM3u(username, password)) {
    const data = await getM3uData(username, password);
    const vods = m3uToVod(data.movies, data.movieCategories);
    return vods.find(v => v.stream_id === vodId) || null;
  }
  return iptvFetch({ username, password, action: "get_vod_info", vod_id: String(vodId) });
}

/** Build a stream URL (live, VOD, or series episode) */
export function buildStreamUrl(username: string, password: string, streamId: number, type: "live" | "movie" | "series", container = "ts"): string {
  const base = getBaseUrl();
  if (type === "live") return `${base}/live/${username}/${password}/${streamId}.${container}`;
  if (type === "movie") return `${base}/movie/${username}/${password}/${streamId}.${container}`;
  return `${base}/series/${username}/${password}/${streamId}.${container}`;
}

/** Get stream URL — supports M3U direct URLs */
export async function getStreamUrl(username: string, password: string, streamId: number, type: "live" | "movie" | "series", container = "ts"): Promise<string> {
  if (await shouldUseM3u(username, password)) {
    const data = await getM3uData(username, password);
    let items: M3uEntry[];
    if (type === "live") items = data.live;
    else if (type === "movie") items = data.movies;
    else items = data.series;
    // streamId is 1-based index for M3U
    const entry = items[streamId - 1];
    if (entry) return entry.url;
    throw new Error("Stream not found");
  }
  return buildStreamUrl(username, password, streamId, type, container);
}

/** Get M3U stats for diagnostics */
export async function getM3uStats(username: string, password: string): Promise<{
  totalItems: number;
  liveCount: number;
  movieCount: number;
  seriesCount: number;
  otherCount: number;
  liveCategoriesCount: number;
  movieCategoriesCount: number;
  seriesCategoriesCount: number;
}> {
  const data = await getM3uData(username, password);
  return {
    totalItems: data.entries.length,
    liveCount: data.live.length,
    movieCount: data.movies.length,
    seriesCount: data.series.length,
    otherCount: data.other.length,
    liveCategoriesCount: data.liveCategories.length,
    movieCategoriesCount: data.movieCategories.length,
    seriesCategoriesCount: data.seriesCategories.length,
  };
}
