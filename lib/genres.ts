// TMDB movie genre IDs: https://developer.themoviedb.org/reference/genre-movie-list
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
export const HORROR_GENRE_ID = 27;

export const isKnownGenre = (id: number) => id in GENRES;
export const genreNames = (ids: number[] = [], limit = ids.length) =>
  ids
    .filter(isKnownGenre)
    .slice(0, limit)
    .map((id) => GENRES[id]);
export const primaryGenre = (ids?: number[]) => genreNames(ids, 1)[0] ?? 'Film';
