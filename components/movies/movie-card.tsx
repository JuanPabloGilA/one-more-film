import { Star } from 'lucide-react';
import { GENRES, year, type Movie } from '@/lib/types';
import { MovieLink } from '@/components/movies/movie-link';
import { MoviePoster } from '@/components/movies/movie-poster';
import { SaveButton } from '@/components/watchlist/save-button';
export const MovieCard = ({ movie }: { movie: Movie }) => (
  <article className="movie-card">
    <div className="poster-wrap">
      <MovieLink movieId={movie.id} ariaLabel={`View ${movie.title}`} className="poster-link">
        <MoviePoster movieId={movie.id} path={movie.poster_path} title={movie.title} />
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
        {GENRES[movie.genre_ids?.[0]] || 'Film'}
      </p>
      <span className="film-rating">
        <Star size={12} strokeWidth={1.5} />
        {movie.vote_count ? movie.vote_average.toFixed(1) : 'New'}
      </span>
    </div>
  </article>
);
