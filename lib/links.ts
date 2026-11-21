// Every URL the app builds, internal and external, lives here.

export const TMDB_IMAGE_HOST = 'image.tmdb.org';
const TMDB_SITE = 'https://www.themoviedb.org';
const IMDB_SITE = 'https://www.imdb.com';
export const YOUTUBE_EMBED_ORIGIN = 'https://www.youtube-nocookie.com';

export type ImageSize = 'w185' | 'w500' | 'w1280' | 'original';

export const routes = {
  home: '/',
  discover: '/discover',
  watchlist: '/watchlist',
  mediaKit: '/media-kit',
  movie: (id: number) => `/movie/${id}`,
  person: (id: number) => `/person/${id}`,
};

export const imageUrl = (path: string | null, size: ImageSize = 'w500') =>
  path ? `https://${TMDB_IMAGE_HOST}/t/p/${size}${path}` : null;

export const tmdbUrl = {
  home: TMDB_SITE,
  movie: (id: number) => `${TMDB_SITE}/movie/${id}`,
  person: (id: number) => `${TMDB_SITE}/person/${id}`,
  collection: (id: number) => `${TMDB_SITE}/collection/${id}`,
};

// IMDb IDs come from TMDB; validate them before they become hrefs.
export const imdbTitleUrl = (id?: string | null) =>
  id && /^tt\d+$/.test(id) ? `${IMDB_SITE}/title/${id}/` : null;
export const imdbNameUrl = (id?: string | null) =>
  id && /^nm\d+$/.test(id) ? `${IMDB_SITE}/name/${id}/` : null;

export const youtubeWatchUrl = (videoKey: string) =>
  `https://www.youtube.com/watch?v=${encodeURIComponent(videoKey)}`;
export const youtubeEmbedUrl = (videoKey: string, params?: Record<string, string>) =>
  `${YOUTUBE_EMBED_ORIGIN}/embed/${encodeURIComponent(videoKey)}${params ? `?${new URLSearchParams(params)}` : ''}`;

/** Only http(s) URLs from upstream data may be rendered as links. */
export const safeExternalUrl = (value?: string | null) => {
  try {
    const url = new URL(value ?? '');
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
};
