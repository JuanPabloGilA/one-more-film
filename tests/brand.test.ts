import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PALETTE } from '../lib/brand';

test('the CSS palette matches lib/brand.ts', () => {
  const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
  for (const { token, hex } of PALETTE) {
    const declared = css.match(new RegExp(`--${token}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
    assert.equal(declared?.toUpperCase(), hex, `--${token} in app/globals.css`);
  }
});
