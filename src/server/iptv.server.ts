// IPTV server-only helpers — Xtream API + Enigma2 XML fallback
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
  stream_url?: string;
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
  if (!res.ok) throw new Error(`IPTV API error [${res.status}]`);
  return res.json() as Promise<T>;
}

async function xtreamAvailable(username: string, password: string): Promise<boolean> {
  try {
    const base = getBaseUrl();
    const url = `${base}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const res = await fetch(url, { headers: { "User-Agent": "CentralPlayPlus/1.0" } });
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

// ─── Enigma2 XML API helpers ───

function b64Decode(str: string): string {
  try {
    return atob(str);
  } catch {
    return str;
  }
}

interface E2Channel {
  title: string;
  description: string;
  categoryId: string;
  streamUrl: string;
  descImage: string;
}

async function enigma2Fetch(username: string, password: string, type: string, catId?: string): Promise<string> {
  const base = getBaseUrl();
  let url = `${base}/enigma2?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=${type}`;
  if (catId) url += `&cat_id=${catId}`;
  const res = await fetch(url, { headers: { "User-Agent": "CentralPlayPlus/1.0" } });
  if (!res.ok) throw new Error(`Enigma2 API error [${res.status}]`);
  return res.text();
}

function parseE2Xml(xml: string): E2Channel[] {
  const channels: E2Channel[] = [];
  // Parse <channel> blocks using regex (lightweight, no XML parser needed in Worker)
  const channelRegex = /<channel>([\s\S]*?)<\/channel>/g;
  let match: RegExpExecArray | null;
  while ((match = channelRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const description = extractTag(block, "description");
    const categoryId = extractTag(block, "category_id");
    const streamUrl = extractCdata(block, "stream_url") || extractCdata(block, "playlist_url");
    const descImage = extractCdata(block, "desc_image");

    channels.push({
      title: title ? b64Decode(title) : "",
      description: description ? b64Decode(description) : "",
      categoryId: categoryId || "0",
      streamUrl: streamUrl || "",
      descImage: descImage || "",
    });
  }
  return channels;
}

function extractTag(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1] : "";
}

function extractCdata(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}><!\\[CDATA\\[([^\\]]*?)\\]\\]></${tag}>`));
  return m ? m[1] : "";
}

function parseE2Description(desc: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = desc.split("\n");
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key && val) result[key] = val;
    }
  }
  return result;
}

// ─── Enigma2 category parser ───

function parseE2Categories(xml: string): IptvCategory[] {
  const channels = parseE2Xml(xml);
  // First channel is usually "All" — skip it or include it
  return channels
    .filter(ch => ch.title.toLowerCase() !== "all")
    .map(ch => ({
      category_id: ch.categoryId,
      category_name: ch.title,
      parent_id: 0,
    }));
}

// ─── Enigma2-based data cache ───

interface E2CachedData {
  liveCategories: IptvCategory[];
  vodCategories: IptvCategory[];
  seriesCategories: IptvCategory[];
  liveStreams: Map<string, IptvChannel[]>; // catId -> channels
  vodStreams: Map<string, IptvVodItem[]>;
  seriesStreams: Map<string, IptvSeriesItem[]>;
  allLive: IptvChannel[];
  allVod: IptvVodItem[];
  allSeries: IptvSeriesItem[];
}

