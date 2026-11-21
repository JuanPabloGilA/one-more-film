import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react';
import { getMovies, normalizePage } from '@/lib/tmdb';
import { GENRES, year } from '@/lib/types';
import { MovieLink } from '@/components/movies/movie-link';
import { MoviePoster } from '@/components/movies/movie-poster';
import { MovieBackdrop } from '@/components/movies/movie-backdrop';
import { Explorer } from '@/components/explorer';
const Home = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 100) : '';
  const window = params.window === 'week' ? 'week' : 'day';
  const page = normalizePage(typeof params.page === 'string' ? params.page : undefined);
  const data = await getMovies({ query, window, page });
  const featured = data.results[0];
  const [title, ...subtitleParts] = (featured?.title ?? '').split(':');
  const subtitle = subtitleParts.join(':').trim();
  const titleSize = title.length > 26 ? 'long' : title.length > 11 ? 'medium' : 'short';
  return (
    <main id="main-content">
      {data.demo && (
        <div className="demo-notice">Preview collection · Sample films, not live trends</div>
      )}
      {!query && page === 1 && featured && (
        <section className="marquee section-shell" aria-labelledby="marquee-title">
          <div className="marquee-top">
            <span>
              01 /{' '}
              {data.demo
                ? 'From the collection'
                : window === 'week'
                  ? 'This week’s feature'
                  : 'Today’s feature'}
            </span>
            <div className="hero-meta">
              <span>{year(featured.release_date)}</span>
              <span>{GENRES[featured.genre_ids[0]] || 'Film'}</span>
              <span className="score">
                <Star size={13} strokeWidth={1.5} />
                {featured.vote_count ? featured.vote_average.toFixed(1) : 'New'}
              </span>
            </div>
          </div>
          <div className="marquee-heading">
            <h1 id="marquee-title" className={`marquee-title marquee-title--${titleSize}`}>
              <span className="marquee-title-main">{title}</span>
              {subtitle && (
                <>
                  <span className="sr-only">: </span>
                  <span className="marquee-subtitle">{subtitle}</span>
                </>
              )}
            </h1>
            <MovieLink
              movieId={featured.id}
              posterName={`backdrop-${featured.id}`}
              artwork="backdrop"
              className="marquee-circle"
              ariaLabel={`Explore ${featured.title}`}
            >
              <ArrowUpRight size={28} strokeWidth={1.5} />
            </MovieLink>
          </div>
          <div className="marquee-visual">
            <MovieLink
              movieId={featured.id}
              posterName={`backdrop-${featured.id}`}
              artwork="backdrop"
              className="marquee-image-link"
              ariaLabel={`View artwork and details for ${featured.title}`}
            >
              <MovieBackdrop
                movieId={featured.id}
                path={featured.backdrop_path}
                fallbackPath={featured.poster_path}
                title={featured.title}
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
              <Link
                href="/discover"
                className={buttonVariants({
                  variant: 'default',
                  className: 'button discovery-cta',
                })}
              >
                Find my next film <ArrowRight size={18} />
              </Link>
            </div>
            <div className="marquee-next">
              <span className="up-next-label">Up next</span>
              {data.results.slice(1, 3).map((movie) => (
                <MovieLink
                  key={movie.id}
                  movieId={movie.id}
                  posterName={`next-${movie.id}`}
                  className="next-film"
                >
                  <MoviePoster
                    movieId={movie.id}
                    name={`next-${movie.id}`}
                    sizes="38px"
                    path={movie.poster_path}
                    title={movie.title}
                  />
                  <span className="next-film-copy">
                    <strong>{movie.title}</strong>
                    <small>{year(movie.release_date)}</small>
                  </span>
                  <ArrowRight size={16} strokeWidth={1.5} />
                </MovieLink>
              ))}
            </div>
          </div>
        </section>
      )}
      <Explorer key={`${query}-${window}-${page}`} data={data} query={query} window={window} />
    </main>
  );
};
export default Home;
