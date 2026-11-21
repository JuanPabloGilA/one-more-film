import { errorResponse, jsonError } from '@/lib/api-response';
import { INVALID_PREFERENCES_MESSAGE, readDiscoveryQuery } from '@/lib/discovery';
import { discoverMovies } from '@/lib/tmdb';

export const GET = async (request: Request) => {
  const input = readDiscoveryQuery(new URL(request.url).searchParams);
  if (!input) return jsonError(INVALID_PREFERENCES_MESSAGE, 400);
  try {
    return Response.json(await discoverMovies(input.preferences, input.page));
  } catch (error) {
    return errorResponse(error, 'Could not find films. Please try again.');
  }
};
