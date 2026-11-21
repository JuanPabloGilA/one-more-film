import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { getMovie, getPerson, getMovies, isDemoMode, tmdbRequest, TmdbError } from '../lib/tmdb';
import { normalizePage } from '../lib/params';
const originalToken = process.env.TMDB_READ_ACCESS_TOKEN;
const originalDemo = process.env.TMDB_DEMO_MODE;
afterEach(() => {
  if (originalToken === undefined) delete process.env.TMDB_READ_ACCESS_TOKEN;
  else process.env.TMDB_READ_ACCESS_TOKEN = originalToken;
  if (originalDemo === undefined) delete process.env.TMDB_DEMO_MODE;
  else process.env.TMDB_DEMO_MODE = originalDemo;
});
test('requests authenticate only in headers and encode user input', async () => {
  process.env.TMDB_READ_ACCESS_TOKEN = 'test-private-token';
  const fetcher = (async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin, 'https://api.themoviedb.org');
    assert.equal(url.searchParams.get('query'), 'Dune & Arrival?');
    assert.equal(url.searchParams.has('api_key'), false);
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      'Bearer test-private-token',
    );
    return Response.json({ results: [] });
  }) as typeof fetch;
  assert.deepEqual(await tmdbRequest('search/movie', { query: 'Dune & Arrival?' }, fetcher), {
    results: [],
  });
});
test('upstream failures expose useful messages without upstream secrets', async () => {
  process.env.TMDB_READ_ACCESS_TOKEN = 'secret';
  for (const status of [401, 404, 429, 500]) {
    const fetcher = (async () =>
      new Response('secret upstream diagnostic', { status })) as typeof fetch;
    await assert.rejects(
      tmdbRequest('movie/1', {}, fetcher),
      (error: unknown) =>
        error instanceof TmdbError &&
        !error.message.includes('secret') &&
        error.status === (status === 404 || status === 429 ? status : 502),
    );
  }
});
test('network timeouts produce a recoverable error', async () => {
  process.env.TMDB_READ_ACCESS_TOKEN = 'secret';
  await assert.rejects(
    tmdbRequest('movie/1', {}, (async () => {
      throw new Error('network');
    }) as typeof fetch),
    /taking too long/,
  );
});
test('demo data requires opt-in and never overrides configured live access', async () => {
  delete process.env.TMDB_READ_ACCESS_TOKEN;
  delete process.env.TMDB_DEMO_MODE;
  assert.equal(isDemoMode(), false);
  await assert.rejects(
    getMovies(),
    (error: unknown) => error instanceof TmdbError && error.status === 503,
  );
  process.env.TMDB_DEMO_MODE = 'true';
  const results = await getMovies({ query: 'dUnE' });
  assert.equal(results.demo, true);
  assert.equal(results.results.length, 1);
  assert.equal((await getMovies({ query: 'no-such-movie' })).results.length, 0);
  process.env.TMDB_READ_ACCESS_TOKEN = 'token';
  assert.equal(isDemoMode(), false);
});
test('invalid movie IDs and pagination are bounded', async () => {
  for (const id of [NaN, -1, 1.5, Infinity])
    await assert.rejects(
      getMovie(id),
      (error: unknown) => error instanceof TmdbError && error.status === 404,
    );
  assert.equal(normalizePage('9999'), 500);
  assert.equal(normalizePage('0'), 1);
  assert.equal(normalizePage('2.7'), 1);
  assert.equal(normalizePage('bad'), 1);
  assert.equal(normalizePage('3'), 3);
});

test('invalid person IDs are rejected before requesting TMDB', async () => {
  for (const id of [NaN, 0, -1, 1.5, Infinity])
    await assert.rejects(
      getPerson(id),
      (error: unknown) => error instanceof TmdbError && error.status === 404,
    );
});
