import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { DiscoveryProvider } from '@/components/discovery/discovery-provider';
import { Header } from '@/components/header';
import { MovieNavigationProvider } from '@/components/movies/movie-navigation';
import { SiteFooter } from '@/components/site-footer';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { WatchlistProvider } from '@/components/watchlist/watchlist-provider';
import { BRAND_NAME } from '@/lib/brand';
import './globals.css';

// Self-hosted from @fontsource so pages make no third-party font requests.
// next/font is compiled at build time, so these options must stay literal values.
const barlow = localFont({
  src: [
    {
      path: '../node_modules/@fontsource/barlow/files/barlow-latin-400-normal.woff2',
      weight: '400',
    },
    {
      path: '../node_modules/@fontsource/barlow/files/barlow-latin-500-normal.woff2',
      weight: '500',
    },
    {
      path: '../node_modules/@fontsource/barlow/files/barlow-latin-600-normal.woff2',
      weight: '600',
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
  title: { default: `${BRAND_NAME} | Find your next great film`, template: `%s · ${BRAND_NAME}` },
  description:
    'Discover what’s trending, explore the stories behind the films, and keep a little list of what to watch next.',
};

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => (
  // next-themes sets the theme class on <html> before hydration.
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
                <SiteFooter />
              </div>
            </DiscoveryProvider>
          </MovieNavigationProvider>
        </WatchlistProvider>
      </ThemeProvider>
    </body>
  </html>
);
export default RootLayout;
