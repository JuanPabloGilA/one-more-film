# One More Film

A movie discovery app built with Next.js App Router, React, TypeScript, Tailwind CSS and shadcn/ui with Base UI. Browse daily trends, open film details, or choose your preferences and discover films through a scrolling trailer feed.

## Run locally

Requires Node.js 22 or later (developed with Node 24).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set `TMDB_READ_ACCESS_TOKEN` in `.env.local` to your **API Read Access Token** from [TMDB settings](https://www.themoviedb.org/settings/api), and keep `TMDB_DEMO_MODE=false`. Open http://localhost:3000. The token is used on the server only; never prefix it with `NEXT_PUBLIC_`.

Without a token, `TMDB_DEMO_MODE=true` explicitly enables a labeled sample collection. A failing live API never silently switches to demo data.

## Features

- Daily and weekly trends, search and pagination
- Genre filtering and sorting within the current catalogue page, kept in the URL
- Film details, full cast, trailers and related films
- English-language discovery by genre, era and runtime
- Trailer feed with next-player preparation and native YouTube controls
- Browser-local watchlists, synchronized between tabs through `useSyncExternalStore`
- Light, dark, and system themes with a saved preference and compact mobile navigation
- Shared-artwork navigation transitions, keyboard controls and reduced-motion support
- Empty, missing-artwork, loading, not-found and upstream-failure states

## Structure

```text
app/                       Routes, server pages and API handlers
components/
  discovery/               Preference form, trailer feed, its hooks and styles
  movies/                  Cards, artwork, featured film, navigation and detail dialogs
  people/                  Portraits, cast cards and people links
  watchlist/               Save button, provider and browser storage store
  theme/                   Theme provider and appearance menu
  ui/                      shadcn/ui components (Base UI, Nova preset)
  *.tsx                    Header, footer, catalogue explorer and small shared pieces
lib/                       Server TMDB client and pure, tested helpers
tests/                     Node test runner suites, one per module
public/                    SVG identity and the generated media kit
scripts/                   Media kit generator (TypeScript)
```

The structure follows features without service or repository layers. No database is needed: TMDB owns movie data, localStorage holds saved films, and React context keeps the active discovery session across navigation.

Each fact lives in one module and is imported where it is used:

| Module                           | Owns                                                            |
| -------------------------------- | --------------------------------------------------------------- |
| `lib/tmdb.ts`                    | Every TMDB request, demo-mode fallbacks and `TmdbError`         |
| `lib/discovery.ts`               | Discovery preferences, their limits and validation              |
| `lib/catalogue.ts`               | Home page genre and sort filters, kept in the URL               |
| `lib/params.ts`                  | Page, ID and search query limits                                |
| `lib/links.ts`                   | Every internal route and external URL                           |
| `lib/format.ts`, `lib/genres.ts` | Display formatting and TMDB genre names                         |
| `lib/brand.ts`                   | Palette, site URLs and author, shared with the media kit script |

## UI components and build tooling

Shared controls come from shadcn/ui (Base UI, Nova): buttons, toggles, radio groups, selects, inputs, dialogs, dropdown menus and cards. `components.json` preserves the registry configuration. Brand colors are mapped to semantic shadcn tokens, and Barlow Condensed headings and Barlow body text are self-hosted. Default buttons and toggles use 44 px touch targets.

Next.js 16 uses Turbopack for both `next dev` and `next build`. The shadcn CLI is a development dependency; the scoped minimatch override fixes its transitive advisory without downgrading the CLI.

TypeScript 7 does the type checking (`npm run typecheck`). TypeScript 7 does not ship a compiler API yet, so `typescript` is aliased to the TypeScript 6 compatibility package for ESLint's `typescript-eslint`, as the TypeScript 7 release notes recommend, and `@typescript/native` provides the `tsc` binary.

## Themes

Use the sun or moon button beside search to choose Light, Dark, or System. Light is the default. `next-themes` saves the choice under `one-more-film-theme`, applies it before hydration, and follows device appearance when System is selected. The provider follows [shadcn's Next.js theme setup](https://ui.shadcn.com/docs/dark-mode/next).

Theme colors live in `app/globals.css`. Shared semantic tokens drive both the existing layout and shadcn components. Fixed dark film-player surfaces and logo previews retain their intended contrast. The mobile navigation keeps its original 380 px maximum width with a compact 42 px total height.

## Media kit

Visit `/media-kit` for the preview and downloads, or open `public/one-more-film-media-kit.zip`. It includes six SVG logo variants, two SVG social assets, four product screenshots, color values, reusable copy and a three-page PDF. Movie artwork in screenshots belongs to its respective rights holders.

The kit is generated and committed so the site can serve it as static files. After changing the brand facts in `lib/brand.ts` or replacing the screenshots, regenerate it:

```sh
npm run media-kit
```

The script outlines Barlow into the SVG logos, so they render without the font, and keeps every logo a vector. No image generation is used.

## Data and performance decisions

- **Server data:** catalogue and detail pages call TMDB directly, and the two API routes are thin wrappers over the same client. `lib/tmdb.ts` handles authentication, eight-second timeouts, five-minute fetch caching and safe errors. Credits, videos and recommendations arrive in one detail request, deduplicated with React `cache`.
- **Small client payloads:** `toMovie` selects the fields needed by cards and saved films. Cast, videos and unrelated TMDB fields stay out of watchlist storage and Save button props. Old saved items are sanitized when read; the original versioned storage key is retained so the rename does not lose saves.
- **Load on demand:** discovery styles belong to `/discover`; the feed and YouTube player code load after preference submission. Movie routes prefetch on hover, focus or touch instead of fetching every film's details on grid mount.
- **Images and fonts:** responsive `next/image` sizes, AVIF/WebP, priority hero artwork and locally hosted Barlow and Barlow Condensed fonts.
- **Motion:** only matching artwork participates in shared View Transitions. Scroll position is restored before the destination snapshot. Unsupported browsers use normal navigation; reduced-motion preferences disable animations.

## Discovery behavior and limits

Genres use OR matching (up to three). Choosing a genre other than Horror excludes horror hybrids; choosing Horror or “Open to anything” permits them. Recent means the last five years; classics precede 2000. Films must have English as their original language, be released, have at least 50 votes, and satisfy the chosen runtime range. Genre, language and date constraints are checked again before results reach the browser. These are filtered TMDB suggestions, not an AI recommendation model.

Pagination removes duplicate films and skips up to three empty/duplicate pages per request batch. A sparse batch preserves the cursor and offers a Load more action, avoiding an unbounded request loop. Closing the feed returns to the current preferences. Reloading clears the in-memory discovery session.

Only the current and next trailers request metadata. The next iframe is prepared after the current trailer starts or cannot play; old players are destroyed, and inactive/hidden players pause. YouTube owns playback controls, buffering, ads and availability. Autoplay starts muted when permitted. Preparation cannot guarantee that the next video is fully buffered. Swipe outside the embedded player to change films; keyboard arrows and navigation buttons are also available.

Watchlists hold up to 500 films on this browser, without cross-device sync. If storage is unavailable, saving works for the current visit. No account is required.

## Verification

```sh
npm run check       # formatting, ESLint, TypeScript and tests
npm run build       # production build
npm run start -- --port 3001
```

GitHub Actions runs the same checks and a production build on every push and pull request, using the sample catalogue.

Tests cover authentication and query encoding, API failures and both API routes, explicit demo mode, preference constraints, catalogue filters, formatting, link validation, trailer selection, sparse and duplicate pagination, cancellation, compact movie data, damaged watchlists, and that the CSS palette matches `lib/brand.ts`.

For a mobile Lighthouse audit, run against the production server:

```sh
mkdir -p review
npx lighthouse@13.6.0 http://localhost:3001/ \
  --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" \
  --output=html --output=json --output-path=review/lighthouse-home
```

Reports and screenshots go in the git-ignored `review/` directory. Local Lighthouse scores vary and do not represent field Core Web Vitals or the cost of a playing YouTube feed.

## Deployment

Deploy as a Next.js application on Vercel or another Node-compatible host. Configure `TMDB_READ_ACCESS_TOKEN` as a server secret and `TMDB_DEMO_MODE=false`. Never commit `.env.local`.

`next.config.ts` sends a Content Security Policy that allows only this origin, TMDB images and the YouTube player, plus `nosniff`, referrer and permissions headers.

## Credits

Movie data and artwork: [TMDB](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.

Design refinement follows [Unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), licensed CC BY 4.0. The skill was applied to typography, spacing, color, copy and interaction treatment. The logo is an editable SVG.

### Film details and people

Movie details include production facts, key crew credits, themes and collection links. Unknown budgets and box-office figures are labelled as unreported. Cast and crew link to dedicated `/person/[id]` profile pages with biographies, personal details and a compact, scrollable filmography with pagination. Credits combine acting and production roles without duplicate films. Film and person data remain server-fetched. Long biographies expand inline with See more and See less.
