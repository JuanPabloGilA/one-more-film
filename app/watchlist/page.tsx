'use client';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { MovieCard } from '@/components/movies/movie-card';
import { useWatchlist } from '@/components/watchlist/watchlist-provider';
const Watchlist = () => {
  const { movies, ready, message } = useWatchlist();
  return (
    <main id="main-content" className="section-shell watchlist-page">
      <span className="eyebrow">For another night</span>
      <h1>Your watchlist</h1>
      <p className="section-description">The films you saved, kept in this browser.</p>
      {message.includes('storage') && (
        <p role="status" className="demo-notice">
          {message}
        </p>
      )}
      {!ready ? (
        <div className="empty-state" role="status">
          Loading your watchlist…
        </div>
      ) : movies.length ? (
        <>
          <p className="list-count">
            {movies.length} {movies.length === 1 ? 'film' : 'films'} waiting for you
          </p>
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <Bookmark size={24} strokeWidth={1.5} />
          <h2>Your watchlist starts with one film</h2>
          <p>Tap the bookmark on any film to save it for later. No account needed.</p>
          <Link href="/" className="button button-primary">
            Find a film
          </Link>
        </div>
      )}
    </main>
  );
};
export default Watchlist;
