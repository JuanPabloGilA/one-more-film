// Request parameter limits shared by server pages, API routes and client requests.

/** TMDB serves at most 500 pages for any list endpoint. */
export const TMDB_MAX_PAGE = 500;
export const MAX_QUERY_LENGTH = 100;

export const normalizeQuery = (value?: string) => value?.trim().slice(0, MAX_QUERY_LENGTH) ?? '';

export const normalizePage = (value?: string) =>
  /^\d+$/.test(value ?? '') ? Math.min(TMDB_MAX_PAGE, Math.max(1, Number(value))) : 1;

export const isValidId = (id: number) => Number.isSafeInteger(id) && id > 0;

/** Parses a route segment such as `/movie/[id]`; returns null for anything but a positive integer. */
export const parseId = (value: string) => {
  const id = /^\d+$/.test(value) ? Number(value) : NaN;
  return isValidId(id) ? id : null;
};

/** Reads a single search parameter, ignoring repeated keys. */
export const singleParam = (value: string | string[] | undefined) =>
  typeof value === 'string' ? value : undefined;
