import { errorResponse, jsonError } from '@/lib/api-response';
import { parseId } from '@/lib/params';
import { getTrailer } from '@/lib/tmdb';

export const GET = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const id = parseId((await params).id);
  if (!id) return jsonError('Invalid movie.', 400);
  try {
    return Response.json({ trailer: await getTrailer(id) });
  } catch (error) {
    return errorResponse(error, 'Could not load the trailer.');
  }
};
