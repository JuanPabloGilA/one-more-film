/**
 * Builds the media kit in public/media-kit and its ZIP download:
 * SVG logos and social graphics, palette files, product copy and a three-page PDF overview.
 *
 * Run with `npm run media-kit`. Screenshots in public/media-kit/screenshots are real
 * captures of the app; this script reads them but never generates or modifies them.
 */
import { once } from 'node:events';
import { createWriteStream, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import * as fontkit from 'fontkit';
import { zipSync } from 'fflate';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import { AUTHOR, BRAND_NAME, brandHex, PALETTE, REPOSITORY_URL, SITE_URL } from '../lib/brand';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'public/media-kit');
const KIT_NAME = 'one-more-film-media-kit';
const ZIP_PATH = path.join(ROOT, 'public', `${KIT_NAME}.zip`);

const INK = brandHex('ink-black');
const CERULEAN = brandHex('cerulean');
const FRESH_SKY = brandHex('fresh-sky');
const WHITE = brandHex('white');

// Print-only tones for the PDF; they are not part of the brand palette.
const BODY_GREY = '#435660';
const PANEL_TINT = '#EEF3F5';
const SWATCH_OUTLINE = '#DFE7EB';

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

type FontRole = 'regular' | 'medium' | 'heading';

// WOFF rather than WOFF2: fontkit subsets WOFF2 by copying its transformed glyf table
// verbatim, so PDFKit would embed fonts whose glyphs render blank.
const FONT_FILES: Record<FontRole, string> = {
  regular: 'node_modules/@fontsource/barlow/files/barlow-latin-400-normal.woff',
  medium: 'node_modules/@fontsource/barlow/files/barlow-latin-500-normal.woff',
  heading: 'node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff',
};

function loadFont(role: FontRole): fontkit.Font {
  const font = fontkit.openSync(path.join(ROOT, FONT_FILES[role]));
  if ('fonts' in font) {
    throw new Error(`${FONT_FILES[role]} is a font collection; expected a single font`);
  }
  return font;
}

const FONTS: Record<FontRole, fontkit.Font> = {
  regular: loadFont('regular'),
  medium: loadFont('medium'),
  heading: loadFont('heading'),
};

// ---------------------------------------------------------------------------
// SVG artwork
// ---------------------------------------------------------------------------

interface SvgArtwork {
  svg: string;
  width: number;
  height: number;
}

interface OutlinedTextOptions {
  x: number;
  baselineY: number;
  size: number;
  color: string;
  font?: FontRole;
}

const ENCORE_MARK = readEncoreMark();

/** The Encore symbol is the single <g> element of the app logo. */
function readEncoreMark(): string {
  const logo = readFileSync(path.join(ROOT, 'public/logo.svg'), 'utf8');
  const group = logo.match(/<g[\s\S]*?<\/g>/)?.[0];
  if (!group) {
    throw new Error('public/logo.svg has no <g> element to reuse as the Encore mark');
  }
  return group;
}

/** Recolours the mark. The colour is written into every stroke as well, because not all
 * SVG consumers resolve currentColor. */
