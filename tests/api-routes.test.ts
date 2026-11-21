import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { GET as discover } from '../app/api/discover/route';
import { GET as trailer } from '../app/api/movie/[id]/trailer/route';

// Demo mode exercises the routes end to end without network access.
const saved = { ...process.env };
beforeEach(() => {
  delete process.env.TMDB_READ_ACCESS_TOKEN;
  process.env.TMDB_DEMO_MODE = 'true';
});
afterEach(() => {
  process.env = { ...saved };
});

const discoverUrl = (query: string) => new Request(`http://localhost/api/discover?${query}`);
const trailerFor = (id: string) =>
  trailer(new Request(`http://localhost/api/movie/${id}/trailer`), {
    params: Promise.resolve({ id }),
  });

test('discover rejects invalid preferences with a 400', async () => {
  const response = await discover(discoverUrl('genres=1,2,3,4'));
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /valid preferences/);
});

test('discover applies runtime preferences to the sample catalogue', async () => {
  const response = await discover(discoverUrl('genres=&era=any&length=long&page=1'));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(
    body.results.map((movie: { title: string }) => movie.title),
    ['Dune: Part Two'],
  );
  assert.equal(body.demo, true);
});

test('trailer returns the selected video, null, or a 400 for bad IDs', async () => {
  assert.deepEqual(await (await trailerFor('693134')).json(), {
    trailer: { key: 'Way9Dexny3w', name: 'Official trailer' },
  });
  assert.deepEqual(await (await trailerFor('872585')).json(), { trailer: null });
  assert.equal((await trailerFor('abc')).status, 400);
});

test('upstream failures become safe JSON errors', async () => {
  delete process.env.TMDB_DEMO_MODE;
  const response = await trailerFor('693134');
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /not connected/);
});
