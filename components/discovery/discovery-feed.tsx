'use client';
import { useCallback, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, SlidersHorizontal, Star, X } from 'lucide-react';
import { MovieLink } from '@/components/movies/movie-link';
import { Button, buttonVariants } from '@/components/ui/button';
import { SaveButton } from '@/components/watchlist/save-button';
import { ratingLabel, year } from '@/lib/format';
import { genreNames } from '@/lib/genres';
import type { Movie } from '@/lib/types';
import { useDiscovery } from './discovery-provider';
import { FeedTrailer } from './feed-trailer';
import { useFeedLoader } from './use-feed-loader';
import { useFeedPosition } from './use-feed-position';

/** A full-screen, vertically snapping feed of trailers, one film per slide. */
export const DiscoveryFeed = ({ onEdit }: { onEdit: () => void }) => {
  const { session } = useDiscovery();
  const { loadMore, loadMoreNear, loading, error, hasMore } = useFeedLoader();
  const { viewport, endVisible, move, onKeyDown } = useFeedPosition({
    onFilmVisible: loadMoreNear,
  });
  // Only one player downloads at a time: the next film's trailer starts loading once
  // the current one is playing (or has nothing to play).
  const [warmedMovie, setWarmedMovie] = useState<number | null>(null);
  const onWarm = useCallback((movieId: number) => setWarmedMovie(movieId), []);
  if (!session) return null;
  const { movies, active } = session;
  const retry = () => void loadMore();
  return (
    <main id="main-content" className="film-discovery--feed dark">
      <div className="feed-topbar">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="feed-home"
          onClick={onEdit}
          aria-label="Back to preferences"
        >
          <X size={20} />
        </Button>
        <div>
          <strong>For you</strong>
          <span>{session.demo ? 'Sample collection' : 'Trailers picked for you.'}</span>
        </div>
        <Button variant="outline" className="feed-preferences" onClick={onEdit}>
          <SlidersHorizontal size={16} />
          <span>Preferences</span>
        </Button>
      </div>
      <div
        className="film-feed"
        ref={viewport}
        tabIndex={0}
        aria-label="Recommended films. Scroll or use up and down arrow keys."
        onKeyDown={onKeyDown}
      >
        {movies.map((movie, index) => (
          <FeedFilm
            key={movie.id}
            movie={movie}
            index={index}
            isActive={index === active && !endVisible}
            // Mount players for the current film and the next one only.
            showTrailer={index === active || index === active + 1}
            prepareTrailer={!endVisible && warmedMovie === movies[active]?.id}
            onWarm={onWarm}
          />
        ))}
        <section
          className="feed-end"
          data-index={movies.length}
          aria-label="More recommendations"
          inert={!endVisible}
        >
          <span className="eyebrow">One more film?</span>
          <h2>
            {loading
              ? 'Finding a few more…'
              : error
                ? 'A brief intermission.'
                : hasMore
                  ? 'Keep discovering.'
                  : 'That’s this selection.'}
          </h2>
          <p>
            {error ||
              (hasMore
                ? 'More films based on your preferences.'
                : 'Change your preferences for a different set of films.')}
          </p>
          {hasMore && (
            <Button onClick={retry} disabled={loading}>
              {loading ? 'Loading…' : error ? 'Try again' : 'Load more films'}
              <ArrowDown size={18} />
            </Button>
          )}
          <Button variant="outline" onClick={onEdit}>
            Change preferences
          </Button>
        </section>
      </div>
      <div className="feed-bottom">
        <span aria-live="polite">
          {endVisible
            ? 'Your selection'
            : `${String(active + 1).padStart(2, '0')} / ${movies.length}`}
        </span>
        <span className="feed-scroll-hint">
          Scroll to discover <ArrowDown size={14} />
        </span>
        <div>
          <Button
            variant="outline"
            size="icon"
            className="feed-arrow"
            aria-label="Previous film"
            disabled={!active && !endVisible}
            onClick={() => move(-1)}
          >
            <ArrowUp size={20} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="feed-arrow"
            aria-label="Next film"
            disabled={endVisible}
            onClick={() => move(1)}
          >
            <ArrowDown size={20} />
          </Button>
        </div>
      </div>
      {error && !endVisible && (
        <div className="feed-load-error" role="status">
          More films couldn’t load. <Button onClick={retry}>Retry</Button>
        </div>
      )}
    </main>
  );
};

const FeedFilm = ({
  movie,
  index,
  isActive,
  showTrailer,
  prepareTrailer,
  onWarm,
}: {
  movie: Movie;
  index: number;
  isActive: boolean;
  showTrailer: boolean;
  prepareTrailer: boolean;
  onWarm: (movieId: number) => void;
}) => (
  <article
    className="feed-film"
    data-index={index}
    aria-label={`${index + 1}. ${movie.title}`}
    // Off-screen slides stay out of the tab order and the accessibility tree.
    inert={!isActive}
  >
    {showTrailer && (
      <FeedTrailer
        movieId={movie.id}
        title={movie.title}
        active={isActive}
        prepare={prepareTrailer}
        onWarm={onWarm}
      />
    )}
    <div className="feed-copy">
      <div className="feed-meta">
        <span>{year(movie.release_date)}</span>
        <span>{genreNames(movie.genre_ids, 2).join(' / ')}</span>
        <span>
          <Star size={14} />
          {ratingLabel(movie)}
        </span>
      </div>
      <h1>{movie.title}</h1>
      <div className="feed-actions">
        <MovieLink movieId={movie.id} className={buttonVariants()}>
          Film details
          <ArrowRight size={18} />
        </MovieLink>
        <SaveButton movie={movie} />
      </div>
    </div>
  </article>
);
