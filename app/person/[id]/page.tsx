import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ExternalLink } from '@/components/external-link';
import { Pagination } from '@/components/pagination';
import { MovieLink } from '@/components/movies/movie-link';
import { MoviePoster } from '@/components/movies/movie-poster';
import { PersonBiography } from '@/components/people/person-biography';
import { PersonPortrait } from '@/components/people/person-portrait';
import { FILMOGRAPHY_PAGE_SIZE, filmography, pageCount, pageSlice } from '@/lib/details';
import { countLabel, fullDate, year } from '@/lib/format';
import { imdbNameUrl, routes, safeExternalUrl, tmdbUrl } from '@/lib/links';
import { loadById } from '@/lib/load-by-id';
import { normalizePage } from '@/lib/params';
import { getPerson } from '@/lib/tmdb';
import type { Movie, PersonDetails } from '@/lib/types';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const generateMetadata = async ({ params }: Pick<Props, 'params'>): Promise<Metadata> => {
  const person = await loadById((await params).id, getPerson);
  return {
    title: person.name,
    description:
      person.biography.slice(0, 160) || `Explore ${person.name}’s biography and film credits.`,
  };
};

const PersonPage = async ({ params, searchParams }: Props) => {
  const person = await loadById((await params).id, getPerson);
  const films = filmography(person.movie_credits);
  const totalPages = pageCount(films.length, FILMOGRAPHY_PAGE_SIZE);
  const page = Math.min(totalPages, normalizePage((await searchParams).page));
  return (
    <main id="main-content" className="section-shell person-page">
      <Link href={routes.home} className="back-link">
        <ArrowLeft size={16} />
        Discover films
      </Link>
      <div className="person-profile">
        <PersonSidebar person={person} />
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
                {countLabel(films.length, 'film')}
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
                  {pageSlice(films, page, FILMOGRAPHY_PAGE_SIZE).map(({ movie, roles }) => (
                    <FilmographyEntry key={movie.id} movie={movie} roles={roles} />
                  ))}
                </ol>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No film credits are listed yet.</p>
            )}
            <Pagination
              page={page}
              totalPages={totalPages}
              hrefForPage={(target) => `${routes.person(person.id)}?page=${target}#filmography`}
              label="Filmography pages"
              className="filmography-pagination"
              linkClassName="detail-text-link"
            />
          </section>
        </div>
      </div>
    </main>
  );
};
export default PersonPage;

const PersonSidebar = ({ person }: { person: PersonDetails }) => {
  const website = safeExternalUrl(person.homepage);
  const imdb = imdbNameUrl(person.imdb_id);
  const facts = [
    ['Known for', person.known_for_department],
    ['Born', person.birthday && fullDate(person.birthday)],
    ['Died', person.deathday && fullDate(person.deathday)],
    ['Place of birth', person.place_of_birth],
    ['Also known as', person.also_known_as?.filter((name) => name !== person.name).join(' · ')],
  ].filter(([, value]) => value);
  return (
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
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="detail-links">
        <ExternalLink href={tmdbUrl.person(person.id)}>TMDB</ExternalLink>
        {imdb && <ExternalLink href={imdb}>IMDb</ExternalLink>}
        {website && <ExternalLink href={website}>Website</ExternalLink>}
      </div>
    </aside>
  );
};

const FilmographyEntry = ({ movie, roles }: { movie: Movie; roles: string[] }) => (
  <li>
    <span className="filmography-year">{year(movie.release_date)}</span>
    <MovieLink movieId={movie.id} className="filmography-poster" ariaLabel={`View ${movie.title}`}>
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
);
