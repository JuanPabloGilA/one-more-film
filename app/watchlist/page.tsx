'use client';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { Notice } from '@/components/notice';
import { MovieCard } from '@/components/movies/movie-card';
import { buttonVariants } from '@/components/ui/button';
import { useWatchlist } from '@/components/watchlist/watchlist-provider';
import { countLabel } from '@/lib/format';
import { routes } from '@/lib/links';

const Watchlist = () => {
  const { movies, ready, storageAvailable } = useWatchlist();
  return (
    <main id="main-content" className="section-shell watchlist-page">
      <span className="eyebrow">For another night</span>
      <h1>Your watchlist</h1>
      <p className="section-description">
        Tap the bookmark on any film to save it here. Your watchlist stays in this browser.
      </p>
      {!storageAvailable && (
        <Notice>Browser storage is unavailable. Your watchlist will last for this visit.</Notice>
      )}
      {!ready ? (
        <div className="empty-state" role="status">
          Loading your watchlist…
        </div>
      ) : movies.length ? (
        <>
          <p className="list-count">{countLabel(movies.length, 'film')} waiting for you</p>
          <div className="movie-grid">
            {movies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} priority={index < 2} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <Bookmark size={24} strokeWidth={1.5} />
          <h2>Your watchlist starts with one film</h2>
          <Link href={routes.home} className={buttonVariants()}>
            Find a film
          </Link>
        </div>
      )}
    </main>
  );
};
export default Watchlist;
