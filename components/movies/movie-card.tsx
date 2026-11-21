import { Star } from 'lucide-react';
import { MovieLink } from '@/components/movies/movie-link';
import { MoviePoster } from '@/components/movies/movie-poster';
import { SaveButton } from '@/components/watchlist/save-button';
import { ratingLabel, year } from '@/lib/format';
import { primaryGenre } from '@/lib/genres';
import type { Movie } from '@/lib/types';

export const MovieCard = ({ movie, priority = false }: { movie: Movie; priority?: boolean }) => (
  <article className="movie-card">
    <div className="poster-wrap">
      <MovieLink movieId={movie.id} ariaLabel={`View ${movie.title}`} className="poster-link">
        <MoviePoster
          movieId={movie.id}
          path={movie.poster_path}
          title={movie.title}
          priority={priority}
        />
      </MovieLink>
      <SaveButton movie={movie} compact />
    </div>
    <MovieLink movieId={movie.id} className="movie-title">
      {movie.title}
    </MovieLink>
    <div className="movie-caption">
      <p className="movie-meta">
        {year(movie.release_date)}
        <span>·</span>
        {primaryGenre(movie.genre_ids)}
      </p>
      <span className="film-rating">
        <Star size={12} strokeWidth={1.5} />
        {ratingLabel(movie)}
      </span>
    </div>
  </article>
);
