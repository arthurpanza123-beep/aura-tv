// TMDB API server-side functions
// Docs: https://developer.themoviedb.org/reference

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p";

// TMDB API key — get a free one at https://www.themoviedb.org/settings/api
function getApiKey(): string {
  return process.env.TMDB_API_KEY || "";
}

function getReadToken(): string {
  return process.env.TMDB_READ_TOKEN || "";
}

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export function posterUrl(path: string | null, size = "w500"): string {
  if (!path) return "";
  return `${TMDB_IMG}/${size}${path}`;
}

export function backdropUrl(path: string | null, size = "original"): string {
  if (!path) return "";
  return `${TMDB_IMG}/${size}${path}`;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("region", "BR");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const apiKey = getApiKey();
  const readToken = getReadToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (readToken) {
    headers["Authorization"] = `Bearer ${readToken}`;
  } else if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  } else {
    throw new Error(
      "TMDB API: Nenhuma chave configurada. Adicione TMDB_API_KEY ou TMDB_READ_TOKEN.",
    );
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    throw new Error(`TMDB API error [${res.status}]: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export async function getTrending(
  mediaType: "movie" | "tv" | "all" = "all",
  timeWindow: "day" | "week" = "week",
): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBResponse>(`/trending/${mediaType}/${timeWindow}`);
  return data.results;
}

export async function getPopularMovies(page = 1): Promise<TMDBResponse> {
  return tmdbFetch<TMDBResponse>("/movie/popular", { page: String(page) });
}

export async function getPopularSeries(page = 1): Promise<TMDBResponse> {
  return tmdbFetch<TMDBResponse>("/tv/popular", { page: String(page) });
}

export async function getTopRatedMovies(page = 1): Promise<TMDBResponse> {
  return tmdbFetch<TMDBResponse>("/movie/top_rated", { page: String(page) });
}

export async function getTopRatedSeries(page = 1): Promise<TMDBResponse> {
  return tmdbFetch<TMDBResponse>("/tv/top_rated", { page: String(page) });
}

export async function getNowPlayingMovies(page = 1): Promise<TMDBResponse> {
  return tmdbFetch<TMDBResponse>("/movie/now_playing", { page: String(page) });
}

export async function getMoviesByGenre(genreId: number, page = 1): Promise<TMDBResponse> {
  return tmdbFetch<TMDBResponse>("/discover/movie", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
    page: String(page),
  });
}

export async function getSeriesByGenre(genreId: number, page = 1): Promise<TMDBResponse> {
  return tmdbFetch<TMDBResponse>("/discover/tv", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
    page: String(page),
  });
}

export async function searchMulti(query: string, page = 1): Promise<TMDBResponse> {
  return tmdbFetch<TMDBResponse>("/search/multi", {
    query,
    page: String(page),
  });
}

// Genre IDs for reference
export const GENRES = {
  ACTION: 28,
  ADVENTURE: 12,
  COMEDY: 35,
  DRAMA: 18,
  HORROR: 27,
  THRILLER: 53,
  SCIFI: 878,
  ROMANCE: 10749,
  ANIMATION: 16,
  DOCUMENTARY: 99,
  CRIME: 80,
  FAMILY: 10751,
} as const;
