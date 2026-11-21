import { cache } from 'react';
import { demoDetail, demoMovies } from './demo';
import { toMovie } from './movie';
import type { MovieDetails, MovieList, PersonDetails } from './types';

export class TmdbError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}
export const isDemoMode = () =>
  !process.env.TMDB_READ_ACCESS_TOKEN && process.env.TMDB_DEMO_MODE === 'true';
export const normalizePage = (value?: string) =>
  /^\d+$/.test(value ?? '') ? Math.min(500, Math.max(1, Number(value))) : 1;

export const tmdbRequest = async <T>(
  path: string,
  params: Record<string, string> = {},
  fetcher: typeof fetch = fetch,
): Promise<T> => {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token)
    throw new TmdbError(
      'Movie data is not connected yet. Please configure the TMDB access token.',
      503,
    );
  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  url.search = new URLSearchParams({ language: 'en-US', ...params }).toString();
  let response: Response;
  try {
    response = await fetcher(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 300 },
    });
  } catch {
    throw new TmdbError('The movie service is taking too long to respond. Please try again.');
  }
  if (!response.ok) {
    if (response.status === 404) throw new TmdbError('This movie could not be found.', 404);
    if (response.status === 429)
      throw new TmdbError('The movie service is busy. Please try again in a moment.', 429);
    throw new TmdbError('We could not load movie data. Please try again shortly.');
  }
  return response.json() as Promise<T>;
};

export const getMovies = async (
  options: { query?: string; window?: string; page?: number } = {},
): Promise<MovieList> => {
  const query = options.query?.trim().slice(0, 100) ?? '';
  const window = options.window === 'week' ? 'week' : 'day';
  const page = options.page ?? 1;
  if (isDemoMode()) {
    const results = demoMovies.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase()),
    );
    return {
      results: page === 1 ? results : [],
      page,
      total_pages: 1,
      total_results: results.length,
      demo: true,
    };
  }
  const data = await tmdbRequest<Omit<MovieList, 'demo'>>(
    query ? 'search/movie' : `trending/movie/${window}`,
    { page: String(page), ...(query ? { query, include_adult: 'false' } : {}) },
  );
  return { ...data, results: data.results.map(toMovie), demo: false };
};

export const getMovie = cache(async (id: number): Promise<MovieDetails> => {
  if (!Number.isSafeInteger(id) || id < 1)
    throw new TmdbError('This movie could not be found.', 404);
  if (isDemoMode()) {
    const movie = demoDetail(id);
    if (!movie) throw new TmdbError('This movie could not be found.', 404);
    return movie;
  }
  const data = await tmdbRequest<MovieDetails>(`movie/${id}`, {
    append_to_response: 'credits,videos,recommendations,keywords',
  });
  return {
    ...data,
    genre_ids: data.genres.map((genre) => genre.id),
    recommendations: { results: data.recommendations.results.map(toMovie) },
    demo: false,
  };
});

export const getPerson = cache(async (id: number): Promise<PersonDetails> => {
  if (!Number.isSafeInteger(id) || id < 1 || isDemoMode())
    throw new TmdbError('This person could not be found.', 404);
  return tmdbRequest<PersonDetails>(`person/${id}`, { append_to_response: 'movie_credits' });
});
