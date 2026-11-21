import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filmography, keyCrew } from '../lib/details';
import { fullDate, money } from '../lib/format';
import { safeExternalUrl } from '../lib/links';
import type { PersonCredit } from '../lib/types';

const credit = (id: number, overrides: Partial<PersonCredit> = {}): PersonCredit => ({
  id,
  title: `Film ${id}`,
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2020-01-01',
  vote_average: 7,
  vote_count: 10,
  genre_ids: [18],
  ...overrides,
});
test('missing dates and budgets are not presented as real zero values', () => {
  assert.equal(fullDate('2026-11-18'), 'November 18, 2026');
  for (const value of [null, '', '2025-02-30', 'not-a-date'])
    assert.equal(fullDate(value), 'Not listed');
  for (const value of [undefined, 0, -1, Infinity, NaN]) assert.equal(money(value), 'Not reported');
  assert.equal(money(185000000), '$185,000,000');
});
test('external links allow only complete web URLs', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,bad', '//example.com', '', null])
    assert.equal(safeExternalUrl(value), null);
  assert.equal(safeExternalUrl('https://example.com/film'), 'https://example.com/film');
});
test('filmography combines acting and crew roles without duplicate films or adult credits', () => {
  const result = filmography({
    cast: [
      credit(1, { character: 'Alex' }),
      credit(2, { release_date: '', character: 'Self' }),
      credit(3, { adult: true }),
    ],
    crew: [
      credit(1, { job: 'Director' }),
      credit(1, { job: 'Director' }),
      credit(4, { release_date: '2026-11-18', job: 'Producer' }),
    ],
  });
  assert.deepEqual(
    result.map((item) => item.movie.id),
    [4, 1, 2],
  );
  assert.deepEqual(result[1].roles, ['Alex', 'Director']);
  assert.equal('character' in result[1].movie, false);
  assert.equal('job' in result[1].movie, false);
});
test('crew keeps multiple directors and deduplicates repeated role credits', () => {
  const result = keyCrew([
    { id: 1, name: 'A', job: 'Director' },
    { id: 1, name: 'A', job: 'Director' },
    { id: 2, name: 'B', job: 'Director' },
    { id: 1, name: 'A', job: 'Producer' },
  ]);
  assert.equal(result[0].people.length, 2);
  assert.equal(result[1].job, 'Producer');
});
