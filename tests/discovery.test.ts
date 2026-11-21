import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  matchesDiscovery,
  readDiscoveryQuery,
  tmdbDiscoveryParams,
  discoveryQuery,
} from '../lib/discovery';

test('discovery validates genres, preference enums and page bounds', () => {
  for (const query of [
    'genres=28,18,35,27',
    'genres=99999',
    'genres=28.1',
    'era=bad',
    'length=bad',
    'page=0',
    'page=501',
    'page=1.5',
  ]) {
    assert.throws(() => readDiscoveryQuery(new URLSearchParams(query)));
  }
  assert.deepEqual(readDiscoveryQuery(new URLSearchParams('genres=28,28,18&page=2')), {
    preferences: { genres: [28, 18], era: 'any', length: 'any' },
    page: 2,
  });
});
test('preferences constrain actual TMDB results with OR genres and runtime/date limits', () => {
  const preferences = { genres: [28, 53], era: 'recent', length: 'short' } as const;
  const mutable = { ...preferences, genres: [...preferences.genres] };
  const params = tmdbDiscoveryParams(mutable, 3, new Date('2026-11-21'));
  assert.equal(params.with_genres, '28|53');
  assert.equal(params['primary_release_date.gte'], '2021-11-21');
  assert.equal(params['primary_release_date.lte'], '2026-11-21');
  assert.equal(params['with_runtime.lte'], '100');
  assert.equal(params['with_runtime.gte'], '1');
  assert.equal(params.include_adult, 'false');
  assert.equal(params.with_original_language, 'en');
  assert.deepEqual(readDiscoveryQuery(discoveryQuery(mutable, 3)), {
    preferences: mutable,
    page: 3,
  });
  const classics = tmdbDiscoveryParams({ genres: [], era: 'classic', length: 'long' }, 1);
  assert.equal(classics['primary_release_date.lte'], '1999-12-31');
  assert.equal(classics['with_runtime.gte'], '120');
  assert.equal(classics.with_genres, undefined);
});

test('trailer selection prefers official YouTube trailers and rejects unsafe IDs', async () => {
  const { selectTrailer } = await import('../lib/trailer');
  const base = { site: 'YouTube', type: 'Trailer', official: false, name: 'Trailer' };
  assert.equal(
    selectTrailer([
      { ...base, key: 'abcdefghijk' },
      { ...base, key: 'short-key', official: true },
      { ...base, key: '12345678901', official: true },
      { ...base, key: 'abcdefghij2', type: 'Clip', official: true },
    ])?.key,
    '12345678901',
  );
  assert.equal(selectTrailer([{ ...base, key: '../bad' }]), null);
  assert.equal(selectTrailer([]), null);
});

test('Comedy + Recent + No rush excludes horror hybrids and rejects unrelated or old results', () => {
  const preferences = { genres: [35], era: 'recent', length: 'any' } as const;
  const selection = { ...preferences, genres: [...preferences.genres] };
  const now = new Date('2026-11-21T12:00:00Z');
  const params = tmdbDiscoveryParams(selection, 1, now);
  assert.equal(params.with_genres, '35');
  assert.equal(params.without_genres, '27');
  assert.equal(params['with_runtime.lte'], undefined);
  const movie = {
    id: 1,
    title: 'Test film',
    original_language: 'en',
    overview: '',
    poster_path: null,
    backdrop_path: null,
    release_date: '2026-06-01',
    vote_average: 7,
    vote_count: 100,
    genre_ids: [35],
  };
  assert.equal(matchesDiscovery(movie, selection, now), true);
  assert.equal(matchesDiscovery({ ...movie, original_language: 'ko' }, selection, now), false);
  assert.equal(matchesDiscovery({ ...movie, original_language: undefined }, selection, now), false);
  assert.equal(matchesDiscovery({ ...movie, genre_ids: [27, 35] }, selection, now), false);
  assert.equal(matchesDiscovery({ ...movie, genre_ids: [27] }, selection, now), false);
  assert.equal(matchesDiscovery({ ...movie, genre_ids: [28] }, selection, now), false);
  assert.equal(matchesDiscovery({ ...movie, release_date: '2021-11-20' }, selection, now), false);
  assert.equal(matchesDiscovery({ ...movie, release_date: '2021-11-21' }, selection, now), true);
  assert.equal(matchesDiscovery({ ...movie, release_date: '2027-01-01' }, selection, now), false);
  assert.equal(matchesDiscovery({ ...movie, release_date: '' }, selection, now), false);
  const horrorComedy = { ...selection, genres: [35, 27] };
  assert.equal(tmdbDiscoveryParams(horrorComedy, 1, now).without_genres, undefined);
  assert.equal(matchesDiscovery({ ...movie, genre_ids: [27, 35] }, horrorComedy, now), true);
  assert.equal(tmdbDiscoveryParams({ ...selection, genres: [] }, 1, now).without_genres, undefined);
});
