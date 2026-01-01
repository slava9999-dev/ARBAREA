/**
 * Sitemap Generator
 * Generates sitemap.xml for SEO
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import products data
const productsPath = path.join(__dirname, '../src/data/products.js');
const productsContent = fs.readFileSync(productsPath, 'utf8');

// Extract PRODUCTS array
const productsMatch = productsContent.match(/export const PRODUCTS = \[([\s\S]*?)\];/);
if (!productsMatch) {
  console.error('Failed to parse products.js');
  process.exit(1);
}

const productsCode = `const PRODUCTS = [${productsMatch[1]}]; PRODUCTS;`;
const PRODUCTS = eval(productsCode);

const SITE_URL = 'https://arbarea.ru';

const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/gallery', priority: '0.8', changefreq: 'weekly' },
  { path: '/cart', priority: '0.6', changefreq: 'monthly' },
  { path: '/profile', priority: '0.5', changefreq: 'monthly' },
  { path: '/ai-chat', priority: '0.7', changefreq: 'monthly' },
  { path: '/legal', priority: '0.3', changefreq: 'yearly' },
];

const generateSitemap = () => {
  const date = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Static pages
  staticPages.forEach((page) => {
    sitemap += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  // Product pages
  PRODUCTS.forEach((product) => {
    sitemap += `  <url>
    <loc>${SITE_URL}/product/${product.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  });

  sitemap += `</urlset>
`;

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemap, 'utf8');
  console.log(`✅ Sitemap generated: ${outputPath}`);
  console.log(`   Static pages: ${staticPages.length}`);
  console.log(`   Product pages: ${PRODUCTS.length}`);
  console.log(`   Total URLs: ${staticPages.length + PRODUCTS.length}`);
};

generateSitemap();
