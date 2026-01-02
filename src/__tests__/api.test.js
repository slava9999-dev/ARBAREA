/**
 * Unit Tests for API Functions
 * Tests fetchProducts and fetchCategories mock API
 * @jest-environment jsdom
 */

import { fetchProducts, fetchCategories } from '../lib/api';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';

// Mock timers for faster tests
jest.useFakeTimers();

describe('fetchProducts', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('returns a promise', () => {
    const result = fetchProducts();
    expect(result).toBeInstanceOf(Promise);
  });

  test('resolves with PRODUCTS array', async () => {
    const promise = fetchProducts();

    // Fast-forward timers
    jest.advanceTimersByTime(1000);

    const products = await promise;
    expect(products).toEqual(PRODUCTS);
  });

  test('returns array of products', async () => {
    const promise = fetchProducts();
    jest.advanceTimersByTime(1000);

    const products = await promise;
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });
});

describe('fetchCategories', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('returns a promise', () => {
    const result = fetchCategories();
    expect(result).toBeInstanceOf(Promise);
  });

  test('resolves with CATEGORIES array', async () => {
    const promise = fetchCategories();

    jest.advanceTimersByTime(1000);

    const categories = await promise;
    expect(categories).toEqual(CATEGORIES);
  });

  test('returns array of categories', async () => {
    const promise = fetchCategories();
    jest.advanceTimersByTime(1000);

    const categories = await promise;
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  test('each category has required fields', async () => {
    const promise = fetchCategories();
    jest.advanceTimersByTime(1000);

    const categories = await promise;
    categories.forEach((category) => {
      expect(category.id).toBeDefined();
      expect(category.name).toBeDefined();
      expect(category.icon).toBeDefined();
    });
  });
});