const e2Cache = new Map<string, { data: E2CachedData; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function loadE2Categories(username: string, password: string): Promise<{
  liveCategories: IptvCategory[];
  vodCategories: IptvCategory[];
  seriesCategories: IptvCategory[];
}> {
  const [liveXml, vodXml, seriesXml] = await Promise.all([
    enigma2Fetch(username, password, "get_live_categories"),
    enigma2Fetch(username, password, "get_vod_categories"),
    enigma2Fetch(username, password, "get_series_categories"),
  ]);
  return {
    liveCategories: parseE2Categories(liveXml),
    vodCategories: parseE2Categories(vodXml),
    seriesCategories: parseE2Categories(seriesXml),
  };
}

async function loadE2LiveStreams(username: string, password: string, categoryId: string): Promise<IptvChannel[]> {
  const xml = await enigma2Fetch(username, password, "get_live_streams", categoryId);
  const channels = parseE2Xml(xml);
  return channels.map((ch, i) => ({
    num: i + 1,
    name: ch.title,
    stream_type: "live",
    stream_id: i + 1,
    stream_icon: ch.descImage,
    epg_channel_id: null,
    added: "",
    category_id: categoryId,
    custom_sid: "",
    tv_archive: 0,
    direct_source: "",
    tv_archive_duration: 0,
    stream_url: ch.streamUrl,
  }));
}

async function loadE2VodStreams(username: string, password: string, categoryId: string): Promise<IptvVodItem[]> {
  const xml = await enigma2Fetch(username, password, "get_vod_streams", categoryId);
  const channels = parseE2Xml(xml);
  return channels.map((ch, i) => {
    const meta = parseE2Description(ch.description);
    const ratingStr = meta["RATING"] || "0";
    const rating = parseFloat(ratingStr) || 0;
    return {
      num: i + 1,
      name: ch.title,
      stream_type: "movie",
      stream_id: i + 1,
      stream_icon: ch.descImage || meta["COVER_BIG"] || "",
      rating: ratingStr,
      rating_5based: rating > 5 ? rating / 2 : rating,
      added: meta["RELEASEDATE"] || meta["RELEASE_DATE"] || "",
      category_id: categoryId,
      container_extension: "mp4",
      custom_sid: "",
      direct_source: "",
      stream_url: ch.streamUrl,
    };
  });
}

async function loadE2SeriesStreams(username: string, password: string, categoryId: string): Promise<IptvSeriesItem[]> {
  const xml = await enigma2Fetch(username, password, "get_series_categories");
  // For series, we return category info as series items since enigma2 doesn't have series_id
  const channels = parseE2Xml(xml);
  const filtered = channels.filter(ch => ch.categoryId === categoryId || !categoryId);
  return filtered.map((ch, i) => ({
    num: i + 1,
    name: ch.title,
    series_id: parseInt(ch.categoryId) || i + 1,
    cover: ch.descImage || "",
    plot: "",
    cast: "",
    director: "",
    genre: "",
    releaseDate: "",
    last_modified: "",
    rating: "",
    rating_5based: 0,
    backdrop_path: [],
    youtube_trailer: "",
    episode_run_time: "",
    category_id: categoryId || ch.categoryId,
    stream_url: ch.streamUrl,
  }));
}

// ─── Mode detection ───

let _useE2: boolean | null = null;

async function shouldUseE2(username: string, password: string): Promise<boolean> {
  if (_useE2 !== null) return _useE2;
  const ok = await xtreamAvailable(username, password);
  _useE2 = !ok;
  console.log(`[IPTV] Mode: ${_useE2 ? "Enigma2" : "Xtream"}`);
  return _useE2;
}

// ─── Public API (with Xtream → Enigma2 fallback) ───

export async function iptvLogin(username: string, password: string): Promise<IptvAuthResult | { enigma2: true; valid: boolean }> {
  const useE2 = await shouldUseE2(username, password);
  if (!useE2) {
    return iptvFetch<IptvAuthResult>({ username, password });
  }
  // Enigma2 fallback — validate by fetching categories
  try {
    const xml = await enigma2Fetch(username, password, "get_live_categories");
    const valid = xml.includes("<channel>");
    return { enigma2: true, valid };
  } catch (err) {
    console.error("[IPTV] Enigma2 login validation failed:", err);
    return { enigma2: true, valid: false };
  }
}

export async function getLiveCategories(username: string, password: string): Promise<IptvCategory[]> {
  if (await shouldUseE2(username, password)) {
    const xml = await enigma2Fetch(username, password, "get_live_categories");
    return parseE2Categories(xml);
  }
  return iptvFetch<IptvCategory[]>({ username, password, action: "get_live_categories" });
}

export async function getLiveStreams(username: string, password: string, categoryId?: string): Promise<IptvChannel[]> {
  if (await shouldUseE2(username, password)) {
    if (!categoryId) {
      // Load from all categories
      const cats = await getLiveCategories(username, password);
      const allChannels: IptvChannel[] = [];
      // Load first few categories to avoid timeouts
      const catsToLoad = cats.slice(0, 30);
      const results = await Promise.all(
        catsToLoad.map(cat => loadE2LiveStreams(username, password, cat.category_id).catch(() => []))
      );
      let num = 1;
      for (let ci = 0; ci < results.length; ci++) {
        for (const ch of results[ci]) {
          ch.num = num++;
          ch.stream_id = num;
          allChannels.push(ch);
        }
      }
      return allChannels;
    }
    return loadE2LiveStreams(username, password, categoryId);
  }
  const params: Record<string, string> = { username, password, action: "get_live_streams" };
  if (categoryId) params.category_id = categoryId;
  return iptvFetch<IptvChannel[]>(params);
}

export async function getVodCategories(username: string, password: string): Promise<IptvCategory[]> {
  if (await shouldUseE2(username, password)) {
    const xml = await enigma2Fetch(username, password, "get_vod_categories");
    return parseE2Categories(xml);
  }
  return iptvFetch<IptvCategory[]>({ username, password, action: "get_vod_categories" });
}

export async function getVodStreams(username: string, password: string, categoryId?: string): Promise<IptvVodItem[]> {
  if (await shouldUseE2(username, password)) {
    if (!categoryId) {
      const cats = await getVodCategories(username, password);
      const catsToLoad = cats.slice(0, 20);
      const results = await Promise.all(
        catsToLoad.map(cat => loadE2VodStreams(username, password, cat.category_id).catch(() => []))
      );
      const all: IptvVodItem[] = [];
      let num = 1;
      for (const r of results) {
        for (const v of r) {
          v.num = num;
          v.stream_id = num++;
          all.push(v);
        }
      }
      return all;
    }
    return loadE2VodStreams(username, password, categoryId);
  }
  const params: Record<string, string> = { username, password, action: "get_vod_streams" };
  if (categoryId) params.category_id = categoryId;
  return iptvFetch<IptvVodItem[]>(params);
}

export async function getSeriesCategories(username: string, password: string): Promise<IptvCategory[]> {
  if (await shouldUseE2(username, password)) {
    const xml = await enigma2Fetch(username, password, "get_series_categories");
    return parseE2Categories(xml);
  }
  return iptvFetch<IptvCategory[]>({ username, password, action: "get_series_categories" });
}

export async function getSeries(username: string, password: string, categoryId?: string): Promise<IptvSeriesItem[]> {
  if (await shouldUseE2(username, password)) {
    // For enigma2, series categories work differently — list all categories as series items
    const xml = await enigma2Fetch(username, password, "get_series_categories");
    const cats = parseE2Categories(xml);
    return cats.map((cat, i) => ({
      num: i + 1,
      name: cat.category_name,
      series_id: parseInt(cat.category_id) || i + 1,
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
    }));
  }
  const params: Record<string, string> = { username, password, action: "get_series" };
  if (categoryId) params.category_id = categoryId;
  return iptvFetch<IptvSeriesItem[]>(params);
}

export async function getSeriesInfo(username: string, password: string, seriesId: number): Promise<unknown> {
  if (await shouldUseE2(username, password)) {
    // Enigma2: load episodes from the series category
    const xml = await enigma2Fetch(username, password, "get_series_categories");
    const cats = parseE2Categories(xml);
    const cat = cats.find(c => parseInt(c.category_id) === seriesId || c.category_id === String(seriesId));
    if (!cat) return { info: null, episodes: {} };
    // Fetch series streams for this category
    const streamsXml = await enigma2Fetch(username, password, "get_vod_streams", cat.category_id);
    const channels = parseE2Xml(streamsXml);
    const episodes: Record<string, Array<{ id: number; title: string; stream_url: string; cover: string }>> = { "1": [] };
    channels.forEach((ch, i) => {
      episodes["1"].push({
        id: i + 1,
        title: ch.title,
        stream_url: ch.streamUrl,
        cover: ch.descImage,
      });
    });
    return { info: { name: cat.category_name }, episodes };
  }
  return iptvFetch({ username, password, action: "get_series_info", series_id: String(seriesId) });
}

export async function getVodInfo(username: string, password: string, vodId: number): Promise<unknown> {
  if (await shouldUseE2(username, password)) {
    return null; // Limited in enigma2 mode
  }
  return iptvFetch({ username, password, action: "get_vod_info", vod_id: String(vodId) });
}

/** Build a stream URL (Xtream mode) */
export function buildStreamUrl(username: string, password: string, streamId: number, type: "live" | "movie" | "series", container = "ts"): string {
  const base = getBaseUrl();
  if (type === "live") return `${base}/live/${username}/${password}/${streamId}.${container}`;
  if (type === "movie") return `${base}/movie/${username}/${password}/${streamId}.${container}`;
  return `${base}/series/${username}/${password}/${streamId}.${container}`;
}

// Stream URL store for enigma2 mode (populated when loading streams)
const streamUrlStore = new Map<string, string>();

export function registerStreamUrl(key: string, url: string): void {
  streamUrlStore.set(key, url);
}

/** Get stream URL — supports both Xtream and Enigma2 */
export async function getStreamUrl(username: string, password: string, streamId: number, type: "live" | "movie" | "series", container = "ts"): Promise<string> {
  if (await shouldUseE2(username, password)) {
    // Look up from the stored URL
    const key = `${type}:${streamId}`;
    const cached = streamUrlStore.get(key);
    if (cached) return cached;

    // Fallback: reload streams and find the URL
    if (type === "live") {
      const streams = await getLiveStreams(username, password);
      const ch = streams.find(s => s.stream_id === streamId);
      if (ch?.stream_url) return ch.stream_url;
    } else if (type === "movie") {
      const streams = await getVodStreams(username, password);
      const v = streams.find(s => s.stream_id === streamId);
      if (v?.stream_url) return v.stream_url;
    }
    throw new Error("Stream URL not found");
  }
  return buildStreamUrl(username, password, streamId, type, container);
}
