/**
 * Unit Tests for Utils Library
 * @jest-environment jsdom
 */

import {
  formatPrice,
  generateOrderId,
  isValidEmail,
  isValidPhone,
  formatPhoneE164,
  calculateCartTotals,
  truncateText,
} from '../lib/utils';

describe('formatPrice', () => {
  test('formats positive numbers correctly', () => {
    const result = formatPrice(1500);
    expect(result).toMatch(/1[\s\u00a0]?500/); // Handle non-breaking space
    expect(result).toContain('₽');
  });

  test('formats zero correctly', () => {
    expect(formatPrice(0)).toMatch(/0.*₽/);
  });

  test('handles invalid input gracefully', () => {
    expect(formatPrice(null)).toBe('0 ₽');
    expect(formatPrice(undefined)).toBe('0 ₽');
    expect(formatPrice('not a number')).toBe('0 ₽');
    expect(formatPrice(Number.NaN)).toBe('0 ₽');
  });

  test('respects showCurrency option', () => {
    const result = formatPrice(1000, false);
    expect(result).not.toContain('₽');
  });
});

describe('generateOrderId', () => {
  test('generates unique IDs', () => {
    const id1 = generateOrderId();
    const id2 = generateOrderId();
    expect(id1).not.toBe(id2);
  });

  test('uses default prefix ARB', () => {
    const id = generateOrderId();
    expect(id).toMatch(/^ARB-/);
  });

  test('uses custom prefix when provided', () => {
    const id = generateOrderId('TEST');
    expect(id).toMatch(/^TEST-/);
  });

  test('generates IDs with correct format', () => {
    const id = generateOrderId();
    // Format: PREFIX-TIMESTAMP-RANDOM
    expect(id).toMatch(/^[A-Z]+-[A-Z0-9]+-[A-Z0-9]+$/);
  });
});

describe('isValidEmail', () => {
  test('validates correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.ru')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  test('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('no@')).toBe(false);
  });

  test('handles non-string input', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
  });
});

describe('isValidPhone', () => {
  test('validates correct Russian phone numbers', () => {
    expect(isValidPhone('9991234567')).toBe(true); // 10 digits
    expect(isValidPhone('79991234567')).toBe(true); // 11 digits with 7
    expect(isValidPhone('89991234567')).toBe(true); // 11 digits with 8
    expect(isValidPhone('+7 999 123-45-67')).toBe(true); // Formatted
    expect(isValidPhone('8 (999) 123-45-67')).toBe(true);
  });

  test('rejects invalid phone numbers', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('123')).toBe(false); // Too short
    expect(isValidPhone('999123456789')).toBe(false); // Too long
  });

  test('handles non-string input', () => {
    expect(isValidPhone(null)).toBe(false);
    expect(isValidPhone(undefined)).toBe(false);
  });
});

describe('formatPhoneE164', () => {
  test('formats 10-digit numbers correctly', () => {
    expect(formatPhoneE164('9991234567')).toBe('+79991234567');
  });

  test('converts 8 prefix to +7', () => {
    expect(formatPhoneE164('89991234567')).toBe('+79991234567');
  });

  test('handles already formatted numbers', () => {
    expect(formatPhoneE164('79991234567')).toBe('+79991234567');
    expect(formatPhoneE164('+79991234567')).toBe('+79991234567');
  });

  test('removes formatting characters', () => {
    expect(formatPhoneE164('+7 (999) 123-45-67')).toBe('+79991234567');
  });

  test('handles empty input', () => {
    expect(formatPhoneE164('')).toBe('');
    expect(formatPhoneE164(null)).toBe('');
  });
});

describe('calculateCartTotals', () => {
  test('calculates correct totals', () => {
    const items = [
      { id: '1', price: 1000, quantity: 2 },
      { id: '2', price: 500, quantity: 1 },
    ];
    const result = calculateCartTotals(items);

    expect(result.subtotal).toBe(2500);
    expect(result.itemCount).toBe(3);
    expect(result.uniqueItems).toBe(2);
  });

  test('handles empty cart', () => {
    const result = calculateCartTotals([]);
    expect(result.subtotal).toBe(0);
    expect(result.itemCount).toBe(0);
    expect(result.uniqueItems).toBe(0);
  });

  test('handles invalid input', () => {
    expect(calculateCartTotals(null)).toEqual({
      subtotal: 0,
      itemCount: 0,
      uniqueItems: 0,
    });
    expect(calculateCartTotals(undefined)).toEqual({
      subtotal: 0,
      itemCount: 0,
      uniqueItems: 0,
    });
  });

  test('defaults quantity to 1', () => {
    const items = [{ id: '1', price: 1000 }];
    const result = calculateCartTotals(items);
    expect(result.itemCount).toBe(1);
    expect(result.subtotal).toBe(1000);
  });
});

describe('truncateText', () => {
  test('truncates long text', () => {
    const longText = 'This is a very long text that should be truncated';
    const result = truncateText(longText, 20);
    expect(result).toBe('This is a very long...');
    expect(result.length).toBeLessThanOrEqual(23); // 20 + ...
  });

  test('does not truncate short text', () => {
    const shortText = 'Short';
    expect(truncateText(shortText, 20)).toBe('Short');
  });

  test('handles empty input', () => {
    expect(truncateText('')).toBe('');
    expect(truncateText(null)).toBe('');
    expect(truncateText(undefined)).toBe('');
  });

  test('uses default maxLength of 100', () => {
    const text = 'a'.repeat(150);
    const result = truncateText(text);
    expect(result).toHaveLength(103); // 100 + ...
  });
});
