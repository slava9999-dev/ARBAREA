/**
 * E2E Test: Homepage and Navigation
 * Tests core navigation and page loading
 */
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

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
    // Navigate first so localStorage belongs to the app origin, then clear it.
    await page.goto('/cart');
    await page.evaluate(() => localStorage.removeItem('arbarea_cart'));
    await page.reload();

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

    // Unauthenticated profile shows the phone-only registration screen.
    await expect(
      page
        .getByText(/скидка 10%|получить скидку|ваше имя|номер телефона|регистрац/i)
        .first(),
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Product gallery', () => {
  const swipe = async (
    page: Page,
    from: { x: number; y: number },
    dx: number,
  ) => {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(from.x + (dx * i) / 12, from.y, { steps: 1 });
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await page.waitForTimeout(400);
  };

  test('swiping photos on details must not open the lightbox', async ({
    page,
  }) => {
    await page.goto('/product/101');
    await page.waitForTimeout(1500);

    // Swipe through every photo and past the last one: no modal may appear.
    for (let i = 0; i < 12; i++) {
      await swipe(page, { x: 300, y: 300 }, -180);
      await expect(page.locator('dialog[open]')).toHaveCount(0);
    }
  });

  test('tap opens the fullscreen viewer and it is viewport-centered', async ({
    page,
  }) => {
    await page.goto('/product/101');
    await page.waitForTimeout(1500);

    await page.mouse.click(200, 300);
    const dialog = page.locator('dialog[open]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('/ 9')).toBeVisible();

    // Regression: the fixed overlay used to be trapped by <main>'s
    // backdrop-filter containing block, pushing the photo off-screen.
    const img = await page.evaluate(() => {
      const el = document.querySelector('dialog[open] img') as HTMLImageElement;
      const r = el.getBoundingClientRect();
      return {
        centerY: r.y + r.height / 2,
        viewportCenterY: window.innerHeight / 2,
        width: r.width,
        naturalWidth: el.naturalWidth,
      };
    });
    expect(Math.abs(img.centerY - img.viewportCenterY)).toBeLessThan(40);
    expect(img.width).toBeGreaterThan(100);
    expect(img.naturalWidth).toBeGreaterThan(0);

    // Swiping inside the viewer pages to the next photo.
    await swipe(page, { x: 300, y: 420 }, -220);
    await expect(dialog.getByText('/ 9')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
  });

  test('card gallery swipes past the last photo without opening modals', async ({
    page,
  }) => {
    await page.goto('/');
    const card = page.locator('[data-testid="product-card"]').first();
    await card.waitFor({ timeout: 15000 });
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const tbox = await card.locator('.cursor-pointer').first().boundingBox();
    const cx = (tbox?.x ?? 0) + (tbox?.width ?? 0) / 2;
    const cy = (tbox?.y ?? 0) + (tbox?.height ?? 0) / 2;

    for (let i = 0; i < 12; i++) {
      await swipe(page, { x: cx + 100, y: cy }, -160);
      await expect(page.locator('dialog[open]')).toHaveCount(0);
    }

    // The maximize button still opens the viewer.
    await card.locator('button[aria-label="Открыть на весь экран"]').click();
    await expect(page.locator('dialog[open]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
  });
});

test.describe('Ambient background', () => {
  const dustPixels = (page: Page) =>
    page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return -1;
      const ctx = canvas.getContext('2d');
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let lit = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) lit += 1;
      }
      return lit;
    });

  test('renders moving dust and the hero sheen', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1800);

    const first = await dustPixels(page);
    expect(first).toBeGreaterThan(0);

    await page.waitForTimeout(700);
    const second = await dustPixels(page);
    expect(second).toBeGreaterThan(0);
    expect(second).not.toBe(first);

    const sheen = await page.evaluate(() => {
      const h1 = document.querySelector('h1.text-sheen');
      return h1 ? getComputedStyle(h1, '::after').animationName : null;
    });
    expect(sheen).toBe('text-sheen-sweep');
  });

  test('prefers-reduced-motion freezes the dust', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(1800);

    const first = await dustPixels(page);
    expect(first).toBeGreaterThan(0);
    await page.waitForTimeout(800);
    expect(await dustPixels(page)).toBe(first);
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
    await page.waitForLoadState('load');
    
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
    await page.waitForLoadState('load');
    // Give async chunks/analytics a brief moment to surface any real errors.
    await page.waitForTimeout(1500);

    // Filter out known acceptable noise: favicon/network hiccups, third-party
    // analytics (Yandex Metrica) blocked by CSP, and framer-motion's internal
    // forwardRef warning. None of these are app-level failures.
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('net::ERR') &&
        !e.includes('Content Security Policy') &&
        !e.includes('mc.yandex') &&
        !e.includes('forwardRef') &&
        !e.includes('Function components cannot be given refs'),
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
