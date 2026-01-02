/**
 * Unit Tests for Products Data
 * Validates product structure and data integrity
 * @jest-environment jsdom
 */

import { PRODUCTS } from '../data/products';

describe('PRODUCTS', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(PRODUCTS)).toBe(true);
    expect(PRODUCTS.length).toBeGreaterThan(0);
  });

  describe('Each product', () => {
    test('has required fields', () => {
      PRODUCTS.forEach((product, index) => {
        expect(product.id).toBeDefined();
        expect(typeof product.id).toBe('number');

        expect(product.name).toBeDefined();
        expect(typeof product.name).toBe('string');
        expect(product.name.length).toBeGreaterThan(0);

        expect(product.price).toBeDefined();
        expect(typeof product.price).toBe('number');
        expect(product.price).toBeGreaterThan(0);

        expect(product.category).toBeDefined();
        expect(typeof product.category).toBe('string');

        expect(product.image).toBeDefined();
        expect(typeof product.image).toBe('string');
        expect(product.image).toMatch(/\.(webp|jpg|jpeg|png)$/i);
      });
    });

    test('has unique IDs', () => {
      const ids = PRODUCTS.map((p) => p.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    test('has valid rating if present', () => {
      PRODUCTS.forEach((product) => {
        if (product.rating !== undefined) {
          expect(product.rating).toBeGreaterThanOrEqual(0);
          expect(product.rating).toBeLessThanOrEqual(5);
        }
      });
    });

    test('has gallery as array if present', () => {
      PRODUCTS.forEach((product) => {
        if (product.gallery !== undefined) {
          expect(Array.isArray(product.gallery)).toBe(true);
          expect(product.gallery.length).toBeGreaterThan(0);

          product.gallery.forEach((img) => {
            expect(typeof img).toBe('string');
            expect(img).toMatch(/\.(webp|jpg|jpeg|png|mp4)$/i);
          });
        }
      });
    });

    test('has valid variants structure if hasOptions is true', () => {
      PRODUCTS.filter((p) => p.hasOptions).forEach((product) => {
        expect(product.variants).toBeDefined();
        expect(typeof product.variants).toBe('object');

        if (product.options?.hasColor) {
          expect(Array.isArray(product.variants.colors)).toBe(true);
          product.variants.colors.forEach((color) => {
            expect(color.id).toBeDefined();
            expect(color.name).toBeDefined();
            expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
          });
        }

        if (product.options?.hasSize) {
          expect(Array.isArray(product.variants.sizes)).toBe(true);
          product.variants.sizes.forEach((size) => {
            expect(size.value).toBeDefined();
            expect(size.label).toBeDefined();
            expect(typeof size.priceMod).toBe('number');
          });
        }
      });
    });

    test('has description if present', () => {
      PRODUCTS.forEach((product) => {
        if (product.description !== undefined) {
          expect(typeof product.description).toBe('string');
          expect(product.description.length).toBeGreaterThan(10);
        }
      });
    });
  });

  describe('Categories', () => {
    test('products have valid categories', () => {
      const validCategories = [
        'Для кухни',
        'Для ванной',
        'Панно',
        'Декор',
        'Свет',
      ];

      PRODUCTS.forEach((product) => {
        expect(validCategories).toContain(product.category);
      });
    });

    test('at least one product per main category', () => {
      const categories = [...new Set(PRODUCTS.map((p) => p.category))];
      expect(categories.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Pricing', () => {
    test('all prices are positive numbers', () => {
      PRODUCTS.forEach((product) => {
        expect(product.price).toBeGreaterThan(0);
        expect(Number.isFinite(product.price)).toBe(true);
      });
    });

    test('basePrice equals price for products with options', () => {
      PRODUCTS.filter((p) => p.hasOptions && p.basePrice).forEach((product) => {
        expect(product.basePrice).toBe(product.price);
      });
    });

    test('size price modifiers are non-negative', () => {
      PRODUCTS.filter((p) => p.variants?.sizes).forEach((product) => {
        product.variants.sizes.forEach((size) => {
          expect(size.priceMod).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});
