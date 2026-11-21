import type { Movie } from './types';

// Keep API-only fields (especially credits and videos) out of client props and storage.
export const toMovie = (movie: Movie): Movie => ({
  id: movie.id,
  title: movie.title,
  original_language: movie.original_language,
  overview: movie.overview,
  poster_path: movie.poster_path,
  backdrop_path: movie.backdrop_path,
  release_date: movie.release_date,
  vote_average: movie.vote_average,
  vote_count: movie.vote_count,
  genre_ids: movie.genre_ids,
});
