import { ViewTransition } from 'react';
import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import { Notice } from '@/components/notice';
import { SectionHeading } from '@/components/section-heading';
import { FullCast } from '@/components/movies/full-cast';
import { MovieBackdrop } from '@/components/movies/movie-backdrop';
import { MovieCard } from '@/components/movies/movie-card';
import { MovieInformation } from '@/components/movies/movie-information';
import { BackToMovies } from '@/components/movies/movie-navigation';
import { MoviePoster } from '@/components/movies/movie-poster';
import { Trailer } from '@/components/movies/trailer';
import { CastCard } from '@/components/people/cast-card';
import { PeopleLinks } from '@/components/people/people-links';
import { SaveButton } from '@/components/watchlist/save-button';
import { directors } from '@/lib/details';
import { languageName, ratingLabel, runtimeLabel, year } from '@/lib/format';
import { loadById } from '@/lib/load-by-id';
import { toCastMember, toMovie } from '@/lib/movie';
import { getMovie } from '@/lib/tmdb';
import { selectTrailer } from '@/lib/trailer';
import type { CastMember, Movie } from '@/lib/types';

const CAST_PREVIEW = 6;
const RECOMMENDATIONS = 6;

type Props = { params: Promise<{ id: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const movie = await loadById((await params).id, getMovie);
  return { title: movie.title, description: movie.overview };
};

const MoviePage = async ({ params }: Props) => {
  const movie = await loadById((await params).id, getMovie);
  const trailer = selectTrailer(movie.videos.results);
  const directedBy = directors(movie.credits.crew);
  return (
    <main id="main-content">
      {movie.demo && (
        <Notice>
          Preview collection <span>·</span> Sample movie details. TMDB connection pending.
        </Notice>
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
                      {ratingLabel(movie, 'Not rated')}
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
                    <dd>
                      {directedBy.length ? <PeopleLinks people={directedBy} /> : 'Not available'}
                    </dd>
                  </div>
                  <div>
                    <dt>Original language</dt>
                    <dd>{languageName(movie.original_language)}</dd>
                  </div>
                  <div>
                    <dt>TMDB votes</dt>
                    <dd>{movie.vote_count.toLocaleString('en-US')}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CastSection cast={movie.credits.cast.map(toCastMember)} title={movie.title} />
      <MovieInformation movie={movie} />
      <Recommendations
        movies={movie.recommendations.results.filter((item) => item.id !== movie.id)}
      />
    </main>
  );
};
export default MoviePage;

const CastSection = ({ cast, title }: { cast: CastMember[]; title: string }) => {
  if (!cast.length) return null;
  return (
    <section className="section-shell cast-section">
      <SectionHeading eyebrow="The people behind the film" title="Meet the cast">
        {cast.length > CAST_PREVIEW && <FullCast title={title} cast={cast} />}
      </SectionHeading>
      <div className="cast-grid">
        {cast.slice(0, CAST_PREVIEW).map((person, index) => (
          // One actor can play several roles, so the ID alone is not a unique key.
          <CastCard
            key={`${person.id}-${index}`}
            person={person}
            className="cast-card"
            sizes="(max-width: 760px) 64px, 72px"
          />
        ))}
      </div>
    </section>
  );
};

const Recommendations = ({ movies }: { movies: Movie[] }) => {
  if (!movies.length) return null;
  return (
    <section className="section-shell recommendations">
      <SectionHeading eyebrow="More to discover" title="You might also like" />
      <div className="movie-grid">
        {movies.slice(0, RECOMMENDATIONS).map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
};
