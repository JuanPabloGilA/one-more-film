import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requestFilms } from '../components/discovery/request-films';
import { defaultPreferences } from '../lib/discovery';
import { demoMovies } from '../lib/demo';

test('discovery skips filtered and duplicate-only pages without losing its cursor', async () => {
  const pages: number[] = [];
  const fetcher = (async (input) => {
    const page = Number(new URL(String(input), 'http://localhost').searchParams.get('page'));
    pages.push(page);
    return Response.json({
      results: page === 1 ? [] : page === 2 ? [demoMovies[0]] : [demoMovies[1], demoMovies[1]],
      page,
      total_pages: 10,
      total_results: 200,
      demo: false,
    });
  }) as typeof fetch;
  const data = await requestFilms(
    defaultPreferences,
    1,
    new AbortController().signal,
    new Set([demoMovies[0].id]),
    fetcher,
  );
  assert.deepEqual(pages, [1, 2, 3]);
  assert.deepEqual(data.results, [demoMovies[1]]);
  assert.equal(data.page, 3);
  assert.equal(data.total_pages, 10);
});

test('empty discovery batches are bounded and preserve the ability to continue', async () => {
  let requests = 0;
  const fetcher = (async () => {
    requests++;
    return Response.json({
      results: [],
      page: requests,
      total_pages: 1000,
      total_results: 20000,
      demo: false,
    });
  }) as typeof fetch;
  const data = await requestFilms(
    defaultPreferences,
    1,
    new AbortController().signal,
    undefined,
    fetcher,
  );
  assert.equal(requests, 3);
  assert.equal(data.page, 3);
  assert.equal(data.total_pages, 500);
  assert.deepEqual(data.results, []);
});

test('cancelling preferences prevents further page requests', async () => {
  const controller = new AbortController();
  let requests = 0;
  const fetcher = (async () => {
    requests++;
    controller.abort();
    return Response.json({ results: [], page: 1, total_pages: 10 });
  }) as typeof fetch;
  await assert.rejects(requestFilms(defaultPreferences, 1, controller.signal, undefined, fetcher), {
    name: 'AbortError',
  });
  assert.equal(requests, 1);
});

test('discovery failures remain retryable instead of appearing as an empty selection', async () => {
  const fetcher = (async () =>
    Response.json({ error: 'Please try again.' }, { status: 502 })) as typeof fetch;
  await assert.rejects(
    requestFilms(defaultPreferences, 1, new AbortController().signal, undefined, fetcher),
    /Please try again/,
  );
});
