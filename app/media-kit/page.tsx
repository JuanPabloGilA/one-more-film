import type { Metadata } from 'next';
import Image from 'next/image';
import { Download, ArrowUpRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { PALETTE } from '@/lib/brand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Media kit',
  description: 'Official One More Film logos, colors, product screenshots and press copy.',
};

const logoVersions = [
  ['Cerulean symbol', 'encore-cerulean'],
  ['Ink symbol', 'encore-ink'],
  ['White symbol', 'encore-white'],
  ['Primary wordmark', 'wordmark-cerulean'],
  ['Ink wordmark', 'wordmark-ink'],
  ['White wordmark', 'wordmark-white'],
];

const MediaKitPage = () => (
  <main id="main-content" className="section-shell space-y-12 py-12 md:space-y-16 md:py-16">
    <header className="max-w-3xl space-y-6">
      <p className="text-sm text-muted-foreground">Brand & press</p>
      <h1 className="text-4xl leading-tight font-semibold sm:text-6xl">
        One More Film,
        <br />
        ready to share.
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
        Logos, colors, screenshots and a few words about the app. Everything you need to tell its
        story.
      </p>
      <div className="flex flex-wrap gap-3">
        <a href="/one-more-film-media-kit.zip" download className={buttonVariants({ size: 'lg' })}>
          <Download aria-hidden="true" /> Download the kit
        </a>
        <a
          href="/media-kit/one-more-film-media-kit.pdf"
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          Read the overview <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <p className="text-sm text-muted-foreground">
        SVG logos and social artwork, JPEG screenshots, a PDF overview and reusable copy.
      </p>
    </header>

    <section aria-labelledby="logos-heading" className="space-y-6">
      <h2 id="logos-heading" className="text-2xl">
        The Encore mark
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <CardContent className="flex min-h-52 items-center justify-center p-8">
            <Image
              src="/media-kit/logos/wordmark-cerulean.svg"
              alt="One More Film primary wordmark"
              width={470}
              height={100}
              className="h-auto w-full max-w-sm"
            />
          </CardContent>
        </Card>
        <Card className="dark bg-background">
          <CardContent className="flex min-h-52 items-center justify-center p-8">
            <Image
              src="/media-kit/logos/wordmark-white.svg"
              alt="One More Film white wordmark"
              width={470}
              height={100}
              className="h-auto w-full max-w-sm"
            />
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-2">
        {logoVersions.map(([label, file]) => (
          <a
            key={file}
            href={`/media-kit/logos/${file}.svg`}
            download
            className={buttonVariants({ variant: 'outline' })}
          >
            <Download aria-hidden="true" /> {label}
          </a>
        ))}
      </div>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        All logos are SVGs. Leave clear space of at least a quarter of the symbol’s width. Keep the
        symbol at least 24 px wide and the wordmark at least 150 px wide. Use the white version on
        dark backgrounds.
      </p>
    </section>

    <section aria-labelledby="palette-heading" className="space-y-6">
      <h2 id="palette-heading" className="text-2xl">
        Color & type
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {PALETTE.map(({ name, hex }) => (
          <div key={hex} className="space-y-3">
            <div
              className="h-24 rounded-xl border border-border"
              style={{ backgroundColor: hex }}
            />
            <p className="text-sm font-medium">{name}</p>
            <p className="font-mono text-xs text-muted-foreground">{hex}</p>
          </div>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Barlow Condensed + Barlow</CardTitle>
          <CardDescription>
            Barlow Condensed 600 for headings · Barlow 400, 500 and 600 for reading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-heading text-2xl font-semibold sm:text-4xl">
            Find something worth watching.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Keep the typography clear and the layout quiet. Cerulean is the primary brand accent.
            Fresh Sky works best for larger accents and dark backgrounds. The supplied wordmarks
            contain outlined text, so they need no font installation.
          </p>
        </CardContent>
      </Card>
    </section>

    <section aria-labelledby="screenshots-heading" className="space-y-6">
      <h2 id="screenshots-heading" className="text-2xl">
        Inside the app
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {[
          ['Daily discovery', 'homepage-desktop'],
          ['Choose your preferences', 'preferences-desktop'],
        ].map(([label, file]) => (
          <Card key={file} className="overflow-hidden">
            <CardContent className="p-0">
              <Image
                src={`/media-kit/screenshots/${file}.jpg`}
                alt={`${label} in One More Film`}
                width={1440}
                height={960}
                quality={60}
                sizes="(max-width: 760px) 100vw, 50vw"
                className="h-auto w-full"
              />
            </CardContent>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <a
                href={`/media-kit/screenshots/${file}.jpg`}
                download
                className={buttonVariants({ variant: 'outline', className: 'w-fit' })}
              >
                <Download aria-hidden="true" /> Download screenshot
              </a>
            </CardHeader>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Movie artwork and data come from TMDB. Listings and ratings change over time.
      </p>
    </section>

    <section aria-labelledby="about-heading">
      <Card>
        <CardHeader>
          <CardTitle id="about-heading" className="text-2xl">
            A few words about One More Film
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="max-w-3xl text-base leading-relaxed">
            One More Film is a movie discovery app for finding your next watch. Browse daily trends,
            choose your genres, era and runtime, then explore trailers one film at a time. Open the
            full details and cast, or save a film to your browser’s watchlist. No account is
            required.
          </p>
          <a
            href="/media-kit/product-copy.txt"
            download
            className={buttonVariants({ variant: 'outline' })}
          >
            <Download aria-hidden="true" /> Download product copy
          </a>
          <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
            This product uses the TMDB API but is not endorsed or certified by TMDB. Trailers are
            hosted on YouTube. Third-party film artwork is included in screenshots to show the
            application; it is not part of the One More Film logo assets.
          </p>
        </CardContent>
      </Card>
    </section>
  </main>
);
export default MediaKitPage;
