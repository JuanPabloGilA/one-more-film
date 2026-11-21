import type { Video } from './types';

const YOUTUBE_VIDEO_ID = /^[\w-]{11}$/;

/** Prefers an official YouTube trailer, falling back to the first unofficial one. */
export const selectTrailer = (videos: Video[]) => {
  const trailers = videos.filter(
    (video) =>
      video.site === 'YouTube' && video.type === 'Trailer' && YOUTUBE_VIDEO_ID.test(video.key),
  );
  return trailers.find((video) => video.official) ?? trailers[0] ?? null;
};
