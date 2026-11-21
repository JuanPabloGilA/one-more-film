import type { MovieDetails, PersonDetails, Movie } from './types';
import { toMovie } from './movie';

export const fullDate = (value?: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Not listed';
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    return 'Not listed';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};
export const money = (value?: number) =>
  value && Number.isFinite(value) && value > 0
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value)
    : 'Not reported';
export const externalUrl = (value?: string | null) => {
  try {
    const url = new URL(value ?? '');
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
export const keyCrew = (crew: MovieDetails['credits']['crew']) => {
  const jobs = [
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
  return jobs.flatMap((job) => {
    const people = [
      ...new Map(
        crew.filter((person) => person.job === job).map((person) => [person.id, person]),
      ).values(),
    ];
    return people.length ? [{ job, people }] : [];
  });
};
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
