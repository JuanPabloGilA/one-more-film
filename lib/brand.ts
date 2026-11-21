// Brand facts shared by the app, the media kit page and scripts/build-media-kit.ts.
// app/globals.css repeats the palette as CSS variables; tests/brand.test.ts keeps them in sync.
export const BRAND_NAME = 'One More Film';
export const SITE_URL = 'https://one-more-film-ruby.vercel.app';
export const REPOSITORY_URL = 'https://github.com/JuanPabloGilA/one-more-film';
export const AUTHOR = 'Juan Pablo Gil';

export const PALETTE = [
  { name: 'White', token: 'white', hex: '#FFFFFF' },
  { name: 'Ink Black', token: 'ink-black', hex: '#00171F' },
  { name: 'Deep Space Blue', token: 'deep-space-blue', hex: '#003459' },
  { name: 'Cerulean', token: 'cerulean', hex: '#007EA7' },
  { name: 'Fresh Sky', token: 'fresh-sky', hex: '#00A8E8' },
] as const;

export type BrandColor = (typeof PALETTE)[number]['token'];
export const brandHex = (token: BrandColor) => PALETTE.find((color) => color.token === token)!.hex;
