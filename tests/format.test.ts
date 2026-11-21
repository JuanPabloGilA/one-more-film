import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countLabel, languageName, ratingLabel, runtimeLabel, year } from '../lib/format';
import { genreNames, primaryGenre } from '../lib/genres';

test('ratings read "New" until a film has votes', () => {
  assert.equal(ratingLabel({ vote_average: 7.25, vote_count: 12 }), '7.3');
  assert.equal(ratingLabel({ vote_average: 0, vote_count: 0 }), 'New');
  assert.equal(ratingLabel({ vote_average: 0, vote_count: 0 }, 'Not rated'), 'Not rated');
});

test('counts pluralize and group thousands the same way on server and client', () => {
  assert.equal(countLabel(1, 'film'), '1 film');
  assert.equal(countLabel(0, 'film'), '0 films');
  assert.equal(countLabel(2431, 'film'), '2,431 films');
});

test('years, runtimes and languages degrade to readable fallbacks', () => {
  assert.equal(year('2024-02-27'), '2024');
  assert.equal(year(''), 'TBA');
  assert.equal(runtimeLabel(167), '2h 47m');
  assert.equal(runtimeLabel(null), 'Runtime unavailable');
  assert.equal(languageName('ko'), 'Korean');
  assert.equal(languageName('not a code'), 'not a code');
});

test('genre labels skip unknown IDs', () => {
  assert.deepEqual(genreNames([99999, 878, 12, 18], 2), ['Science Fiction', 'Adventure']);
  assert.equal(primaryGenre([99999]), 'Film');
  assert.equal(primaryGenre(undefined), 'Film');
});
