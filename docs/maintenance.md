# Development reference

[Back to the README](../README.md)

## Media kit

Preview the [media kit](https://one-more-film-ruby.vercel.app/media-kit) or download [the committed ZIP](../public/one-more-film-media-kit.zip). It includes SVG logos and social assets, product screenshots, colors, reusable copy and a PDF. Movie artwork belongs to its respective rights holders.

After changing [brand values](../lib/brand.ts) or the screenshots in `public/media-kit/screenshots/`, regenerate the committed assets:

```sh
npm run media-kit
```

The generator outlines Barlow into the SVG logos so they render without a font dependency. Logos remain vectors.

## Themes and tooling

Theme colors live in `app/globals.css`. Semantic tokens style the layout and shadcn components. `next-themes` saves Light, Dark or System under `one-more-film-theme`; Light is the default.

`components.json` records the shadcn Base UI/Nova configuration. Next.js uses Turbopack for development and production builds.

The typecheck command uses TypeScript 7 through `@typescript/native`. The `typescript` package name points to the TypeScript 6 compatibility package for ESLint's compiler API integration. A scoped `minimatch` override addresses a transitive dependency of the shadcn CLI.

## Lighthouse

Audit a production build, not the development server:

```sh
npm run build
npm run start -- --port 3001
```

In another terminal, with Chrome installed:

```sh
mkdir -p review
npx lighthouse@13.6.0 http://localhost:3001/ \
  --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" \
  --output=html --output=json --output-path=review/lighthouse-home
```

Reports and screenshots belong in the git-ignored `review/` directory. For deployment measurements, replace the local URL with the live application URL. Hosting, cache state and network conditions affect scores; local and deployed results are not interchangeable. These lab scores do not represent field Core Web Vitals or the cost of an active YouTube feed.

## Deployment

Deploy as a Next.js application on Vercel or another Node-compatible host. Set `TMDB_READ_ACCESS_TOKEN` as a server secret and `TMDB_DEMO_MODE=false`. Never commit `.env.local`.

`next.config.ts` defines the Content Security Policy for the app, TMDB images and YouTube resources, plus content-type, referrer and permissions headers.
