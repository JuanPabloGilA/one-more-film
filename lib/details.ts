import type { CrewMember, Movie, PersonDetails } from './types';
import { toMovie } from './movie';

// Ordered as the "creative team" section lists them.
const KEY_CREW_JOBS = [
  'Director',
  'Screenplay',
  'Writer',
  'Story',
  'Novel',
  'Producer',
  'Director of Photography',
  'Original Music Composer',
  'Editor',
];
export const FILMOGRAPHY_PAGE_SIZE = 24;

const uniqueById = <T extends { id: number }>(items: T[]) => [
  ...new Map(items.map((item) => [item.id, item])).values(),
];

export const directors = (crew: CrewMember[]) =>
  uniqueById(crew.filter((person) => person.job === 'Director'));

export const keyCrew = (crew: CrewMember[]) =>
  KEY_CREW_JOBS.flatMap((job) => {
    const people = uniqueById(crew.filter((person) => person.job === job));
    return people.length ? [{ job, people }] : [];
  });

/** Merges cast and crew credits into one entry per film, newest first. */
export const filmography = (credits: PersonDetails['movie_credits']) => {
  const films = new Map<number, { movie: Movie; roles: string[] }>();
  for (const credit of [...credits.cast, ...credits.crew]) {
    if (credit.adult || !credit.title) continue;
    const film = films.get(credit.id) ?? { movie: toMovie(credit), roles: [] };
    const role = credit.character || credit.job;
    if (role && !film.roles.includes(role)) film.roles.push(role);
    films.set(credit.id, film);
  }
  return [...films.values()].sort(
    (a, b) =>
      (b.movie.release_date || '').localeCompare(a.movie.release_date || '') ||
      a.movie.title.localeCompare(b.movie.title),
  );
};

export const pageCount = (total: number, pageSize: number) =>
  Math.max(1, Math.ceil(total / pageSize));
export const pageSlice = <T>(items: T[], page: number, pageSize: number) =>
  items.slice((page - 1) * pageSize, page * pageSize);
