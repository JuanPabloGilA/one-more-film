'use client';
import Link from 'next/link';
import Form from 'next/form';
import { usePathname } from 'next/navigation';
import { Search, ArrowUpRight, Play } from 'lucide-react';
import { useWatchlist } from '@/components/watchlist/watchlist-provider';
import { Brand } from './brand';
export const Header = () => {
  const pathname = usePathname();
  const { movies, ready } = useWatchlist();
  return (
    <header className="site-header section-shell">
      <Brand />
      <nav aria-label="Main navigation">
        <Link
          className={`nav-link${pathname === '/' ? ' active' : ''}`}
          href="/"
          aria-current={pathname === '/' ? 'page' : undefined}
        >
          Home
        </Link>
        <Link
          href="/discover"
          className={`nav-link nav-discover${pathname === '/discover' ? ' active' : ''}`}
          aria-current={pathname === '/discover' ? 'page' : undefined}
        >
          <Play size={14} fill="currentColor" aria-hidden="true" />
          For you
        </Link>
        <Link
          className={`nav-link${pathname === '/watchlist' ? ' active' : ''}`}
          href="/watchlist"
          aria-current={pathname === '/watchlist' ? 'page' : undefined}
        >
          Watchlist <span className="count">{ready ? movies.length : 0}</span>
        </Link>
      </nav>
      <Form action="/" className="header-search" role="search">
        <Search size={16} strokeWidth={1.5} />
        <label className="sr-only" htmlFor="header-query">
          Search movies
        </label>
        <input id="header-query" name="q" placeholder="Search films" maxLength={100} />
        <button type="submit" aria-label="Search movies">
          <ArrowUpRight size={16} />
        </button>
      </Form>
    </header>
  );
};
