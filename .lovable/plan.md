
# Central Play Plus — Smart TV IPTV App

A premium Smart TV streaming interface with two main screens, dark theme with blue accents, and simulated remote control navigation.

## Branding

- Name: **Central Play Plus**
- Logo: uploaded image (TV robot mascot)
- Colors: black background (#0a0a0f), dark blue (#0d1b2a), electric blue (#3b82f6) for glows/accents
- Large, TV-optimized UI elements with generous spacing

## Screen 1 — Login

- Full-screen dark background with subtle gradient
- Central Play Plus logo centered at top
- Two large input fields: "Usuário" and "Senha"
- Large "Entrar" button with blue glow
- Discrete error message area ("Usuário ou senha inválidos")
- Focus navigation simulation: Tab/arrow keys move a visible focus ring between fields and button
- All elements oversized for TV viewing distance

## Screen 2 — Home (after login)

- **Top navigation bar**: Início, Canais, Filmes, Séries, Configurações — with focus highlight
- **Hero banner**: Large featured content banner with title, description, and "Assistir" button
- **Horizontal category rows**:
  - "Canais ao Vivo" — cards with channel logos and names (SBT, Globo, Band, ESPN, etc.)
  - "Filmes" — movie poster cards with realistic titles
  - "Séries" — series poster cards with realistic titles
- Each row scrolls horizontally
- Cards have focus effect: slight scale-up + blue glow border on hover/focus
- Smooth CSS transitions throughout

## Interactions

- Keyboard arrow navigation simulates TV remote (focus moves between cards, menu items, buttons)
- Visible focus states on every interactive element (essential for TV)
- Smooth transitions on focus/hover (scale, glow, opacity)

## Technical Details

- Copy uploaded logo to `src/assets/logo.png`
- Create route `/login` for login screen, `/` redirects to `/home` or `/login`
- Create route `/home` for the main home screen
- Use React state for simple login flow (no real auth — prepared for future API)
- Custom `useTVNavigation` hook for keyboard-based focus management
- All content uses realistic Brazilian channel/movie/series names
- Responsive but optimized for landscape TV resolutions (1920x1080)
