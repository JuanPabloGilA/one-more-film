import Link from 'next/link';
import { PersonBiography } from '@/components/people/person-biography';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getPerson, normalizePage, TmdbError } from '@/lib/tmdb';
import { externalUrl, filmography, fullDate } from '@/lib/details';
import { year } from '@/lib/types';
import { PersonPortrait } from '@/components/people/person-portrait';
import { MovieLink } from '@/components/movies/movie-link';
import { MoviePoster } from '@/components/movies/movie-poster';

const loadPerson = async (id: string) => {
  try {
    return await getPerson(/^\d+$/.test(id) ? Number(id) : NaN);
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) notFound();
    throw error;
  }
};
export const generateMetadata = async ({ params }: { params: Promise<{ id: string }> }) => {
  const person = await loadPerson((await params).id);
  return {
    title: person.name,
    description:
      person.biography.slice(0, 160) || `Explore ${person.name}’s biography and film credits.`,
  };
};
const PersonPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) => {
  const person = await loadPerson((await params).id);
  const films = filmography(person.movie_credits);
  const pages = Math.max(1, Math.ceil(films.length / 24));
  const page = Math.min(pages, normalizePage((await searchParams).page));
  const website = externalUrl(person.homepage);
  const personal = [
    ['Known for', person.known_for_department],
    ['Born', person.birthday ? fullDate(person.birthday) : undefined],
    ['Died', person.deathday ? fullDate(person.deathday) : undefined],
    ['Place of birth', person.place_of_birth],
    ['Also known as', person.also_known_as?.filter((name) => name !== person.name).join(' · ')],
  ].filter(([, value]) => value);
  return (
    <main id="main-content" className="section-shell person-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        Discover films
      </Link>
      <div className="person-profile">
        <aside className="person-sidebar" aria-label="Personal details">
          <div className="person-portrait">
            <PersonPortrait
              path={person.profile_path}
              name={person.name}
              sizes="(max-width: 600px) 112px, (max-width: 1000px) 220px, 280px"
              priority
            />
          </div>
          <dl className="person-facts">
            {personal.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="detail-links">
            <a
              className="detail-text-link"
              href={`https://www.themoviedb.org/person/${person.id}`}
              target="_blank"
              rel="noreferrer"
            >
              TMDB ↗
            </a>
            {person.imdb_id && /^nm\d+$/.test(person.imdb_id) && (
              <a
                className="detail-text-link"
                href={`https://www.imdb.com/name/${person.imdb_id}/`}
                target="_blank"
                rel="noreferrer"
              >
                IMDb ↗
              </a>
            )}
            {website && (
              <a className="detail-text-link" href={website} target="_blank" rel="noreferrer">
                Website ↗
              </a>
            )}
          </div>
        </aside>
        <div className="person-story">
          <span className="eyebrow">The people behind the films</span>
          <h1>{person.name}</h1>
          <section className="person-biography" aria-labelledby="biography-heading">
            <h2 id="biography-heading">Biography</h2>
            <PersonBiography text={person.biography || ''} />
          </section>
          <section
            id="filmography"
            className="person-filmography"
            aria-labelledby="filmography-heading"
          >
            <div className="section-heading">
              <div>
                <span className="eyebrow">On screen & behind the camera</span>
                <h2 id="filmography-heading">Filmography</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {films.length} {films.length === 1 ? 'film' : 'films'}
              </span>
            </div>
            {films.length ? (
              <div
                key={page}
                id="filmography-scroll"
                className="filmography-scroll"
                role="region"
                aria-label="Scrollable filmography"
                tabIndex={0}
              >
                <ol className="filmography-list">
                  {films.slice((page - 1) * 24, page * 24).map(({ movie, roles }) => (
                    <li key={movie.id}>
                      <span className="filmography-year">{year(movie.release_date)}</span>
                      <MovieLink
                        movieId={movie.id}
                        className="filmography-poster"
                        ariaLabel={`View ${movie.title}`}
                      >
                        <MoviePoster
                          movieId={movie.id}
                          path={movie.poster_path}
                          title={movie.title}
                          sizes="(max-width: 600px) 36px, 40px"
                        />
                      </MovieLink>
                      <div className="filmography-title">
                        <MovieLink movieId={movie.id}>{movie.title}</MovieLink>
                        <p>{roles.join(' · ') || 'Role not listed'}</p>
                      </div>
                      <MovieLink
                        movieId={movie.id}
                        className="filmography-open"
                        ariaLabel={`Film details for ${movie.title}`}
                      >
                        <ArrowRight size={18} />
                      </MovieLink>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No film credits are listed yet.</p>
            )}
            {pages > 1 && (
              <nav aria-label="Filmography pages" className="filmography-pagination">
                {page > 1 && (
                  <Link
                    href={`/person/${person.id}?page=${page - 1}#filmography`}
                    className="detail-text-link"
                  >
                    ← Previous
                  </Link>
                )}
                <span>
                  Page {page} of {pages}
                </span>
                {page < pages && (
                  <Link
                    href={`/person/${person.id}?page=${page + 1}#filmography`}
                    className="detail-text-link"
                  >
                    Next →
                  </Link>
                )}
              </nav>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};
export default PersonPage;
