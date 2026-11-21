"""Build vector brand assets, a PDF overview and a ZIP from approved product screenshots.

Run with Python after installing scripts/media-kit-requirements.txt.
Screenshots in public/media-kit/screenshots are captured from the app, not generated.
"""
from pathlib import Path
import html
import json
import re
import zipfile
from fontTools.ttLib import TTFont as Font
from fontTools.pens.svgPathPen import SVGPathPen
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/media-kit'
TEMP = ROOT / 'review/media-kit'
LIVE = 'https://one-more-film-ruby.vercel.app'
REPO = 'https://github.com/JuanPabloGilA/one-more-film'
PALETTE = {'White': '#FFFFFF', 'Ink Black': '#00171F', 'Deep Space Blue': '#003459', 'Cerulean': '#007EA7', 'Fresh Sky': '#00A8E8'}
for folder in ['logos', 'social', 'screenshots']:
    (OUT / folder).mkdir(parents=True, exist_ok=True)
TEMP.mkdir(parents=True, exist_ok=True)
fonts = {}
for weight in [400, 500, 600]:
    family = 'barlow-condensed' if weight == 600 else 'barlow'
    source_font = ROOT / f'node_modules/@fontsource/{family}/files/{family}-latin-{weight}-normal.woff2'
    font = Font(source_font)
    font.flavor = None
    target = TEMP / f'{family}-{weight}.ttf'
    font.save(target)
    fonts[weight] = font
    pdfmetrics.registerFont(TTFont(f'Brand-{weight}', str(target)))

logo = (ROOT / 'public/logo.svg').read_text()
mark = re.search(r'<g.*?</g>', logo, re.S)[0]
mark = mark.replace('currentColor', '#007ea7')