function encoreMark(color: string): string {
  return ENCORE_MARK.replace(/color="[^"]*"/, `color="${color}"`).replaceAll('currentColor', color);
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function svgDocument(width: number, height: number, title: string, body: string): SvgArtwork {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
    `width="${width}" height="${height}" role="img">` +
    `<title>${escapeXml(title)}</title>${body}</svg>\n`;
  return { svg, width, height };
}

/** Width of a string in points, summing advance widths (no kerning), like outlinedText. */
function textWidth(text: string, size: number, role: FontRole): number {
  const font = FONTS[role];
  const units = font.glyphsForString(text).reduce((total, glyph) => total + glyph.advanceWidth, 0);
  return (units * size) / font.unitsPerEm;
}

/**
 * Converts text to glyph outlines so the artwork renders identically without the font
 * installed. Glyphs are placed by their advance widths, without kerning or ligatures.
 */
function outlinedText(text: string, options: OutlinedTextOptions): string {
  const font = FONTS[options.font ?? 'heading'];
  const scale = options.size / font.unitsPerEm;
  const paths: string[] = [];
  let advance = 0;

  for (const glyph of font.glyphsForString(text)) {
    const outline = glyph.path.toSVG();
    if (outline) {
      paths.push(`<path transform="translate(${advance} 0)" d="${outline}"/>`);
    }
    advance += glyph.advanceWidth;
  }

  // Font units point up while SVG's y axis points down, so the vertical scale is negated.
  const transform = `translate(${options.x} ${options.baselineY}) scale(${scale} ${-scale})`;
  return `<g fill="${options.color}" transform="${transform}">${paths.join('')}</g>`;
}

const LOGO_VARIANTS = {
  cerulean: { symbol: CERULEAN, wordmarkText: INK },
  ink: { symbol: INK, wordmarkText: INK },
  white: { symbol: WHITE, wordmarkText: WHITE },
} as const;

type LogoVariant = keyof typeof LOGO_VARIANTS;

const SYMBOL_SIZE = 100;
const WORDMARK_TEXT_X = 118;
const WORDMARK_END_PADDING = 20;
const WORDMARK_FONT_SIZE = 52;

function buildSymbol(variant: LogoVariant): SvgArtwork {
  return svgDocument(
    SYMBOL_SIZE,
    SYMBOL_SIZE,
    `${BRAND_NAME} Encore symbol, ${variant}`,
    encoreMark(LOGO_VARIANTS[variant].symbol),
  );
}

function buildWordmark(variant: LogoVariant): SvgArtwork {
  const { symbol, wordmarkText } = LOGO_VARIANTS[variant];
  const width = Math.round(
    WORDMARK_TEXT_X + WORDMARK_END_PADDING + textWidth(BRAND_NAME, WORDMARK_FONT_SIZE, 'heading'),
  );
  const name = outlinedText(BRAND_NAME, {
    x: WORDMARK_TEXT_X,
    baselineY: 68,
    size: WORDMARK_FONT_SIZE,
    color: wordmarkText,
  });
  return svgDocument(
    width,
    SYMBOL_SIZE,
    `${BRAND_NAME} wordmark, ${variant}`,
    encoreMark(symbol) + name,
  );
}

function buildSocialCard(): SvgArtwork {
  const body = [
    `<rect width="1200" height="630" fill="${INK}"/>`,
    `<g transform="translate(64 48) scale(.68)">${encoreMark(FRESH_SKY)}</g>`,
    outlinedText(BRAND_NAME, { x: 148, baselineY: 96, size: 34, color: WHITE }),
    outlinedText('Find something', { x: 64, baselineY: 288, size: 84, color: WHITE }),
    outlinedText('worth watching.', { x: 64, baselineY: 388, size: 84, color: WHITE }),
    outlinedText('Pick your mood. Watch the trailers. Find your film.', {
      x: 68,
      baselineY: 490,
      size: 28,
      color: WHITE,
      font: 'regular',
    }),
    outlinedText(new URL(SITE_URL).host, {
      x: 68,
      baselineY: 565,
      size: 22,
      color: FRESH_SKY,
      font: 'regular',
    }),
  ];
  return svgDocument(1200, 630, `${BRAND_NAME}: Find something worth watching`, body.join(''));
}

function buildAvatar(): SvgArtwork {
  const body =
    `<rect width="512" height="512" fill="${INK}"/>` +
    `<g transform="translate(96 96) scale(3.2)">${encoreMark(WHITE)}</g>`;
  return svgDocument(512, 512, `${BRAND_NAME} avatar`, body);
}

// ---------------------------------------------------------------------------
// Text files
// ---------------------------------------------------------------------------

function paletteJson(): string {
  const colorsByName = Object.fromEntries(PALETTE.map((color) => [color.name, color.hex]));
  return JSON.stringify(colorsByName, null, 2) + '\n';
}

function brandCss(): string {
  const variables = PALETTE.map((color) => `  --${color.token}: ${color.hex};\n`);
  return `:root {\n${variables.join('')}}\n`;
}

function productCopy(): string {
  return `${BRAND_NAME.toUpperCase()}

Tagline
Find something worth watching.

One sentence
${BRAND_NAME} helps you discover movies through daily trends, preferences and a scrolling trailer feed.

Short description
${BRAND_NAME} is a movie discovery app for finding your next watch. Browse daily trends, choose your genres, era and runtime, then explore trailers one film at a time. Open the full details and cast, or save a film to your browser's watchlist. No account is required.

Key features
- Daily and weekly trending movies
- Search, movie details, full cast and related films
- English-language discovery by genre, era and runtime
- Scrolling trailers with native YouTube controls
- Browser-local watchlists

Product facts
Platform: responsive web application
Data: TMDB
Playback: YouTube
Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui with Base UI, Turbopack
Storage: localStorage for watchlists; no database
Recommendations: preference filters, not an AI model

Links
Live application: ${SITE_URL}
Source code: ${REPOSITORY_URL}
Project author: ${AUTHOR}

Typography
Barlow Condensed Semibold 600 for headings and wordmarks. Barlow 400, 500 and 600 for body text and controls. Arial or sans-serif fallback.
The supplied wordmarks and social graphics use outlined text, so no font installation is needed.
Barlow and Barlow Condensed are distributed under the SIL Open Font License. Source: https://github.com/jpt/barlow

Brand usage
Write the name as ${BRAND_NAME}. Use the original Encore symbol without stretching, rotating, adding shadows or gradients. Leave clear space of at least one quarter of the symbol's width. Keep the symbol at least 24 px wide and the full wordmark at least 150 px wide. Use the white variants on ink or dark imagery. Cerulean is the primary brand accent; Fresh Sky is for larger accents and dark backgrounds, not small text on white.

Asset notes
All logo and social artwork is SVG. Wordmarks contain outlined letterforms for consistent rendering. Screenshots show the application with TMDB content; films, ratings and availability change over time. Screenshot movie artwork belongs to its respective rights holders and is included to show the application, not as standalone promotional artwork.

Attribution
This product uses the TMDB API but is not endorsed or certified by TMDB.
Trailers are hosted on YouTube.
Design refinement used Unslop by Damir Sokolovsky, licensed CC BY 4.0: https://github.com/heydamir/unslop
`;
}

function startHere(): string {
  return `${BRAND_NAME} media kit

Open ${KIT_NAME}.pdf for the overview and brand guide.
logos/: three symbol colors and three horizontal wordmarks, all SVG.
social/: 1200 x 630 share graphic and 512 x 512 avatar, both SVG.
screenshots/: original application captures in JPEG.
product-copy.txt: reusable descriptions, links, facts, typography and usage notes.
palette.json and brand.css: brand color values.

The site link is the current public deployment. Local changes are not automatically published.
`;
}

// ---------------------------------------------------------------------------
// PDF overview
// ---------------------------------------------------------------------------

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_X = 42;

interface TextStyle {
  size: number;
  color?: string;
  font?: FontRole;
}

// Turns off kerning and ligatures so PDF text is set by plain advance widths, like the SVG
// outlines and textWidth(); kerning would otherwise change where paragraphs wrap. PDFKit
// passes `features` to fontkit, which accepts this { tag: enabled } map, but
// @types/pdfkit only declares the array form.
const UNSHAPED_TEXT = { kern: false, liga: false } as unknown as PDFKit.Mixins.OpenTypeFeatures[];

/** Thin drawing layer over PDFKit. Coordinates are in points from the top-left corner,
 * and text is positioned by its baseline. */
class MediaKitPdf {
  private readonly doc: PDFKit.PDFDocument;
  private readonly finished: Promise<unknown>;

  constructor(outputPath: string) {
    this.doc = new PDFDocument({
      size: [PAGE_WIDTH, PAGE_HEIGHT],
      margin: 0,
      info: { Title: `${BRAND_NAME} | Media kit`, Author: AUTHOR },
    });
    const stream = createWriteStream(outputPath);
    this.finished = once(stream, 'finish');
    this.doc.pipe(stream);

    for (const role of Object.keys(FONT_FILES) as FontRole[]) {
      this.doc.registerFont(role, path.join(ROOT, FONT_FILES[role]));
    }
  }

  text(value: string, x: number, baselineY: number, style: TextStyle): void {
    this.doc
      .font(style.font ?? 'regular')
      .fontSize(style.size)
      .fillColor(style.color ?? INK)
      .text(value, x, baselineY, {
        baseline: 'alphabetic',
        lineBreak: false,
        features: UNSHAPED_TEXT,
      });
  }

  /** Greedy word wrap with the first baseline one font size below `topY`. */
  paragraph(value: string, x: number, topY: number, width: number, style: TextStyle): void {
    const lineHeight = style.size * 1.45;
    const lines = this.wrapWords(value, width, style);
    lines.forEach((line, index) => {
      const baselineY = topY + style.size + index * lineHeight;
      this.text(line, x, baselineY, { color: BODY_GREY, ...style });
    });
  }

  link(label: string, url: string, x: number, baselineY: number): void {
    const style = { size: 11, color: CERULEAN, font: 'medium' } as const;
    this.text(label, x, baselineY, style);
    // The clickable area spans from cap height down to just below the baseline.
    const width = textWidth(label, style.size, style.font);
    this.doc.link(x, baselineY - 12, width, 15, url);
  }

  rect(x: number, y: number, width: number, height: number, color: string): void {
    this.doc.rect(x, y, width, height).fill(color);
  }

  outlineRect(x: number, y: number, width: number, height: number, color: string): void {
    this.doc.rect(x, y, width, height).lineWidth(1).stroke(color);
  }

  vector(artwork: SvgArtwork, x: number, y: number, width: number): void {
    const height = (width * artwork.height) / artwork.width;
    SVGtoPDF(this.doc, artwork.svg, x, y, {
      width,
      height,
      preserveAspectRatio: 'xMinYMin meet',
    });
  }

  photo(screenshot: string, x: number, y: number, width: number): void {
    this.doc.image(path.join(OUTPUT_DIR, 'screenshots', screenshot), x, y, { width });
  }

  addPage(): void {
    this.doc.addPage();
  }

  async save(): Promise<void> {
    this.doc.end();
    await this.finished;
  }

  private wrapWords(value: string, width: number, style: TextStyle): string[] {
    const lines: string[] = [];
    let current = '';
    for (const word of value.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && textWidth(candidate, style.size, style.font ?? 'regular') > width) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) {
      lines.push(current);
    }
    return lines;
  }
}

