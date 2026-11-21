import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { DiscoveryProvider } from '@/components/discovery/discovery-provider';
import { Brand } from '@/components/brand';
import { MovieNavigationProvider } from '@/components/movies/movie-navigation';
import { Header } from '@/components/header';
import { WatchlistProvider } from '@/components/watchlist/watchlist-provider';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/theme/theme-provider';
import './globals.css';
const barlow = localFont({
  src: [
    {
      path: '../node_modules/@fontsource/barlow/files/barlow-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/barlow/files/barlow-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../node_modules/@fontsource/barlow/files/barlow-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-barlow',
  display: 'swap',
});
const barlowCondensed = localFont({
  src: '../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff2',
  variable: '--font-barlow-condensed',
  display: 'swap',
  weight: '600',
});
export const metadata: Metadata = {
  title: { default: 'One More Film | Find your next great film', template: '%s · One More Film' },
  description:
    'Discover what’s trending, explore the stories behind the films, and keep a little list of what to watch next.',
};
const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html
    lang="en"
    className={`${barlow.variable} ${barlowCondensed.variable}`}
    suppressHydrationWarning
  >
    <body>
      <ThemeProvider>
        <WatchlistProvider>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <MovieNavigationProvider>
            <DiscoveryProvider>
              <Header />
              <div className="app-content">
                {children}
                <footer className="site-footer section-shell">
                  <div className="footer-top">
                    <Brand />
                    <p>Find something worth watching</p>
                    <a
                      href="https://www.themoviedb.org"
                      target="_blank"
                      rel="noreferrer"
                      className="tmdb-link"
                    >
                      Film data & artwork by{' '}
                      <Image src="/tmdb.svg" alt="TMDB" width={76} height={10} />
                    </a>
                  </div>
                  <div className="footer-bottom">
                    <span>A film for tonight. A few for later.</span>
                    <Link href="/media-kit" className="underline underline-offset-4">
                      Media kit
                    </Link>
                    <span>
                      This product uses the TMDB API but is not endorsed or certified by TMDB.
                    </span>
                  </div>
                </footer>
              </div>
            </DiscoveryProvider>
          </MovieNavigationProvider>
        </WatchlistProvider>
      </ThemeProvider>
    </body>
  </html>
);
export default RootLayout;
