/**
 * E2E Test: Homepage and Navigation
 * Tests core navigation and page loading
 */
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Arbarea/i);
    
    // Check main content is visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display header', async ({ page }) => {
    // Header should be visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should display bottom navigation', async ({ page }) => {
    // Bottom nav should be visible on mobile
    const bottomNav = page.locator('nav').last();
    await expect(bottomNav).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Click on Gallery link
    await page.click('text=Галерея');
    await expect(page).toHaveURL(/\/gallery/);
    
    // Go back to home
    await page.click('text=Витрина');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Products', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display product cards', async ({ page }) => {
    // Wait for products to load
    const productCards = page.locator('[data-testid="product-card"]');
    
    // At least one product should be visible
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should open product details on click', async ({ page }) => {
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    
    // Should show product details modal or navigate to product page
    await expect(page.locator('[data-testid="product-modal"], [data-testid="product-details"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Cart', () => {
  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/cart');
    
    // Cart page should be visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should show empty cart message when no items', async ({ page }) => {
    // Clear localStorage first
    await page.evaluate(() => localStorage.removeItem('arbarea_cart'));
    
    await page.goto('/cart');
    
    // Should show empty cart indicator
    await expect(page.getByText(/корзина пуста|пусто/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Profile', () => {
  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/profile');
    
    // Profile page should be visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should show login options when not authenticated', async ({ page }) => {
    await page.goto('/profile');
    
    // Should show auth options
    await expect(page.getByText(/войти|вход|авторизация/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Should have at least one h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible({ timeout: 5000 });
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/');
    
    // All buttons should have accessible names
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const name = await button.getAttribute('aria-label') || await button.textContent();
        expect(name?.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('net::ERR')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