interface PdfArtwork {
  wordmark: SvgArtwork;
  wordmarkOnInk: SvgArtwork;
}

function drawPageFrame(pdf: MediaKitPdf, artwork: PdfArtwork, section: string, page: number) {
  pdf.vector(artwork.wordmark, MARGIN_X, 32, 174);
  pdf.text(section, 422, 57, { size: 10, font: 'medium' });
  pdf.text(BRAND_NAME, MARGIN_X, 760, { size: 9 });
  pdf.text(String(page).padStart(2, '0'), 551, 760, { size: 9 });
}

function drawCoverPage(pdf: MediaKitPdf) {
  pdf.text('Find something', MARGIN_X, 143, { size: 46, font: 'heading' });
  pdf.text('worth watching.', MARGIN_X, 195, { size: 46, font: 'heading' });
  pdf.text('A film for tonight. A few for later.', 44, 228, { size: 15, color: BODY_GREY });
  pdf.photo('homepage-desktop.jpg', MARGIN_X, 259, 528);
  pdf.paragraph(
    `${BRAND_NAME} makes choosing a movie a little easier. Explore today's trends, follow your taste through trailers, and save the films you want to come back to.`,
    MARGIN_X,
    626,
    510,
    { size: 13 },
  );
  pdf.link('Open the app', SITE_URL, MARGIN_X, 713);
  pdf.link('Explore the source', REPOSITORY_URL, 172, 713);
}

