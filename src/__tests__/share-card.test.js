import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_SITE_URL,
  SHARE_DESCRIPTION,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_PATH,
  SHARE_IMAGE_WIDTH,
  SHARE_TITLE,
  SEO_DESCRIPTION,
} from '../config/site.js';

const ROOT = path.join(__dirname, '..', '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const metaContent = (attr, name) => {
  const tag = html.match(
    new RegExp(`<meta\\s+${attr}="${name}"[^>]*?content="([^"]*)"`, 's'),
  );
  if (tag) return tag[1];
  // Tags whose content attribute sits on the next line.
  const multiline = html.match(
    new RegExp(`<meta\\s+${attr}="${name}"\\s*\\n\\s*content="([^"]*)"`, 's'),
  );
  return multiline ? multiline[1] : null;
};

describe('social share card', () => {
  it('ships the rendered og-image at the advertised size', () => {
    const image = path.join(ROOT, 'public', SHARE_IMAGE_PATH);
    expect(fs.existsSync(image)).toBe(true);

    // JPEG SOF0 marker carries the real dimensions — guards against the meta
    // tags promising 1200x630 while the file says otherwise.
    const buffer = fs.readFileSync(image);
    let offset = 2;
    let dimensions = null;
    while (offset < buffer.length - 9) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker)
      ) {
        dimensions = {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
        break;
      }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }

    expect(dimensions).toEqual({
      width: Number(SHARE_IMAGE_WIDTH),
      height: Number(SHARE_IMAGE_HEIGHT),
    });
  });

  it('keeps index.html open graph tags in sync with the share config', () => {
    expect(metaContent('property', 'og:title')).toBe(SHARE_TITLE);
    expect(metaContent('property', 'og:description')).toBe(SHARE_DESCRIPTION);
    expect(metaContent('name', 'description')).toBe(SEO_DESCRIPTION);
    expect(metaContent('property', 'og:image')).toBe(
      `%SITE_URL%${SHARE_IMAGE_PATH}`,
    );
    expect(metaContent('property', 'og:image:width')).toBe(SHARE_IMAGE_WIDTH);
    expect(metaContent('property', 'og:image:height')).toBe(SHARE_IMAGE_HEIGHT);
    expect(metaContent('property', 'og:type')).toBe('website');
    expect(metaContent('property', 'og:locale')).toBe('ru_RU');
    expect(metaContent('name', 'twitter:card')).toBe('summary_large_image');
  });

  it('keeps the copy inside the platform truncation budgets', () => {
    // Social previews cut off around 125 characters, search snippets around 160.
    expect(SHARE_TITLE.length).toBeLessThanOrEqual(60);
    expect(SHARE_DESCRIPTION.length).toBeLessThanOrEqual(125);
    expect(SEO_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it('resolves absolute urls for crawlers, which reject relative ones', () => {
    // Every crawler-facing URL must be absolute once %SITE_URL% is substituted.
    expect(DEFAULT_SITE_URL).toMatch(/^https:\/\/[^/]+$/);
    expect(html).toContain('<meta property="og:url" content="%SITE_URL%/">');
    expect(html).toContain('<link rel="canonical" href="%SITE_URL%/">');
    expect(html).not.toMatch(/content="\/og-image\.jpg"/);
  });
});
