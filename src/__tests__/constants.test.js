/**
 * Unit Tests for Constants
 * Validates constants structure and values
 * @jest-environment jsdom
 */

import {
  COLORS,
  SIZES,
  PAYMENT_STATUS,
  CURRENCY,
  NOTIFICATION_TYPES,
} from '../lib/constants';

describe('COLORS', () => {
  test('is an object with color definitions', () => {
    expect(typeof COLORS).toBe('object');
    expect(Object.keys(COLORS).length).toBeGreaterThan(0);
  });

  test('each color has required properties', () => {
    Object.entries(COLORS).forEach(([key, color]) => {
      expect(color.name).toBeDefined();
      expect(typeof color.name).toBe('string');

      expect(color.hex).toBeDefined();
      expect(color.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);

      expect(color.class).toBeDefined();
      expect(typeof color.class).toBe('string');
    });
  });

  test('has expected colors', () => {
    expect(COLORS.bronze).toBeDefined();
    expect(COLORS.chrome).toBeDefined();
    expect(COLORS.black).toBeDefined();
  });
});

describe('SIZES', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(SIZES)).toBe(true);
    expect(SIZES.length).toBeGreaterThan(0);
  });

  test('contains string values', () => {
    SIZES.forEach((size) => {
      expect(typeof size).toBe('string');
    });
  });

  test('sizes are in cm format', () => {
    SIZES.forEach((size) => {
      expect(size).toMatch(/\d+\s*см/);
    });
  });

  test('has expected size options', () => {
    expect(SIZES).toContain('60 см');
    expect(SIZES).toContain('80 см');
    expect(SIZES).toContain('100 см');
  });
});

describe('PAYMENT_STATUS', () => {
  test('is an object', () => {
    expect(typeof PAYMENT_STATUS).toBe('object');
  });

  test('has all required statuses', () => {
    expect(PAYMENT_STATUS.PENDING).toBeDefined();
    expect(PAYMENT_STATUS.SUCCESS).toBeDefined();
    expect(PAYMENT_STATUS.FAILED).toBeDefined();
    expect(PAYMENT_STATUS.CANCELED).toBeDefined();
  });

  test('all values are lowercase strings', () => {
    Object.values(PAYMENT_STATUS).forEach((status) => {
      expect(typeof status).toBe('string');
      expect(status).toBe(status.toLowerCase());
    });
  });

  test('values are unique', () => {
    const values = Object.values(PAYMENT_STATUS);
    const uniqueValues = [...new Set(values)];
    expect(values.length).toBe(uniqueValues.length);
  });
});

describe('CURRENCY', () => {
  test('is a string', () => {
    expect(typeof CURRENCY).toBe('string');
  });

  test('is RUB', () => {
    expect(CURRENCY).toBe('RUB');
  });

  test('is a valid ISO 4217 currency code', () => {
    expect(CURRENCY).toMatch(/^[A-Z]{3}$/);
  });
});

describe('NOTIFICATION_TYPES', () => {
  test('is an object', () => {
    expect(typeof NOTIFICATION_TYPES).toBe('object');
  });

  test('has expected notification types', () => {
    expect(NOTIFICATION_TYPES.ORDER_NEW).toBeDefined();
    expect(NOTIFICATION_TYPES.ORDER_STATUS).toBeDefined();
    expect(NOTIFICATION_TYPES.PAYMENT_SUCCESS).toBeDefined();
  });

  test('all values are snake_case strings', () => {
    Object.values(NOTIFICATION_TYPES).forEach((type) => {
      expect(typeof type).toBe('string');
      expect(type).toMatch(/^[a-z_]+$/);
    });
  });

  test('values are unique', () => {
    const values = Object.values(NOTIFICATION_TYPES);
    const uniqueValues = [...new Set(values)];
    expect(values.length).toBe(uniqueValues.length);
  });
});