function drawIdentityPage(pdf: MediaKitPdf, artwork: PdfArtwork) {
  pdf.text('A familiar mark.', MARGIN_X, 127, { size: 34, font: 'heading' });
  pdf.text('One consistent identity.', MARGIN_X, 166, { size: 34, font: 'heading' });

  pdf.rect(MARGIN_X, 198, 252, 116, PANEL_TINT);
  pdf.rect(306, 198, 264, 116, INK);
  pdf.vector(artwork.wordmark, 62, 233, 212);
  pdf.vector(artwork.wordmarkOnInk, 328, 233, 220);

  pdf.text('Color', MARGIN_X, 359, { size: 18, font: 'heading' });
  PALETTE.forEach((color, index) => {
    const x = MARGIN_X + index * 108;
    pdf.rect(x, 379, 96, 52, color.hex);
    if (color.hex === WHITE) {
      // A white swatch needs an outline to stay visible on the white page.
      pdf.outlineRect(x, 379, 96, 52, SWATCH_OUTLINE);
    }
    pdf.text(color.name, x, 452, { size: 9, font: 'medium' });
    pdf.text(color.hex, x, 470, { size: 10, color: BODY_GREY });
  });

  pdf.text('Barlow Condensed + Barlow', MARGIN_X, 525, { size: 30, font: 'heading' });
  pdf.text('Condensed 600 headings / Barlow 400, 500, 600 body', MARGIN_X, 554, {
    size: 12,
    color: BODY_GREY,
  });
  pdf.paragraph(
    'Use warm, direct language. Keep headings short and let film artwork carry the color. Pair white space and ink text with restrained cerulean accents.',
    MARGIN_X,
    577,
    510,
    { size: 12 },
  );
  pdf.paragraph(
    'Keep the mark intact. Use 25% clear space, a minimum symbol width of 24 px and a wordmark width of 150 px. Choose the white version for dark backgrounds. No stretching, shadows or gradients.',
    MARGIN_X,
    645,
    510,
    { size: 11 },
  );
}

