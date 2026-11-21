import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseWatchlist } from '../lib/watchlist';
import { demoMovies } from '../lib/demo';
import { toMovie } from '../lib/movie';
test('damaged, old, or malicious browser storage cannot crash the watchlist', () => {
  for (const raw of [null, '{broken', '{}', 'null', '[null,1,"x",{"id":4}]'])
    assert.deepEqual(parseWatchlist(raw), []);
});
test('stored movies round-trip and duplicate IDs are removed', () => {
  const movie = demoMovies[0];
  assert.deepEqual(parseWatchlist(JSON.stringify([movie, movie])), [movie]);
});

test('saving details strips cast, videos, and unrelated API fields', () => {
  const detail = {
    ...demoMovies[0],
    credits: { cast: [{ name: 'Actor' }] },
    videos: { results: [{ key: 'abcdefghijk' }] },
    budget: 1000000,
  };
  assert.deepEqual(toMovie(detail), demoMovies[0]);
  assert.deepEqual(parseWatchlist(JSON.stringify([detail])), [demoMovies[0]]);
});

test('older saves receive safe defaults and malformed genres cannot reach rendering', () => {
  const oldMovie = {
    ...demoMovies[0],
    overview: undefined,
    vote_count: 'bad',
    backdrop_path: {},
    original_language: undefined,
    genre_ids: [35, null, '27', {}, -1, 2.5],
  };
  const [movie] = parseWatchlist(JSON.stringify([oldMovie]));
  assert.equal(movie.overview, '');
  assert.equal(movie.vote_count, 0);
  assert.equal(movie.backdrop_path, null);
  assert.deepEqual(movie.genre_ids, [35]);
  assert.deepEqual(parseWatchlist(JSON.stringify([{ ...demoMovies[0], vote_average: '7' }])), []);
});

test('watchlist parsing caps the number of saved films', () => {
  const movies = Array.from({ length: 600 }, (_, index) => ({ ...demoMovies[0], id: index + 1 }));
  assert.equal(parseWatchlist(JSON.stringify(movies)).length, 500);
});
