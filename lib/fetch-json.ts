/** Fetches one of this app's API routes, surfacing the route's `{ error }` message on failure. */
export const fetchJson = async <T>(
  url: string,
  fallbackError: string,
  init?: RequestInit,
  fetcher: typeof fetch = fetch,
): Promise<T> => {
  const response = await fetcher(url, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || fallbackError);
  return data as T;
};
