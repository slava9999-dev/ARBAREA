#!/usr/bin/env node
/**
 * Renders scripts/og-card.html into public/og-image.jpg — the 1200x630 card
 * that VK / Telegram / WhatsApp show when the site link is shared.
 *
 * Usage: npm run generate:og
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CARD = path.join(HERE, 'og-card.html');
const OUT = path.join(HERE, '..', 'public', 'og-image.jpg');

const WIDTH = 1200;
const HEIGHT = 630;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2, // render at 2x, downsample for crisp text
});

await page.goto(`file://${CARD}`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);

const raw = await page.screenshot({ type: 'png' });
await browser.close();

await sharp(raw)
  .resize(WIDTH, HEIGHT, { fit: 'fill', kernel: 'lanczos3' })
  .jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true })
  .toFile(OUT);

const { size } = await fs.stat(OUT);
console.log(
  `og-image.jpg: ${WIDTH}x${HEIGHT}, ${(size / 1024).toFixed(0)} KB -> ${OUT}`,
);
