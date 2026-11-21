import Link from 'next/link';
import type { MovieDetails } from '@/lib/types';
import { externalUrl, fullDate, keyCrew, money } from '@/lib/details';

export const MovieInformation = ({ movie }: { movie: MovieDetails }) => {
  const crew = keyCrew(movie.credits.crew);
  const website = externalUrl(movie.homepage);
  const facts = [
    ['Original title', movie.original_title],
    ['Status', movie.status],
    ['Release date', fullDate(movie.release_date)],
    [
      'Spoken languages',
      movie.spoken_languages?.map((language) => language.english_name || language.name).join(', '),
    ],
    ['Production countries', movie.production_countries?.map((country) => country.name).join(', ')],
    ['Production companies', movie.production_companies?.map((company) => company.name).join(', ')],
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
            <a
              className="detail-text-link"
              href={`https://www.themoviedb.org/collection/${movie.belongs_to_collection.id}`}
              target="_blank"
              rel="noreferrer"
            >
              {movie.belongs_to_collection.name} ↗
            </a>
          </p>
        )}
        {!!movie.keywords?.keywords.length && (
          <div className="film-themes">
            <h3>Themes</h3>
            <p>{movie.keywords.keywords.map((keyword) => keyword.name).join(' / ')}</p>
          </div>
        )}
        <div className="detail-links">
          {website && (
            <a className="detail-text-link" href={website} target="_blank" rel="noreferrer">
              Official website ↗
            </a>
          )}
          {movie.imdb_id && /^tt\d+$/.test(movie.imdb_id) && (
            <a
              className="detail-text-link"
              href={`https://www.imdb.com/title/${movie.imdb_id}/`}
              target="_blank"
              rel="noreferrer"
            >
              IMDb ↗
            </a>
          )}
          <a
            className="detail-text-link"
            href={`https://www.themoviedb.org/movie/${movie.id}`}
            target="_blank"
            rel="noreferrer"
          >
            TMDB ↗
          </a>
        </div>
      </section>
      {!!crew.length && (
        <section className="creative-team" aria-labelledby="crew-heading">
          <span className="eyebrow">Behind the camera</span>
          <h2 id="crew-heading">The creative team</h2>
          <dl className="detail-facts-grid">
            {crew.map(({ job, people }) => (
              <div key={job}>
                <dt>{job}</dt>
                <dd>
                  {people.map((person, index) => (
                    <span key={person.id}>
                      {index > 0 && ', '}
                      <Link className="person-link" href={`/person/${person.id}`}>
                        {person.name}
                      </Link>
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
};
