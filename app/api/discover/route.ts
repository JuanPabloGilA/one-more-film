import { matchesDiscovery, readDiscoveryQuery, tmdbDiscoveryParams } from '@/lib/discovery';
import { isDemoMode, tmdbRequest, TmdbError } from '@/lib/tmdb';
import { demoDetail, demoMovies } from '@/lib/demo';
import type { MovieList } from '@/lib/types';
import { toMovie } from '@/lib/movie';

export const GET = async (request: Request) => {
  let input: ReturnType<typeof readDiscoveryQuery>;
  try {
    input = readDiscoveryQuery(new URL(request.url).searchParams);
  } catch {
    return Response.json(
      { error: 'Please choose valid preferences and try again.' },
      { status: 400 },
    );
  }
  const { preferences, page } = input;
  const now = new Date();
  try {
    if (isDemoMode()) {
      const results = demoMovies.filter((movie) => {
        const runtime = demoDetail(movie.id)?.runtime ?? 0;
        return (
          matchesDiscovery(movie, preferences, now) &&
          (preferences.length === 'any' ||
            (preferences.length === 'short' ? runtime > 0 && runtime <= 100 : runtime >= 120))
        );
      });
      return Response.json({
        results: page === 1 ? results : [],
        page,
        total_pages: 1,
        total_results: results.length,
        demo: true,
      });
    }
    const data = await tmdbRequest<MovieList>(
      'discover/movie',
      tmdbDiscoveryParams(preferences, page, now),
    );
    return Response.json({
      ...data,
      results: data.results
        .filter((movie) => matchesDiscovery(movie, preferences, now))
        .map(toMovie),
      demo: false,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof TmdbError ? error.message : 'Could not find films. Please try again.',
      },
      { status: error instanceof TmdbError ? error.status : 502 },
    );
  }
};
