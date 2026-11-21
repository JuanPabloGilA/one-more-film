import { notFound } from 'next/navigation';
import { parseId } from './params';
import { TmdbError } from './tmdb';

/** Loads a page's entity from its `[id]` segment, rendering the 404 page for bad or unknown IDs. */
export const loadById = async <T>(rawId: string, load: (id: number) => Promise<T>) => {
  const id = parseId(rawId);
  if (!id) notFound();
  try {
    return await load(id);
  } catch (error) {
    if (error instanceof TmdbError && error.status === 404) notFound();
    throw error;
  }
};
