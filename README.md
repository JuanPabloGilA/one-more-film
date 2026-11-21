# One More Film

A movie discovery app built with Next.js App Router, React, TypeScript, Tailwind CSS and Radix Dialog. Browse daily trends, open film details, or choose your preferences and discover films through a scrolling trailer feed.

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
- Shared-artwork navigation transitions, keyboard controls and reduced-motion support
- Empty, missing-artwork, loading, not-found and upstream-failure states

## Structure

```text
app/                       Routes, server pages and API handlers
components/
  discovery/               Preferences, feed, playback and discovery styles
  movies/                  Cards, artwork, navigation and detail dialogs
  watchlist/               Save button and browser storage provider
  brand.tsx                SVG identity
  header.tsx               Navigation and search
  explorer.tsx             Catalogue filters and sorting
lib/                       TMDB requests, domain types and pure helpers
tests/                     Node test runner + TypeScript regression tests
public/                    Production SVG assets only
```

The structure follows features without adding service/repository layers. No database, Prisma, tRPC or background job infrastructure is needed: TMDB owns movie data, localStorage holds saved films, and React context keeps the active discovery session across navigation.

## Data and performance decisions

- **Server data:** catalogue and detail pages call TMDB directly. `lib/tmdb.ts` handles authentication, eight-second timeouts, five-minute fetch caching and safe errors. Credits, videos and recommendations arrive in one detail request, deduplicated with React `cache`.
- **Small client payloads:** `toMovie` selects the fields needed by cards and saved films. Cast, videos and unrelated TMDB fields stay out of watchlist storage and Save button props. Old saved items are sanitized when read; the original versioned storage key is retained so the rename does not lose saves.
- **Load on demand:** discovery styles belong to `/discover`; the feed and YouTube player code load after preference submission. Movie routes prefetch on hover, focus or touch instead of fetching every film's details on grid mount.
- **Images and fonts:** responsive `next/image` sizes, AVIF/WebP, priority hero artwork and one locally hosted Instrument Sans font.
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

### Latest local audit

The same-machine mobile production comparison measured **94 → 95 performance**, with **100 accessibility, best practices and SEO** in both runs. LCP was 3.1 → 3.0 seconds; CLS remained 0. This one-point difference is within normal run-to-run variation, not evidence of a consistent performance gain.

The checked movie detail HTML/RSC response fell from **163,239 to 91,815 bytes (44% smaller)** after trimming client props. Homepage transfer was approximately **374 → 371 KiB**. Reports: `review/lighthouse-audit-before.report.html` and `review/lighthouse-audit-after.report.html`. These measurements use live TMDB data and can change with the featured films.

The audit passed 18 regression tests, TypeScript, formatting and the production build. Browser checks covered search, save/reload/remove, full cast, native trailer playback, returning to the same feed position, preserved preferences and portrait/landscape layouts. No console warnings or errors appeared during that session.

## Deployment

Deploy as a Next.js application on Vercel or another Node-compatible host. Configure `TMDB_READ_ACCESS_TOKEN` as a server secret and `TMDB_DEMO_MODE=false`. Never commit `.env.local`.

## Credits

Movie data and artwork: [TMDB](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.

Design refinement follows [Unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), licensed CC BY 4.0. The skill was applied to typography, spacing, color, copy and interaction treatment. The logo is an editable SVG.
