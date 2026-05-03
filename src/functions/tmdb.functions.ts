import { createServerFn } from "@tanstack/react-start";
import type { TMDBMovie } from "../server/tmdb.server";

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

export interface ContentSection {
  id: string;
  title: string;
  items: ContentItem[];
}

function mapMovie(m: TMDBMovie): ContentItem {
  const TMDB_IMG = "https://image.tmdb.org/t/p";
  return {
    id: m.id,
    title: m.title || m.name || "Sem título",
    poster: m.poster_path ? `${TMDB_IMG}/w342${m.poster_path}` : "",
    backdrop: m.backdrop_path ? `${TMDB_IMG}/original${m.backdrop_path}` : "",
    overview: m.overview,
    rating: Math.round(m.vote_average * 10) / 10,
    year: (m.release_date || m.first_air_date || "").slice(0, 4),
    mediaType: m.media_type === "tv" || m.name ? "tv" : "movie",
  };
}

function hasTmdbKey(): boolean {
  return !!(process.env.TMDB_READ_TOKEN || process.env.TMDB_API_KEY);
}

async function fetchFromTmdb(): Promise<{ hero: ContentItem | null; sections: ContentSection[] }> {
  const {
    getTrending,
    getPopularMovies,
    getPopularSeries,
    getTopRatedMovies,
    getNowPlayingMovies,
    getMoviesByGenre,
    getSeriesByGenre,
    GENRES,
  } = await import("../server/tmdb.server");

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

  const heroItem = trending.find((m) => m.backdrop_path) || trending[0];
  const hero = heroItem ? mapMovie(heroItem) : null;

  const sections: ContentSection[] = [
    {
      id: "trending",
      title: "🔥 Em Alta",
      items: trending.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "now_playing",
      title: "🎬 Em Cartaz",
      items: nowPlayingRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "popular_movies",
      title: "🍿 Filmes Populares",
      items: popularMoviesRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "popular_series",
      title: "📺 Séries Populares",
      items: popularSeriesRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "top_rated",
      title: "⭐ Mais Bem Avaliados",
      items: topRatedRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "action",
      title: "💥 Ação e Aventura",
      items: actionRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "comedy",
      title: "😂 Comédia",
      items: comedyRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "drama",
      title: "🎭 Drama",
      items: dramaRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "scifi",
      title: "🚀 Ficção Científica",
      items: scifiRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "crime",
      title: "🔍 Crime e Mistério",
      items: crimeRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "horror",
      title: "👻 Terror",
      items: horrorRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "animation",
      title: "✨ Animação",
      items: animationRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
    {
      id: "documentary",
      title: "📖 Documentários",
      items: documentaryRes.results.filter((m) => m.poster_path).map(mapMovie),
    },
  ];

  return { hero, sections };
}

// Demo data using TMDB image paths (public CDN, no API key needed for images)
function getDemoData(): { hero: ContentItem; sections: ContentSection[] } {
  const img = (id: number, type: "poster" | "backdrop" = "poster") => {
    const posters: Record<number, string> = {
      550: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      680: "/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg",
      238: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      278: "/9cqNcoGLjRiIgTGufGMiQ6EpJNN.jpg",
      155: "/qJ2tW6WMUDux911BTUgMe1nNaD3.jpg",
      13: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
      424: "/rplLJ2hPcOQmkFhTqUte0MkEb9a.jpg",
      240: "/dsUgPKJq0kUmbls9x20MbuEA9J2.jpg",
      496243: "/7WsyChQLEftFiDhRuCgFdg0gPnC.jpg",
      299536: "/7WsyChQLEftFiDhRuCgFdg0gPnC.jpg",
      122: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      120: "/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
      101: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      103: "/rjBwhsOzHKUw2NIOrE7aMnPIERo.jpg",
      11: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
      1895: "/sY2mwpafcwqyYS1sOySu1MENfGt.jpg",
      637: "/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg",
      577922: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
      634649: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
      438631: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    };
    const backdrops: Record<number, string> = {
      550: "/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg",
      680: "/fRGxZuo7jJUWQsVzHmGYSjRoQNv.jpg",
      238: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
      278: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
      155: "/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg",
    };
    if (type === "backdrop")
      return backdrops[id] ? `https://image.tmdb.org/t/p/original${backdrops[id]}` : "";
    return posters[id] ? `https://image.tmdb.org/t/p/w342${posters[id]}` : "";
  };

  const demoMovies: ContentItem[] = [
    {
      id: 550,
      title: "Clube da Luta",
      poster: img(550),
      backdrop: img(550, "backdrop"),
      overview:
        "Um homem deprimido que sofre de insônia conhece um estranho vendedor de sabonetes.",
      rating: 8.4,
      year: "1999",
      mediaType: "movie",
    },
    {
      id: 680,
      title: "Pulp Fiction",
      poster: img(680),
      backdrop: img(680, "backdrop"),
      overview:
        "As vidas de dois assassinos da máfia, um boxeador e um casal de ladrões se entrelaçam.",
      rating: 8.5,
      year: "1994",
      mediaType: "movie",
    },
    {
      id: 238,
      title: "O Poderoso Chefão",
      poster: img(238),
      backdrop: img(238, "backdrop"),
      overview:
        "O patriarca de uma família do crime organizado transfere o controle de seu império para seu filho.",
      rating: 8.7,
      year: "1972",
      mediaType: "movie",
    },
    {
      id: 278,
      title: "Um Sonho de Liberdade",
      poster: img(278),
      backdrop: img(278, "backdrop"),
      overview: "Dois homens presos criam laços ao longo dos anos, encontrando consolo e redenção.",
      rating: 8.7,
      year: "1994",
      mediaType: "movie",
    },
    {
      id: 155,
      title: "Batman: O Cavaleiro das Trevas",
      poster: img(155),
      backdrop: img(155, "backdrop"),
      overview: "Batman enfrenta o Coringa, um criminoso que mergulha Gotham no caos.",
      rating: 8.5,
      year: "2008",
      mediaType: "movie",
    },
    {
      id: 13,
      title: "Forrest Gump",
      poster: img(13),
      backdrop: "",
      overview: "A vida de um homem simples que testemunha grandes eventos históricos.",
      rating: 8.5,
      year: "1994",
      mediaType: "movie",
    },
    {
      id: 424,
      title: "A Lista de Schindler",
      poster: img(424),
      backdrop: "",
      overview: "Na Polônia ocupada, Oskar Schindler salva a vida de mais de mil refugiados.",
      rating: 8.6,
      year: "1993",
      mediaType: "movie",
    },
    {
      id: 240,
      title: "O Poderoso Chefão II",
      poster: img(240),
      backdrop: "",
      overview: "A ascensão do jovem Vito Corleone e a expansão do império de Michael.",
      rating: 8.6,
      year: "1974",
      mediaType: "movie",
    },
    {
      id: 122,
      title: "O Senhor dos Anéis: O Retorno do Rei",
      poster: img(122),
      backdrop: "",
      overview: "Gandalf e Aragorn lideram o Mundo dos Homens contra o exército de Sauron.",
      rating: 8.5,
      year: "2003",
      mediaType: "movie",
    },
    {
      id: 120,
      title: "O Senhor dos Anéis: A Sociedade do Anel",
      poster: img(120),
      backdrop: "",
      overview: "Um jovem hobbit deve destruir um poderoso anel antes que caia nas mãos do mal.",
      rating: 8.4,
      year: "2001",
      mediaType: "movie",
    },
    {
      id: 637,
      title: "A Vida é Bela",
      poster: img(637),
      backdrop: "",
      overview:
        "Um pai judeu usa imaginação para proteger seu filho dos horrores de um campo de concentração.",
      rating: 8.5,
      year: "1997",
      mediaType: "movie",
    },
    {
      id: 101,
      title: "Leon: O Profissional",
      poster: img(101),
      backdrop: "",
      overview: "Um assassino profissional resgata e se torna mentor de uma garota de 12 anos.",
      rating: 8.5,
      year: "1994",
      mediaType: "movie",
    },
    {
      id: 577922,
      title: "Tenet",
      poster: img(577922),
      backdrop: "",
      overview: "Um agente secreto embarca numa missão além do tempo real.",
      rating: 7.2,
      year: "2020",
      mediaType: "movie",
    },
    {
      id: 634649,
      title: "Homem-Aranha: Sem Volta para Casa",
      poster: img(634649),
      backdrop: "",
      overview: "Peter Parker pede ajuda ao Doutor Estranho, abrindo o multiverso.",
      rating: 8.0,
      year: "2021",
      mediaType: "movie",
    },
    {
      id: 438631,
      title: "Duna",
      poster: img(438631),
      backdrop: "",
      overview: "A jornada de Paul Atreides no desértico planeta Arrakis.",
      rating: 7.8,
      year: "2021",
      mediaType: "movie",
    },
  ];

  const demoSeries: ContentItem[] = [
    {
      id: 1396,
      title: "Breaking Bad",
      poster: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      backdrop: "",
      overview: "Um professor de química passa a fabricar metanfetamina.",
      rating: 8.9,
      year: "2008",
      mediaType: "tv",
    },
    {
      id: 1399,
      title: "Game of Thrones",
      poster: "https://image.tmdb.org/t/p/w342/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
      backdrop: "",
      overview: "Famílias nobres lutam pelo controle dos Sete Reinos de Westeros.",
      rating: 8.4,
      year: "2011",
      mediaType: "tv",
    },
    {
      id: 66732,
      title: "Stranger Things",
      poster: "https://image.tmdb.org/t/p/w342/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      backdrop: "",
      overview: "Um garoto desaparece e seus amigos enfrentam forças sobrenaturais.",
      rating: 8.6,
      year: "2016",
      mediaType: "tv",
    },
    {
      id: 94997,
      title: "House of the Dragon",
      poster: "https://image.tmdb.org/t/p/w342/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
      backdrop: "",
      overview: "A história da Casa Targaryen, 200 anos antes dos eventos de Game of Thrones.",
      rating: 8.4,
      year: "2022",
      mediaType: "tv",
    },
    {
      id: 100088,
      title: "The Last of Us",
      poster: "https://image.tmdb.org/t/p/w342/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
      backdrop: "",
      overview: "Joel e Ellie atravessam os EUA devastados por uma pandemia.",
      rating: 8.8,
      year: "2023",
      mediaType: "tv",
    },
    {
      id: 76479,
      title: "The Boys",
      poster: "https://image.tmdb.org/t/p/w342/stTEycfG9Ngkep3LTaoKhQwYZIg.jpg",
      backdrop: "",
      overview: "Vigilantes combatem super-heróis corruptos com superpoderes.",
      rating: 8.5,
      year: "2019",
      mediaType: "tv",
    },
    {
      id: 1402,
      title: "The Walking Dead",
      poster: "https://image.tmdb.org/t/p/w342/xf9wuDcqlUPWABZNeDKPbZUjWx0.jpg",
      backdrop: "",
      overview: "Um grupo de sobreviventes luta para sobreviver em um mundo dominado por zumbis.",
      rating: 8.1,
      year: "2010",
      mediaType: "tv",
    },
    {
      id: 84958,
      title: "Loki",
      poster: "https://image.tmdb.org/t/p/w342/voHUmluYmKyleFkTu3lOXQG702u.jpg",
      backdrop: "",
      overview: "O Deus da Trapaça entra em um misterioso mundo burocrático.",
      rating: 8.2,
      year: "2021",
      mediaType: "tv",
    },
  ];

  const hero = demoMovies[0];

  const sections: ContentSection[] = [
    {
      id: "trending",
      title: "🔥 Em Alta",
      items: [...demoMovies.slice(0, 8), ...demoSeries.slice(0, 4)],
    },
    { id: "popular_movies", title: "🍿 Filmes Populares", items: demoMovies },
    { id: "popular_series", title: "📺 Séries Populares", items: demoSeries },
    {
      id: "top_rated",
      title: "⭐ Mais Bem Avaliados",
      items: [...demoMovies.filter((m) => m.rating >= 8.5)],
    },
    {
      id: "action",
      title: "💥 Ação e Aventura",
      items: demoMovies.filter((m) => [155, 122, 120, 634649, 438631, 577922].includes(m.id)),
    },
    {
      id: "drama",
      title: "🎭 Drama",
      items: demoMovies.filter((m) => [550, 238, 278, 424, 240, 637, 101].includes(m.id)),
    },
    {
      id: "scifi",
      title: "🚀 Ficção Científica",
      items: [
        ...demoMovies.filter((m) => [577922, 438631].includes(m.id)),
        ...demoSeries.filter((s) => [66732, 100088].includes(s.id)),
      ],
    },
    {
      id: "crime",
      title: "🔍 Crime e Mistério",
      items: [
        ...demoMovies.filter((m) => [680, 238, 240, 101].includes(m.id)),
        ...demoSeries.filter((s) => [1396].includes(s.id)),
      ],
    },
  ];

  return { hero, sections };
}

export const fetchHomeData = createServerFn({ method: "GET" }).handler(async () => {
  if (hasTmdbKey()) {
    try {
      return await fetchFromTmdb();
    } catch (error) {
      console.error("TMDB fetch error, using demo data:", error);
      return getDemoData();
    }
  }
  // No TMDB key — use demo data with real TMDB image URLs
  console.log("TMDB: No API key configured, using demo data");
  return getDemoData();
});

export const fetchSearch = createServerFn({ method: "GET" })
  .inputValidator((data: { query: string; page?: number }) => data)
  .handler(async ({ data }) => {
    if (!hasTmdbKey()) {
      const demo = getDemoData();
      const q = data.query.toLowerCase();
      const items = demo.sections
        .flatMap((s) => s.items)
        .filter((i) => i.title.toLowerCase().includes(q));
      return { items, totalPages: 1, totalResults: items.length };
    }
    try {
      const { searchMulti } = await import("../server/tmdb.server");
      const res = await searchMulti(data.query, data.page || 1);
      return {
        items: res.results
          .filter((m) => m.poster_path)
          .map((m) => ({
            id: m.id,
            title: m.title || m.name || "Sem título",
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : "",
            backdrop: m.backdrop_path
              ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
              : "",
            overview: m.overview,
            rating: Math.round(m.vote_average * 10) / 10,
            year: (m.release_date || m.first_air_date || "").slice(0, 4),
            mediaType: (m.media_type === "tv" || m.name ? "tv" : "movie") as "movie" | "tv",
          })),
        totalPages: res.total_pages,
        totalResults: res.total_results,
      };
    } catch (error) {
      console.error("TMDB search error:", error);
      return { items: [], totalPages: 0, totalResults: 0 };
    }
  });
