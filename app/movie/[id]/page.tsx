import { ViewTransition } from 'react';
import { MovieBackdrop } from '@/components/movies/movie-backdrop';
import { MoviePoster } from '@/components/movies/movie-poster';
import { BackToMovies } from '@/components/movies/movie-navigation';
import { notFound } from 'next/navigation';
import { Star } from 'lucide-react';
import { getMovie, TmdbError } from '@/lib/tmdb';
import { imageUrl, runtimeLabel, year } from '@/lib/types';
import { toMovie } from '@/lib/movie';
import { selectTrailer } from '@/lib/trailer';
import { MovieImage } from '@/components/movies/movie-image';
import { SaveButton } from '@/components/watchlist/save-button';
import { MovieCard } from '@/components/movies/movie-card';
import { Trailer } from '@/components/movies/trailer';
import { FullCast } from '@/components/movies/full-cast';
const loadMovie = async (id: string) => {
  try {
    return await getMovie(/^\d+$/.test(id) ? Number(id) : NaN);
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) notFound();
    throw error;
  }
};
export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }) => {
  const movie = await loadMovie((await params).id);
  return { title: movie.title, description: movie.overview };
};
const MoviePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const movie = await loadMovie((await params).id);
  const director = movie.credits.crew.find((person) => person.job === 'Director');
  const trailer = selectTrailer(movie.videos.results);
  return (
    <main id="main-content">
      {movie.demo && (
        <div className="demo-notice">
          Preview collection <span>·</span> Sample movie details. TMDB connection pending.
        </div>
      )}
      <section className="detail-hero">
        <div className="section-shell detail-content">
          <BackToMovies movieId={movie.id} />
          <MovieBackdrop
            movieId={movie.id}
            path={movie.backdrop_path}
            fallbackPath={movie.poster_path}
            title={movie.title}
            detail
            className="detail-scene"
          />
          <div className="detail-layout">
            <MoviePoster
              movieId={movie.id}
              path={movie.poster_path}
              title={movie.title}
              detail
              priority
              className="detail-poster"
            />
            <div className="detail-info">
              <ViewTransition enter="detail-copy" default="none">
                <div className="detail-heading">
                  <span className="eyebrow">
                    {movie.genres.map((genre) => genre.name).join(' / ')}
                  </span>
                  <h1>{movie.title}</h1>
                  {movie.tagline && <p className="tagline">{movie.tagline}</p>}
                  <div className="hero-meta">
                    <span className="score">
                      <Star size={16} strokeWidth={1.5} />
                      {movie.vote_count ? movie.vote_average.toFixed(1) : 'Not rated'}
                    </span>
                    <span>{year(movie.release_date)}</span>
                    <span>{runtimeLabel(movie.runtime)}</span>
                  </div>
                </div>
              </ViewTransition>
              <div className="detail-body">
                <p className="detail-overview">
                  {movie.overview || 'An overview is not available for this film yet.'}
                </p>
                <div className="hero-actions">
                  {trailer && <Trailer videoKey={trailer.key} title={movie.title} />}
                  <SaveButton movie={toMovie(movie)} />
                </div>
                <dl className="film-facts">
                  <div>
                    <dt>Director</dt>
                    <dd>{director?.name ?? 'Not available'}</dd>
                  </div>
                  <div>
                    <dt>Original language</dt>
                    <dd>
                      {new Intl.DisplayNames(['en'], { type: 'language' }).of(
                        movie.original_language,
                      ) || movie.original_language}
                    </dd>
                  </div>
                  <div>
                    <dt>TMDB votes</dt>
                    <dd>{movie.vote_count.toLocaleString()}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
      {movie.credits.cast.length > 0 && (
        <section className="section-shell cast-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">The people behind the film</span>
              <h2>Meet the cast</h2>
            </div>
            {movie.credits.cast.length > 6 && (
              <FullCast
                title={movie.title}
                cast={movie.credits.cast.map(({ id, name, character, profile_path }) => ({
                  id,
                  name,
                  character,
                  profile_path,
                }))}
              />
            )}
          </div>
          <div className="cast-grid">
            {movie.credits.cast.slice(0, 6).map((person) => (
              <article key={person.id} className="cast-card">
                <div className="cast-photo">
                  <MovieImage
                    src={imageUrl(person.profile_path, 'w185')}
                    alt={person.name}
                    sizes="(max-width: 760px) 64px, 72px"
                  />
                </div>
                <h3>{person.name}</h3>
                <p>{person.character}</p>
              </article>
            ))}
          </div>
        </section>
      )}
      {movie.recommendations.results.length > 0 && (
        <section className="section-shell recommendations">
          <div className="section-heading">
            <div>
              <span className="eyebrow">More to discover</span>
              <h2>You might also like</h2>
            </div>
          </div>
          <div className="movie-grid">
            {movie.recommendations.results
              .filter((item) => item.id !== movie.id)
              .slice(0, 6)
              .map((item) => (
                <MovieCard key={item.id} movie={item} />
              ))}
          </div>
        </section>
      )}
    </main>
  );
};
export default MoviePage;
