import type { Metadata } from 'next';
import Image from 'next/image';
import { DiscoveryProvider } from '@/components/discovery/discovery-provider';
import { Brand } from '@/components/brand';
import { MovieNavigationProvider } from '@/components/movies/movie-navigation';
import { Header } from '@/components/header';
import { WatchlistProvider } from '@/components/watchlist/watchlist-provider';
import localFont from 'next/font/local';
import './globals.css';
const instrumentSans = localFont({
  src: '../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2',
  variable: '--font-instrument',
  display: 'swap',
  weight: '400 700',
  preload: true,
});
export const metadata: Metadata = {
  title: { default: 'One More Film — Find your next great film', template: '%s · One More Film' },
  description:
    'Discover what’s trending, explore the stories behind the films, and keep a little list of what to watch next.',
};
const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en" className={instrumentSans.variable}>
    <body>
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
                  <span>
                    This product uses the TMDB API but is not endorsed or certified by TMDB.
                  </span>
                </div>
              </footer>
            </div>
          </DiscoveryProvider>
        </MovieNavigationProvider>
      </WatchlistProvider>
    </body>
  </html>
);
export default RootLayout;
