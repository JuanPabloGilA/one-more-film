import { isDemoMode, tmdbRequest, TmdbError } from '@/lib/tmdb';
import { demoDetail } from '@/lib/demo';
import { selectTrailer } from '@/lib/trailer';
import type { MovieDetails } from '@/lib/types';
export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1)
    return Response.json({ error: 'Invalid movie.' }, { status: 400 });
  try {
    const videos = isDemoMode()
      ? (demoDetail(Number(id))?.videos.results ?? [])
      : (await tmdbRequest<MovieDetails['videos']>(`movie/${id}/videos`)).results;
    const video = selectTrailer(videos);
    return Response.json({ trailer: video ? { key: video.key, name: video.name } : null });
  } catch (error) {
    return Response.json(
      { error: error instanceof TmdbError ? error.message : 'Could not load the trailer.' },
      { status: error instanceof TmdbError ? error.status : 502 },
    );
  }
};
