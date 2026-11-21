import type { MovieDetails } from './types';
export const selectTrailer = (videos: MovieDetails['videos']['results']) => {
  let fallback: (typeof videos)[number] | null = null;
  for (const video of videos) {
    if (video.site !== 'YouTube' || video.type !== 'Trailer' || !/^[\w-]{11}$/.test(video.key))
      continue;
    if (video.official) return video;
    fallback ??= video;
  }
  return fallback;
};
