import { createServerFn } from "@tanstack/react-start";
import {
  getTrending,
  getPopularMovies,
  getPopularSeries,
  getTopRatedMovies,
  getNowPlayingMovies,
  getMoviesByGenre,
  getSeriesByGenre,
  searchMulti,
  posterUrl,
  backdropUrl,
  GENRES,
  type TMDBMovie,
} from "./tmdb.server";

export interface ContentItem {
  id: number;
  title: string;
  poster: string;
  backdrop: string;
  overview: string;
  rating: number;
  year: string;
  mediaType: "movie" | "tv";
}

function mapMovie(m: TMDBMovie): ContentItem {
  return {
    id: m.id,
    title: m.title || m.name || "Sem título",
    poster: posterUrl(m.poster_path, "w342"),
    backdrop: backdropUrl(m.backdrop_path),
    overview: m.overview,
    rating: Math.round(m.vote_average * 10) / 10,
    year: (m.release_date || m.first_air_date || "").slice(0, 4),
    mediaType: m.media_type === "tv" || m.name ? "tv" : "movie",
  };
}

export interface ContentSection {
  id: string;
  title: string;
  items: ContentItem[];
}

export const fetchHomeData = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const [
        trending,
        popularMoviesRes,
        popularSeriesRes,
        topRatedRes,
        nowPlayingRes,
        actionRes,
        comedyRes,
        dramaRes,
        horrorRes,
        documentaryRes,
        scifiRes,
        crimeRes,
        animationRes,
      ] = await Promise.all([
        getTrending("all", "week"),
        getPopularMovies(),
        getPopularSeries(),
        getTopRatedMovies(),
        getNowPlayingMovies(),
        getMoviesByGenre(GENRES.ACTION),
        getMoviesByGenre(GENRES.COMEDY),
        getMoviesByGenre(GENRES.DRAMA),
        getMoviesByGenre(GENRES.HORROR),
        getMoviesByGenre(GENRES.DOCUMENTARY),
        getMoviesByGenre(GENRES.SCIFI),
        getMoviesByGenre(GENRES.CRIME),
        getMoviesByGenre(GENRES.ANIMATION),
      ]);

      // Hero: first trending item with backdrop
      const heroItem = trending.find((m) => m.backdrop_path) || trending[0];
      const hero = heroItem ? mapMovie(heroItem) : null;

      const sections: ContentSection[] = [
        { id: "trending", title: "🔥 Em Alta", items: trending.filter((m) => m.poster_path).map(mapMovie) },
        { id: "now_playing", title: "🎬 Em Cartaz", items: nowPlayingRes.results.filter((m) => m.poster_path).map(mapMovie) },
        { id: "popular_movies", title: "🍿 Filmes Populares", items: popularMoviesRes.results.filter((m) => m.poster_path).map(mapMovie) },
        { id: "popular_series", title: "📺 Séries Populares", items: popularSeriesRes.results.filter((m) => m.poster_path).map(mapMovie) },
        { id: "top_rated", title: "⭐ Mais Bem Avaliados", items: topRatedRes.results.filter((m) => m.poster_path).map(mapMovie) },
        { id: "action", title: "💥 Ação e Aventura", items: actionRes.results.filter((m) => m.poster_path).map(mapMovie) },
        { id: "comedy", title: "😂 Comédia", items: comedyRes.results.filter((m) => m.poster_path).map(mapMovie) },
        { id: "drama", title: "🎭 Drama", items: dramaRes.results.filter((m) => m.poster_path).map(mapMovie) },
        { id: "scifi", title: "🚀 Ficção Científica", items: scifiRes.results.filter((m) => m.poster_path).map(mapMovie) },
        { id: "crime", title: "🔍 Crime e Mistério", items: crimeRes.results.filter((m) => m.poster_path).map(mapMovie) },
        { id: "horror", title: "👻 Terror", items: horrorRes.results.filter((m) => m.poster_path).map(mapMovie) },
        { id: "animation", title: "✨ Animação", items: animationRes.results.filter((m) => m.poster_path).map(mapMovie) },
        { id: "documentary", title: "📖 Documentários", items: documentaryRes.results.filter((m) => m.poster_path).map(mapMovie) },
      ];

      return { hero, sections };
    } catch (error) {
      console.error("TMDB fetch error:", error);
      return { hero: null, sections: [] };
    }
  }
);

export const fetchSearch = createServerFn({ method: "GET" })
  .inputValidator((data: { query: string; page?: number }) => data)
  .handler(async ({ data }) => {
    try {
      const res = await searchMulti(data.query, data.page || 1);
      return {
        items: res.results.filter((m) => m.poster_path).map(mapMovie),
        totalPages: res.total_pages,
        totalResults: res.total_results,
      };
    } catch (error) {
      console.error("TMDB search error:", error);
      return { items: [], totalPages: 0, totalResults: 0 };
    }
  });
