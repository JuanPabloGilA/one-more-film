'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Form from 'next/form';
import { usePathname } from 'next/navigation';
import { Search, ArrowUpRight, Play, House, Bookmark } from 'lucide-react';
import { useWatchlist } from '@/components/watchlist/watchlist-provider';
import { Brand } from './brand';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
const MobileSearch = dynamic(() => import('./mobile-search').then((module) => module.MobileSearch));

export const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { movies, ready } = useWatchlist();
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
          <Link
            className={`nav-link${pathname === '/' ? ' active' : ''}`}
            href="/"
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            <House className="mobile-nav-icon" size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>Home</span>
          </Link>
          <Link
            href="/discover"
            className={`nav-link nav-discover${pathname === '/discover' ? ' active' : ''}`}
            aria-current={pathname === '/discover' ? 'page' : undefined}
          >
            <Play className="nav-play-icon" size={14} fill="currentColor" aria-hidden="true" />
            <span>For you</span>
          </Link>
          <Link
            className={`nav-link${pathname === '/watchlist' ? ' active' : ''}`}
            href="/watchlist"
            aria-current={pathname === '/watchlist' ? 'page' : undefined}
          >
            <Bookmark className="mobile-nav-icon" size={20} strokeWidth={1.75} aria-hidden="true" />
            <span className="nav-label">
              Watchlist{' '}
              {ready && movies.length > 0 && <span className="count">{movies.length}</span>}
            </span>
          </Link>
        </nav>
        <Form action="/" className="header-search" role="search">
          <Search size={16} strokeWidth={1.5} />
          <label className="sr-only" htmlFor="header-query">
            Search movies
          </label>
          <Input
            className="border-0 px-0 focus-visible:ring-0"
            id="header-query"
            name="q"
            placeholder="Search films"
            maxLength={100}
          />
          <Button variant="ghost" size="icon" type="submit" aria-label="Search movies">
            <ArrowUpRight size={16} />
          </Button>
        </Form>
      </header>
    </div>
  );
};
