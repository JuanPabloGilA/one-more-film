# One More Film

A movie discovery app built with Next.js App Router, React, TypeScript, Tailwind CSS and shadcn/ui with Base UI. Browse daily trends, open film details, or choose your preferences and discover films through a scrolling trailer feed.

## Run locally

Requires Node.js 20.9+ (developed with Node 24).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set `TMDB_READ_ACCESS_TOKEN` in `.env.local` to your **API Read Access Token** from [TMDB settings](https://www.themoviedb.org/settings/api), and keep `TMDB_DEMO_MODE=false`. Open http://localhost:3000. The token is used on the server only; never prefix it with `NEXT_PUBLIC_`.

Without a token, `TMDB_DEMO_MODE=true` explicitly enables a labeled sample collection. A failing live API never silently switches to demo data.

## Features

- Daily and weekly trends, search and pagination
- Genre filtering and sorting within the current catalogue page
- Film details, full cast, trailers and related films
- English-language discovery by genre, era and runtime
- Trailer feed with next-player preparation and native YouTube controls
- Browser-local watchlists, synchronized between tabs
- Light, dark, and system themes with a saved preference and compact mobile navigation
- Shared-artwork navigation transitions, keyboard controls and reduced-motion support
- Empty, missing-artwork, loading, not-found and upstream-failure states

## Structure

```text
app/                       Routes, server pages and API handlers
components/
  discovery/               Preferences, feed, playback and discovery styles
  movies/                  Cards, artwork, navigation and detail dialogs
  watchlist/               Save button and browser storage provider
  theme/                   Theme provider and shadcn appearance menu
  ui/                      Shared shadcn/ui components (Base UI, Nova preset)
  brand.tsx                SVG identity
  header.tsx               Navigation and search
  explorer.tsx             Catalogue filters and sorting
lib/                       TMDB requests, domain types and pure helpers
tests/                     Node test runner + TypeScript regression tests
public/                    SVG identity and downloadable media kit
scripts/                   Reproducible media kit generation
```

The structure follows features without adding service/repository layers. No database, Prisma, tRPC or background job infrastructure is needed: TMDB owns movie data, localStorage holds saved films, and React context keeps the active discovery session across navigation.

## UI components and build tooling

Shared controls come from shadcn/ui 4.23 (Base UI, Nova): buttons, toggles, radio groups, native selects, inputs, dialogs, dropdown menus and cards. `components.json` preserves the registry configuration. Brand colors are mapped to semantic shadcn tokens, and Barlow Condensed headings and Barlow body text stay local. Edit the shared primitives instead of adding new per-page control CSS. Default buttons and toggles use 44 px touch targets.

Next.js 16 uses Turbopack for both `next dev` and `next build`. Next.js 16.4.6, React 19.3.1 and Tailwind CSS 4.3.5 were verified against the current stable npm releases during this pass. A single app does not need a Turborepo task runner or a monorepo. The shadcn CLI is a development dependency; the scoped minimatch override fixes its transitive advisory without downgrading the CLI.

## Themes

Use the sun or moon button beside search to choose Light, Dark, or System. Light is the default. `next-themes` saves the choice under `one-more-film-theme`, applies it before hydration, and follows device appearance when System is selected. The provider follows [shadcn's Next.js theme setup](https://ui.shadcn.com/docs/dark-mode/next).

Theme colors live in `app/globals.css`. Shared semantic tokens drive both the existing layout and shadcn components. Fixed dark film-player surfaces and logo previews retain their intended contrast. The mobile navigation keeps its original 380 px maximum width with a compact 42 px total height.

## Media kit

Visit `/media-kit` for the preview and downloads, or open `public/one-more-film-media-kit.zip`. It includes six SVG logo variants, two SVG social assets, four product screenshots, color values, reusable copy and a three-page PDF. Movie artwork in screenshots belongs to its respective rights holders.

To regenerate the assets after updating the approved screenshots:

```sh
python3 -m venv .venv-media-kit
.venv-media-kit/bin/pip install -r scripts/media-kit-requirements.txt
.venv-media-kit/bin/python scripts/build-media-kit.py
```

The script uses the installed Barlow font family and keeps the logo assets as vectors. No image generation is used.

## Data and performance decisions

- **Server data:** catalogue and detail pages call TMDB directly. `lib/tmdb.ts` handles authentication, eight-second timeouts, five-minute fetch caching and safe errors. Credits, videos and recommendations arrive in one detail request, deduplicated with React `cache`.
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
npm run check       # formatting, TypeScript and regression tests
npm run build       # production build
npm run start -- --port 3001
```

Tests cover authentication/query encoding, API failures, explicit demo mode, preference constraints, trailer selection, sparse/duplicate pagination, cancellation, compact movie data and damaged/legacy watchlists.

For a mobile Lighthouse audit, run against the production server:

```sh
mkdir -p review
npx lighthouse@13.6.0 http://localhost:3001/ \
  --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" \
  --output=html --output=json --output-path=review/lighthouse-home
```

Reports, screenshots and earlier design explorations live in the git-ignored `review/` directory. Local Lighthouse scores vary and do not represent field Core Web Vitals or the cost of a playing YouTube feed.

### Theme update validation

The theme and compact navigation update passed formatting, TypeScript, all 23 tests, and a production build. Browser checks covered Light/Dark/System selection, persistence after reload, the device preference, Escape/focus restoration, and layout at 320 px and 390 px. No browser errors were logged. The mobile light-mode homepage measured **90 performance and 100 accessibility, best practices, and SEO** in Lighthouse 13.6.0; this is a single local lab run, not a dark-mode or field audit. Its report is `review/lighthouse-themes-home.report.html`.

### Previous local audit

On 21 November 2026, Lighthouse 13.6.0 covered eight page cases on mobile and desktop: home, search, preferences, empty watchlist, two movie details (including missing portraits), a person profile, and the media kit. The homepage and person profile were retested after the mobile bottom navigation and profile loading fixes.

The latest local production results range from **90 to 100 performance on mobile** and **100 on desktop**. All checked pages scored **100 accessibility and best practices**. SEO was **100 except one mobile profile run at 91**, where Lighthouse missed the streamed description; the desktop profile run scored 100. Next.js metadata streaming remains enabled. These are lab runs with live TMDB data, not field Core Web Vitals, and scores vary with caching and network conditions.

The changes fix contrast on muted text, remove cramped missing-image labels, prioritize above-the-fold search posters, render watchlist guidance immediately, and reserve space while profiles load. Search performance moved from 95 to 96, watchlist from 94 to 100, and profile layout shift fell from 0.155 in the intermediate run to 0. Homepage performance measured 90 after these changes versus 95 in the initial baseline; no homepage performance gain is claimed.

The older public Vercel deployment was also checked separately on home, preferences, watchlist, and movie details. All four standard categories scored 100 on mobile and desktop in this run. The local changes have not been deployed.

The comparison report is `review/lighthouse-audit/index.html`; full JSON and HTML reports are in its `before`, `after`, `verified`, and `live` folders. Reports are local review artifacts and are ignored by Git. Navigation audits do not measure active YouTube playback or every user state.

Validation passed formatting, TypeScript, all 23 regression tests, and the production build. Browser checks covered missing portraits, links from full cast to profiles, mobile navigation at 320 px and 390 px, active states, and hiding navigation during the trailer feed.

## Deployment

Deploy as a Next.js application on Vercel or another Node-compatible host. Configure `TMDB_READ_ACCESS_TOKEN` as a server secret and `TMDB_DEMO_MODE=false`. Never commit `.env.local`.

## Credits

Movie data and artwork: [TMDB](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.

Design refinement follows [Unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), licensed CC BY 4.0. The skill was applied to typography, spacing, color, copy and interaction treatment. The logo is an editable SVG.

### Film details and people

Movie details include production facts, key crew credits, themes and collection links. Unknown budgets and box-office figures are labelled as unreported. Cast and crew link to dedicated `/person/[id]` profile pages with biographies, personal details and a compact, scrollable filmography with pagination. Credits combine acting and production roles without duplicate films. Film and person data remain server-fetched. Long biographies expand inline with See more and See less.
