import { TmdbError } from './tmdb';

export const jsonError = (message: string, status: number) =>
  Response.json({ error: message }, { status });

/** TMDB errors carry safe, user-facing messages; anything else gets the generic fallback. */
export const errorResponse = (error: unknown, fallbackMessage: string) =>
  error instanceof TmdbError
    ? jsonError(error.message, error.status)
    : jsonError(fallbackMessage, 502);