const PRODUCT_HIGHLIGHTS = [
  {
    title: 'Choose your taste',
    body: 'Pick up to three genres, an era and a runtime. Discovery focuses on English-language films.',
  },
  {
    title: 'Watch the trailers',
    body: `Scroll through films one at a time. YouTube handles playback controls; ${BRAND_NAME} keeps your place.`,
  },
  {
    title: 'Keep a little list',
    body: 'See the cast and details. Save films in this browser, with no account or database required.',
  },
  {
    title: 'Built for the web',
    body: 'Next.js, React, TypeScript, Tailwind CSS and shadcn/ui. Turbopack handles development and production builds.',
  },
];

function drawProductPage(pdf: MediaKitPdf) {
  pdf.text('From a mood', MARGIN_X, 128, { size: 36, font: 'heading' });
  pdf.text('to your next film.', MARGIN_X, 171, { size: 36, font: 'heading' });
  pdf.photo('preferences-mobile.jpg', MARGIN_X, 211, 182);

  const columnX = 254;
  PRODUCT_HIGHLIGHTS.forEach((highlight, index) => {
    const titleBaseline = 239 + index * 99;
    pdf.text(highlight.title, columnX, titleBaseline, { size: 19, font: 'heading' });
    pdf.paragraph(highlight.body, columnX, titleBaseline + 16, 312, { size: 12 });
  });

  pdf.paragraph(
    'Movie data and artwork: TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB. Screenshots show a point-in-time selection; listings and ratings change.',
    MARGIN_X,
    648,
    528,
    { size: 9 },
  );
  pdf.link('App', SITE_URL, MARGIN_X, 713);
  pdf.link('GitHub', REPOSITORY_URL, 100, 713);
  pdf.text(`Created by ${AUTHOR}`, 365, 713, { size: 11, color: BODY_GREY });
}

async function writePdf(artwork: PdfArtwork): Promise<void> {
  const pdf = new MediaKitPdf(path.join(OUTPUT_DIR, `${KIT_NAME}.pdf`));
  const pages = [
    { section: 'Media kit / 2026', draw: () => drawCoverPage(pdf) },
    { section: 'Identity / essentials', draw: () => drawIdentityPage(pdf, artwork) },
    { section: 'Product / story', draw: () => drawProductPage(pdf) },
  ];

  pages.forEach((page, index) => {
    if (index > 0) {
      pdf.addPage();
    }
    drawPageFrame(pdf, artwork, page.section, index + 1);
    page.draw();
  });
  await pdf.save();
}

// ---------------------------------------------------------------------------
// Checks and packaging
// ---------------------------------------------------------------------------

/** Paths of every file in the media kit, relative to OUTPUT_DIR and sorted. */
function listKitFiles(): string[] {
  return readdirSync(OUTPUT_DIR, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(OUTPUT_DIR, path.join(entry.parentPath, entry.name)))
    .sort();
}

/** House style uses plain hyphens; en and em dashes must not reach the published text. */
function assertNoLongDashes(files: string[]): void {
  const textExtensions = new Set(['.txt', '.json', '.css', '.svg']);
  for (const file of files.filter((name) => textExtensions.has(path.extname(name)))) {
    if (/[\u2013\u2014]/.test(readFileSync(path.join(OUTPUT_DIR, file), 'utf8'))) {
      throw new Error(`Long dash in ${file}`);
    }
  }
}

function writeZip(files: string[]): void {
  const entries = Object.fromEntries(
    files.map((file) => [
      `${KIT_NAME}/${file.split(path.sep).join('/')}`,
      readFileSync(path.join(OUTPUT_DIR, file)),
    ]),
  );
  writeFileSync(ZIP_PATH, zipSync(entries));
}

function writeKitFile(relativePath: string, contents: string): void {
  const target = path.join(OUTPUT_DIR, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

async function main(): Promise<void> {
  const variants = Object.keys(LOGO_VARIANTS) as LogoVariant[];
  for (const variant of variants) {
    writeKitFile(`logos/encore-${variant}.svg`, buildSymbol(variant).svg);
    writeKitFile(`logos/wordmark-${variant}.svg`, buildWordmark(variant).svg);
  }
  writeKitFile('social/landscape-1200x630.svg', buildSocialCard().svg);
  writeKitFile('social/avatar-512.svg', buildAvatar().svg);

  writeKitFile('palette.json', paletteJson());
  writeKitFile('brand.css', brandCss());
  writeKitFile('product-copy.txt', productCopy());
  writeKitFile('START-HERE.txt', startHere());

  await writePdf({ wordmark: buildWordmark('cerulean'), wordmarkOnInk: buildWordmark('white') });

  const files = listKitFiles();
  assertNoLongDashes(files);
  writeZip(files);
  console.log('Built SVG assets, PDF overview and ZIP archive.');
}

await main();
