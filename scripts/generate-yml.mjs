/**
 * YML Feed Generator for Yandex.Direct
 * Generates catalog.yml from products data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import products data
const productsPath = path.join(__dirname, '../src/data/products.js');
const productsContent = fs.readFileSync(productsPath, 'utf8');

// Extract PRODUCTS array using regex (since we can't import ESM directly in all cases)
const productsMatch = productsContent.match(/export const PRODUCTS = \[([\s\S]*?)\];/);
if (!productsMatch) {
  console.error('Failed to parse products.js');
  process.exit(1);
}

// Simple evaluation - in production use proper parser
const productsCode = `const PRODUCTS = [${productsMatch[1]}]; PRODUCTS;`;
const PRODUCTS = eval(productsCode);

const SITE_URL = 'https://arbarea.ru';
const SHOP_NAME = 'Arbarea';
const COMPANY_NAME = 'Arbarea - Авторская столярная мастерская';

const escapeXml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const generateYML = () => {
  const date = new Date().toISOString();

  let yml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="${date}">
  <shop>
    <name>${escapeXml(SHOP_NAME)}</name>
    <company>${escapeXml(COMPANY_NAME)}</company>
    <url>${SITE_URL}</url>
    <currencies>
      <currency id="RUB" rate="1"/>
    </currencies>
    <categories>
      <category id="1">Декор для дома</category>
      <category id="2" parentId="1">Вешалки</category>
      <category id="3" parentId="1">Полки</category>
      <category id="4" parentId="1">Столы</category>
      <category id="5" parentId="1">Аксессуары</category>
    </categories>
    <offers>
`;

  PRODUCTS.forEach((product) => {
    const categoryId =
      product.category === 'Вешалки'
        ? 2
        : product.category === 'Полки'
          ? 3
          : product.category === 'Столы'
            ? 4
            : 5;

    const mainImage = product.image?.startsWith('http')
      ? product.image
      : `${SITE_URL}${product.image}`;

    const description = product.description
      ? product.description.replace(/<[^>]*>/g, '').slice(0, 3000)
      : product.name;

    yml += `      <offer id="${product.id}" available="true">
        <name>${escapeXml(product.name)}</name>
        <url>${SITE_URL}/product/${product.id}</url>
        <price>${product.price}</price>
        <currencyId>RUB</currencyId>
        <categoryId>${categoryId}</categoryId>
        <picture>${escapeXml(mainImage)}</picture>
        <delivery>true</delivery>
        <description>${escapeXml(description)}</description>
        <vendor>${escapeXml(SHOP_NAME)}</vendor>
        <param name="Материал">Массив дуба</param>
        <param name="Стиль">Минимализм</param>
        <param name="Ручная работа">Да</param>
        <param name="Бренд">Arbarea</param>
      </offer>
`;
  });

  yml += `    </offers>
  </shop>
</yml_catalog>
`;

  const outputPath = path.join(__dirname, '../public/catalog.yml');
  fs.writeFileSync(outputPath, yml, 'utf8');
  console.log(`✅ YML feed generated: ${outputPath}`);
  console.log(`   Products: ${PRODUCTS.length}`);
};

generateYML();