def svg(width, height, title, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" role="img"><title>{html.escape(title)}</title>{body}</svg>\n'

def glyphs(text, x, y, size, color, weight=600):
    font = fonts[weight]
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    units = font['head'].unitsPerEm
    paths = []
    advance = 0
    for char in text:
        name = cmap[ord(char)]
        pen = SVGPathPen(glyph_set, ntos=lambda value: f'{value:.2f}'.rstrip('0').rstrip('.'))
        glyph_set[name].draw(pen)
        paths.append(f'<path transform="translate({advance} 0)" d="{pen.getCommands()}"/>')
        advance += font['hmtx'][name][0]
    return f'<g fill="{color}" transform="translate({x} {y}) scale({size/units} {-size/units})">'+''.join(paths)+'</g>'

def symbol(color):
    return mark.replace('#007ea7', color)

for name, color in [('cerulean', '#007EA7'), ('ink', '#00171F'), ('white', '#FFFFFF')]:
    (OUT / f'logos/encore-{name}.svg').write_text(svg(100, 100, f'One More Film Encore symbol, {name}', symbol(color)))
    word_color = '#00171F' if name == 'cerulean' else color
    body = symbol(color) + glyphs('One More Film', 118, 68, 52, word_color)
    (OUT / f'logos/wordmark-{name}.svg').write_text(svg(round(138 + pdfmetrics.stringWidth('One More Film', 'Brand-600', 52)), 100, f'One More Film wordmark, {name}', body))

social = '<rect width="1200" height="630" fill="#00171F"/>'
social += '<g transform="translate(64 48) scale(.68)">'+symbol('#00A8E8')+'</g>'
social += glyphs('One More Film', 148, 96, 34, '#FFFFFF')
social += glyphs('Find something', 64, 288, 84, '#FFFFFF')
social += glyphs('worth watching.', 64, 388, 84, '#FFFFFF')
social += glyphs('Pick your mood. Watch the trailers. Find your film.', 68, 490, 28, '#FFFFFF', 400)
social += glyphs('one-more-film-ruby.vercel.app', 68, 565, 22, '#00A8E8', 400)
(OUT / 'social/landscape-1200x630.svg').write_text(svg(1200, 630, 'One More Film: Find something worth watching', social))
(OUT / 'social/avatar-512.svg').write_text(svg(512, 512, 'One More Film avatar', '<rect width="512" height="512" fill="#00171F"/><g transform="translate(96 96) scale(3.2)">'+symbol('#FFFFFF')+'</g>'))
(OUT / 'palette.json').write_text(json.dumps(PALETTE, indent=2)+'\n')
(OUT / 'brand.css').write_text(':root {\n'+''.join(f'  --{name.lower().replace(" ", "-")}: {value};\n' for name,value in PALETTE.items())+'}\n')

copy = f'''ONE MORE FILM

Tagline
Find something worth watching.

One sentence
One More Film helps you discover movies through daily trends, preferences and a scrolling trailer feed.

Short description
One More Film is a movie discovery app for finding your next watch. Browse daily trends, choose your genres, era and runtime, then explore trailers one film at a time. Open the full details and cast, or save a film to your browser's watchlist. No account is required.

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
Live application: {LIVE}
Source code: {REPO}
Project author: Juan Pablo Gil

Typography
Barlow Condensed Semibold 600 for headings and wordmarks. Barlow 400, 500 and 600 for body text and controls. Arial or sans-serif fallback.
The supplied wordmarks and social graphics use outlined text, so no font installation is needed.
Barlow and Barlow Condensed are distributed under the SIL Open Font License. Source: https://github.com/jpt/barlow

Brand usage
Write the name as One More Film. Use the original Encore symbol without stretching, rotating, adding shadows or gradients. Leave clear space of at least one quarter of the symbol's width. Keep the symbol at least 24 px wide and the full wordmark at least 150 px wide. Use the white variants on ink or dark imagery. Cerulean is the primary brand accent; Fresh Sky is for larger accents and dark backgrounds, not small text on white.

Asset notes
All logo and social artwork is SVG. Wordmarks contain outlined letterforms for consistent rendering. Screenshots show the application with TMDB content; films, ratings and availability change over time. Screenshot movie artwork belongs to its respective rights holders and is included to show the application, not as standalone promotional artwork.

Attribution
This product uses the TMDB API but is not endorsed or certified by TMDB.
Trailers are hosted on YouTube.
Design refinement used Unslop by Damir Sokolovsky, licensed CC BY 4.0: https://github.com/heydamir/unslop
'''
(OUT / 'product-copy.txt').write_text(copy)
(OUT / 'START-HERE.txt').write_text('One More Film media kit\n\nOpen one-more-film-media-kit.pdf for the overview and brand guide.\nlogos/: three symbol colors and three horizontal wordmarks, all SVG.\nsocial/: 1200 x 630 share graphic and 512 x 512 avatar, both SVG.\nscreenshots/: original application captures in JPEG.\nproduct-copy.txt: reusable descriptions, links, facts, typography and usage notes.\npalette.json and brand.css: brand color values.\n\nThe site link is the current public deployment. Local changes are not automatically published.\n')

# Portrait PDF with live hyperlinks, vector logos and embedded Barlow and Barlow Condensed.
W, H = 612, 792
pdf = canvas.Canvas(str(OUT / 'one-more-film-media-kit.pdf'), pagesize=(W, H), pageCompression=1)
pdf.setTitle('One More Film | Media kit')
pdf.setAuthor('Juan Pablo Gil')
INK, BLUE, GRAY = '#00171F', '#007EA7', '#435660'
def rect(x,y,w,h,color):
    pdf.setFillColor(HexColor(color)); pdf.rect(x,H-y-h,w,h,fill=1,stroke=0)
def text(value,x,y,size=12,color=INK,weight=400):
    pdf.setFillColor(HexColor(color)); pdf.setFont(f'Brand-{weight}',size);pdf.drawString(x,H-y,value)
def paragraph(value,x,y,width,size=12,color=GRAY,leading=None):
    p=Paragraph(value,ParagraphStyle('copy',fontName='Brand-400',fontSize=size,leading=leading or size*1.45,textColor=HexColor(color)))
    _,height=p.wrap(width,H);p.drawOn(pdf,x,H-y-height);return height

def vector(path,x,y,w):
    drawing=svg2rlg(str(path));ratio=w/drawing.width;drawing.scale(ratio,ratio);renderPDF.draw(drawing,pdf,x,H-y-drawing.height*ratio)
def photo(name,x,y,w):
    path=OUT/'screenshots'/name
    image=ImageReader(str(path));iw,ih=image.getSize();height=w*ih/iw
    pdf.drawImage(image,x,H-y-height,width=w,height=height)
    return height

def header(section,page,dark=False):
    if dark:rect(0,0,W,H,INK)
    color='#FFFFFF' if dark else INK
    vector(OUT/f'logos/wordmark-{"white" if dark else "cerulean"}.svg',42,32,174)
    text(section,422,57,10,color,500)
    text('One More Film',42,760,9,color)
    text(f'{page:02}',551,760,9,color)

def link(label,url,x,y,color=BLUE):
    text(label,x,y,11,color,500)
    width=pdfmetrics.stringWidth(label,'Brand-500',11)
    pdf.linkURL(url,(x,H-y-3,x+width,H-y+12),relative=0,thickness=0)

header('Media kit / 2026',1)
text('Find something',42,143,46,INK,600)
text('worth watching.',42,195,46,INK,600)
text('A film for tonight. A few for later.',44,228,15,GRAY)
photo('homepage-desktop.jpg',42,259,528)
paragraph('One More Film makes choosing a movie a little easier. Explore today\'s trends, follow your taste through trailers, and save the films you want to come back to.',42,626,510,13)
link('Open the app',LIVE,42,713)
link('Explore the source',REPO,172,713)
pdf.showPage()
header('Identity / essentials',2)
text('A familiar mark.',42,127,34,INK,600)
text('One consistent identity.',42,166,34,INK,600)
rect(42,198,252,116,'#EEF3F5');rect(306,198,264,116,INK)
vector(OUT/'logos/wordmark-cerulean.svg',62,233,212)
vector(OUT/'logos/wordmark-white.svg',328,233,220)
text('Color',42,359,18,INK,600)
for i,(name,color) in enumerate(PALETTE.items()):
    x=42+i*108
    rect(x,379,96,52,color)
    if name=='White':
        pdf.setStrokeColor(HexColor('#DFE7EB'));pdf.rect(x,H-431,96,52,fill=0,stroke=1)
    text(name,x,452,9,INK,500);text(color,x,470,10,GRAY)
text('Barlow Condensed + Barlow',42,525,30,INK,600)
text('Condensed 600 headings / Barlow 400, 500, 600 body',42,554,12,GRAY)
paragraph('Use warm, direct language. Keep headings short and let film artwork carry the color. Pair white space and ink text with restrained cerulean accents.',42,577,510,12)
paragraph('Keep the mark intact. Use 25% clear space, a minimum symbol width of 24 px and a wordmark width of 150 px. Choose the white version for dark backgrounds. No stretching, shadows or gradients.',42,645,510,11)
pdf.showPage()
header('Product / story',3)
text('From a mood',42,128,36,INK,600)
text('to your next film.',42,171,36,INK,600)
photo('preferences-mobile.jpg',42,211,182)
text('Choose your taste',254,239,19,INK,600)
paragraph('Pick up to three genres, an era and a runtime. Discovery focuses on English-language films.',254,255,312,12)
text('Watch the trailers',254,338,19,INK,600)
paragraph('Scroll through films one at a time. YouTube handles playback controls; One More Film keeps your place.',254,354,312,12)
text('Keep a little list',254,437,19,INK,600)
paragraph('See the cast and details. Save films in this browser, with no account or database required.',254,453,312,12)
text('Built for the web',254,536,19,INK,600)
paragraph('Next.js, React, TypeScript, Tailwind CSS and shadcn/ui. Turbopack handles development and production builds.',254,552,312,12)
paragraph('Movie data and artwork: TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB. Screenshots show a point-in-time selection; listings and ratings change.',42,648,528,9)
link('App',LIVE,42,713);link('GitHub',REPO,100,713)
text('Created by Juan Pablo Gil',365,713,11,GRAY)
pdf.showPage();pdf.save()

for path in OUT.rglob('*'):
    if path.suffix in ['.txt','.json','.css','.svg']:
        assert not re.search('[\u2013\u2014]',path.read_text()),f'Long dash in {path.name}'
archive=ROOT/'public/one-more-film-media-kit.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as bundle:
    for path in sorted(OUT.rglob('*')):
        if path.is_file():bundle.write(path,Path('one-more-film-media-kit')/path.relative_to(OUT))
print('Built SVG assets, PDF overview and ZIP archive.')
