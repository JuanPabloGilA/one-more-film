import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_GENRES,
  applyCatalogueFilters,
  availableGenres,
  readCatalogueFilters,
} from '../lib/catalogue';
import { demoMovies } from '../lib/demo';

const params = (query: string) => new URLSearchParams(query);

test('available genres are the known genres on the page, alphabetically', () => {
  const genres = availableGenres([
    { ...demoMovies[0], genre_ids: [878, 12, 99999] },
    { ...demoMovies[1], genre_ids: [18, 12] },
  ]);
  assert.deepEqual(genres, [12, 18, 878]); // Adventure, Drama, Science Fiction
});

test('URL filters fall back to defaults when missing, unknown or not on this page', () => {
  const genres = [12, 18];
  assert.deepEqual(readCatalogueFilters(params(''), genres), {
    genre: ALL_GENRES,
    sort: 'trending',
  });
  assert.deepEqual(readCatalogueFilters(params('genre=18&sort=rating'), genres), {
    genre: 18,
    sort: 'rating',
  });
  assert.deepEqual(readCatalogueFilters(params('genre=27&sort=loudest'), genres), {
    genre: ALL_GENRES,
    sort: 'trending',
  });
});

test('filters keep TMDB order for trending and never mutate the input', () => {
  const movies = demoMovies.slice(0, 4);
  const original = [...movies];
  const trending = applyCatalogueFilters(movies, { genre: ALL_GENRES, sort: 'trending' });
  assert.deepEqual(trending, original);
  const rated = applyCatalogueFilters(movies, { genre: ALL_GENRES, sort: 'rating' });
  assert.deepEqual(
    rated.map((movie) => movie.vote_average),
    [8.4, 8.2, 8.1, 7.0],
  );
  const newest = applyCatalogueFilters(movies, { genre: 12, sort: 'newest' });
  assert.ok(newest.every((movie) => movie.genre_ids.includes(12)));
  assert.deepEqual(
    newest.map((movie) => movie.release_date),
    [...newest.map((movie) => movie.release_date)].sort().reverse(),
  );
  assert.deepEqual(movies, original);
});
