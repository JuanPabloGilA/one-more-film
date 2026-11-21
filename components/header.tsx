'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Form from 'next/form';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Bookmark, House, Play, Search } from 'lucide-react';
import { Brand } from '@/components/brand';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWatchlist } from '@/components/watchlist/watchlist-provider';
import { routes } from '@/lib/links';
import { MAX_QUERY_LENGTH } from '@/lib/params';
import { cn } from '@/lib/utils';

const MobileSearch = dynamic(() => import('./mobile-search').then((module) => module.MobileSearch));

const NavIcon = ({ icon: Icon }: { icon: typeof House }) => (
  <Icon className="mobile-nav-icon" size={20} strokeWidth={1.75} aria-hidden="true" />
);

export const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { movies, ready } = useWatchlist();
  const navLink = (href: string, className?: string) => ({
    href,
    className: cn('nav-link', className, pathname === href && 'active'),
    'aria-current': pathname === href ? ('page' as const) : undefined,
  });
  return (
    <div className="site-header-shell">
      <header className="site-header section-shell">
        <div className="header-topbar">
          <Brand />
          <div className="header-actions">
            <ThemeSwitcher />
            <Button
              ref={searchTrigger}
              variant="secondary"
              size="icon"
              className="mobile-search-trigger hidden rounded-full max-[760px]:inline-flex"
              aria-label="Open movie search"
              aria-haspopup="dialog"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
            >
              <Search aria-hidden="true" />
            </Button>
          </div>
        </div>
        {searchOpen && (
          <MobileSearch onClose={() => setSearchOpen(false)} triggerRef={searchTrigger} />
        )}
        <nav aria-label="Main navigation">
          <Link {...navLink(routes.home)}>
            <NavIcon icon={House} />
            <span>Home</span>
          </Link>
          <Link {...navLink(routes.discover, 'nav-discover')}>
            <Play className="nav-play-icon" size={14} fill="currentColor" aria-hidden="true" />
            <span>For you</span>
          </Link>
          <Link {...navLink(routes.watchlist)}>
            <NavIcon icon={Bookmark} />
            <span className="nav-label">
              Watchlist{' '}
              {ready && movies.length > 0 && <span className="count">{movies.length}</span>}
            </span>
          </Link>
        </nav>
        <Form action={routes.home} className="header-search" role="search">
          <Search size={16} strokeWidth={1.5} />
          <label className="sr-only" htmlFor="header-query">
            Search movies
          </label>
          <Input
            className="border-0 px-0 focus-visible:ring-0"
            id="header-query"
            name="q"
            placeholder="Search films"
            maxLength={MAX_QUERY_LENGTH}
          />
          <Button variant="ghost" size="icon" type="submit" aria-label="Search movies">
            <ArrowUpRight size={16} />
          </Button>
        </Form>
      </header>
    </div>
  );
};
