
# Redesign Central Play Plus — Estilo Netflix/HBO Max com TMDB

Redesign completo da interface para parecer com Netflix, HBO Max, Claro TV+. Capas de filmes/séries reais buscadas automaticamente da API TMDB. Arquitetura escalável.

## Mudanças Principais

### 1. Integração TMDB API (capas automáticas reais)

- Usar a API pública do TMDB (The Movie Database) para buscar capas, títulos, sinopses e avaliações reais
- Poster URL: `https://image.tmdb.org/t/p/w500/{poster_path}`
- Backdrop URL: `https://image.tmdb.org/t/p/original/{backdrop_path}`
- Server function para buscar dados (protege a API key)
- Categorias dinâmicas: Trending, Popular, Top Rated, Em Cartaz, Por Gênero
- Pronta para escalar a 100k+ títulos (paginação por API)

### 2. Layout Estilo Netflix/HBO Max

- **Hero banner gigante** com backdrop real do filme em destaque, logo do filme, sinopse, nota, botões "Assistir" e "Mais Info"
- **Múltiplas fileiras** de conteúdo com scroll horizontal suave:
  - "Em Alta" (trending)
  - "Filmes Populares"
  - "Séries Populares"
  - "Top 10 Filmes"
  - "Ação e Aventura"
  - "Comédia"
  - "Drama"
  - "Terror"
  - "Documentários"
  - "Canais ao Vivo" (dados estáticos com logos)
- Cards maiores estilo Netflix (poster ratio 2:3)
- Hover/focus: zoom + borda glow + info overlay com título, ano, nota

### 3. Navegação Superior (estilo Claro TV+)

- Logo à esquerda
- Links: Início, Filmes, Séries, Canais ao Vivo, Minha Lista
- Ícone de busca e perfil à direita
- Background transparente que escurece ao scroll
- Lucide icons em vez de emojis

### 4. Tela de Login (melhorada)

- Mantém layout atual mas com fundo mais cinematográfico
- Blur backdrop com collage de posters

### 5. Arquitetura Escalável

- `src/server/tmdb.server.ts` — funções de acesso à API TMDB
- `src/server/tmdb.functions.ts` — server functions expostas ao client
- `src/components/tv/ContentRow.tsx` — componente reutilizável de fileira
- `src/components/tv/HeroBanner.tsx` — banner principal
- `src/components/tv/ContentCard.tsx` — card individual
- `src/components/tv/Navbar.tsx` — navegação
- Lazy loading de imagens, intersection observer para carregar fileiras sob demanda
- Dados cacheados via React Query

### 6. Arquivos Criados/Modificados

| Arquivo | Ação |
|---------|------|
| `src/server/tmdb.server.ts` | Criar — queries TMDB |
| `src/server/tmdb.functions.ts` | Criar — server functions |
| `src/components/tv/Navbar.tsx` | Criar — nav superior |
| `src/components/tv/HeroBanner.tsx` | Criar — hero banner |
| `src/components/tv/ContentRow.tsx` | Criar — fileira de cards |
| `src/components/tv/ContentCard.tsx` | Criar — card individual |
| `src/routes/home.tsx` | Reescrever — composição das fileiras |
| `src/routes/index.tsx` | Ajustar — login melhorado |
| `src/styles.css` | Ajustar — tokens extras |

### Nota sobre API Key

A TMDB API v3 usa uma key pública (read-only, sem dados sensíveis). Será armazenada como variável de ambiente no servidor para boas práticas, com fallback para uma key de demonstração embutida.
