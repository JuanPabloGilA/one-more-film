import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react';
import { MovieBackdrop } from '@/components/movies/movie-backdrop';
import { MovieLink } from '@/components/movies/movie-link';
import { MoviePoster } from '@/components/movies/movie-poster';
import { buttonVariants } from '@/components/ui/button';
import { ratingLabel, year } from '@/lib/format';
import { primaryGenre } from '@/lib/genres';
import { routes } from '@/lib/links';
import type { Movie } from '@/lib/types';

/** "Dune: Part Two" becomes a main title and a smaller subtitle. */
const splitTitle = (title: string) => {
  const [main, ...rest] = title.split(':');
  return { main, subtitle: rest.join(':').trim() };
};

// Very long titles step down in size so the marquee keeps its proportions.
const titleSize = (title: string) =>
  title.length > 26 ? 'long' : title.length > 11 ? 'medium' : 'short';

/** The home page marquee: the top film, a call to discover and the next two films. */
export const FeaturedFilm = ({
  movie,
  upNext,
  eyebrow,
}: {
  movie: Movie;
  upNext: Movie[];
  eyebrow: string;
}) => {
  const { main, subtitle } = splitTitle(movie.title);
  const backdropName = `backdrop-${movie.id}`;
  return (
    <section className="marquee section-shell" aria-labelledby="marquee-title">
      <div className="marquee-top">
        <span>01 / {eyebrow}</span>
        <div className="hero-meta">
          <span>{year(movie.release_date)}</span>
          <span>{primaryGenre(movie.genre_ids)}</span>
          <span className="score">
            <Star size={13} strokeWidth={1.5} />
            {ratingLabel(movie)}
          </span>
        </div>
      </div>
      <div className="marquee-heading">
        <h1 id="marquee-title" className={`marquee-title marquee-title--${titleSize(main)}`}>
          <span className="marquee-title-main">{main}</span>
          {subtitle && (
            <>
              <span className="sr-only">: </span>
              <span className="marquee-subtitle">{subtitle}</span>
            </>
          )}
        </h1>
        <MovieLink
          movieId={movie.id}
          posterName={backdropName}
          artwork="backdrop"
          className="marquee-circle"
          ariaLabel={`Explore ${movie.title}`}
        >
          <ArrowUpRight size={28} strokeWidth={1.5} />
        </MovieLink>
      </div>
      <div className="marquee-visual">
        <MovieLink
          movieId={movie.id}
          posterName={backdropName}
          artwork="backdrop"
          className="marquee-image-link"
          ariaLabel={`View artwork and details for ${movie.title}`}
        >
          <MovieBackdrop
            movieId={movie.id}
            path={movie.backdrop_path}
            fallbackPath={movie.poster_path}
            title={movie.title}
          />
        </MovieLink>
      </div>
      <div className="marquee-bottom">
        <div className="marquee-caption discovery-invitation">
          <div>
            <p>Not sure what to watch?</p>
            <span className="discovery-explainer">
              Pick your mood. Watch the trailers. Find your film.
            </span>
          </div>
          <Link href={routes.discover} className={buttonVariants({ className: 'discovery-cta' })}>
            Find my next film <ArrowRight size={18} />
          </Link>
        </div>
        <div className="marquee-next">
          <span className="up-next-label">Up next</span>
          {upNext.map((film) => (
            <MovieLink
              key={film.id}
              movieId={film.id}
              posterName={`next-${film.id}`}
              className="next-film"
            >
              <MoviePoster
                movieId={film.id}
                name={`next-${film.id}`}
                sizes="38px"
                path={film.poster_path}
                title={film.title}
              />
              <span className="next-film-copy">
                <strong>{film.title}</strong>
                <small>{year(film.release_date)}</small>
              </span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </MovieLink>
          ))}
        </div>
      </div>
    </section>
  );
};
