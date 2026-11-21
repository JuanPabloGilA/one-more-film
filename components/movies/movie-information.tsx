import { ExternalLink } from '@/components/external-link';
import { PeopleLinks } from '@/components/people/people-links';
import { keyCrew } from '@/lib/details';
import { fullDate, money } from '@/lib/format';
import { imdbTitleUrl, safeExternalUrl, tmdbUrl } from '@/lib/links';
import type { MovieDetails } from '@/lib/types';

const names = (items?: { name: string }[]) => items?.map((item) => item.name).join(', ');

export const MovieInformation = ({ movie }: { movie: MovieDetails }) => {
  const crew = keyCrew(movie.credits.crew);
  const website = safeExternalUrl(movie.homepage);
  const imdb = imdbTitleUrl(movie.imdb_id);
  const keywords = movie.keywords?.keywords ?? [];
  const facts = [
    ['Original title', movie.original_title],
    ['Status', movie.status],
    ['Release date', fullDate(movie.release_date)],
    [
      'Spoken languages',
      movie.spoken_languages?.map((language) => language.english_name || language.name).join(', '),
    ],
    ['Production countries', names(movie.production_countries)],
    ['Production companies', names(movie.production_companies)],
    ['Budget (USD)', money(movie.budget)],
    ['Worldwide box office (USD)', money(movie.revenue)],
  ].filter(([, value]) => value);
  return (
    <div className="section-shell movie-information">
      <section aria-labelledby="about-film-heading">
        <span className="eyebrow">A closer look</span>
        <h2 id="about-film-heading">About the film</h2>
        <dl className="detail-facts-grid">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {movie.belongs_to_collection && (
          <p className="detail-collection">
            Part of{' '}
            <ExternalLink href={tmdbUrl.collection(movie.belongs_to_collection.id)}>
              {movie.belongs_to_collection.name}
            </ExternalLink>
          </p>
        )}
        {keywords.length > 0 && (
          <div className="film-themes">
            <h3>Themes</h3>
            <p>{keywords.map((keyword) => keyword.name).join(' / ')}</p>
          </div>
        )}
        <div className="detail-links">
          {website && <ExternalLink href={website}>Official website</ExternalLink>}
          {imdb && <ExternalLink href={imdb}>IMDb</ExternalLink>}
          <ExternalLink href={tmdbUrl.movie(movie.id)}>TMDB</ExternalLink>
        </div>
      </section>
      {crew.length > 0 && (
        <section className="creative-team" aria-labelledby="crew-heading">
          <span className="eyebrow">Behind the camera</span>
          <h2 id="crew-heading">The creative team</h2>
          <dl className="detail-facts-grid">
            {crew.map(({ job, people }) => (
              <div key={job}>
                <dt>{job}</dt>
                <dd>
                  <PeopleLinks people={people} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
};
