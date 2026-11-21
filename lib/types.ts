export type Movie = {
  id: number;
  original_language?: string;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
};
export type MovieList = {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
  demo: boolean;
};
export type MovieDetails = Movie & {
  tagline: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  original_language: string;
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  videos: {
    results: { key: string; site: string; type: string; official: boolean; name: string }[];
  };
  recommendations: { results: Movie[] };
  demo: boolean;
};
export const GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};
export const imageUrl = (
  path: string | null,
  size: 'w500' | 'w185' | 'w1280' | 'original' = 'w500',
) => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null);
export const year = (date: string) => date?.slice(0, 4) || 'TBA';
export const runtimeLabel = (minutes: number | null) =>
  minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : 'Runtime unavailable';
