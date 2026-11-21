import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imageUrl, imdbNameUrl, imdbTitleUrl, youtubeEmbedUrl } from '../lib/links';
import { normalizeQuery, parseId } from '../lib/params';

test('TMDB images only build URLs for real paths', () => {
  assert.equal(imageUrl('/poster.jpg', 'w185'), 'https://image.tmdb.org/t/p/w185/poster.jpg');
  assert.equal(imageUrl(null), null);
});

test('IMDb links accept only well-formed IDs from upstream data', () => {
  assert.equal(imdbTitleUrl('tt0816692'), 'https://www.imdb.com/title/tt0816692/');
  assert.equal(imdbNameUrl('nm0000190'), 'https://www.imdb.com/name/nm0000190/');
  for (const id of [null, '', 'tt', 'nm0000190', 'tt1/../../evil'])
    assert.equal(imdbTitleUrl(id), null);
});

test('YouTube embeds encode the key and their player options', () => {
  assert.equal(
    youtubeEmbedUrl('a b', { autoplay: '1' }),
    'https://www.youtube-nocookie.com/embed/a%20b?autoplay=1',
  );
});

test('route IDs and search queries are bounded before reaching TMDB', () => {
  assert.equal(parseId('693134'), 693134);
  for (const raw of ['0', '-1', '1.5', '1e3', 'abc', '', '99999999999999999999'])
    assert.equal(parseId(raw), null);
  assert.equal(normalizeQuery('  Dune  '), 'Dune');
  assert.equal(normalizeQuery('x'.repeat(250)).length, 100);
  assert.equal(normalizeQuery(undefined), '');
});
