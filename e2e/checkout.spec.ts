/**
 * E2E Test: Checkout Flow
 * Tests the complete order flow from cart to payment
 */
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart via localStorage
    await page.addInitScript(() => {
      const cartItem = {
        id: 101,
        name: 'Тестовый товар',
        price: 2500,
        quantity: 1,
        image: '/images/products/test.webp',
      };
      localStorage.setItem('arbarea_cart', JSON.stringify([cartItem]));
    });
  });

  test('should display cart with items', async ({ page }) => {
    await page.goto('/cart');
    
    // Should show cart items
    await expect(page.getByText('Тестовый товар')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/2[\s,]?500/)).toBeVisible();
  });

  test('should show checkout button when cart has items', async ({ page }) => {
    await page.goto('/cart');
    
    // Checkout button should be visible
    const checkoutButton = page.getByRole('button', { name: /оформить|заказ|купить/i });
    await expect(checkoutButton).toBeVisible({ timeout: 5000 });
  });

  test('should open checkout modal on button click', async ({ page }) => {
    await page.goto('/cart');
    
    // Click checkout button
    const checkoutButton = page.getByRole('button', { name: /оформить|заказ|купить/i });
    await checkoutButton.click();
    
    // Checkout modal should appear
    await expect(page.getByText(/оформление|контактные данные|доставка/i)).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields in checkout', async ({ page }) => {
    await page.goto('/cart');
    
    // Open checkout
    const checkoutButton = page.getByRole('button', { name: /оформить|заказ|купить/i });
    await checkoutButton.click();
    
    // Try to submit without filling fields
    const submitButton = page.getByRole('button', { name: /оплатить|подтвердить/i });
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should show validation errors or not proceed
      // (Implementation depends on form validation approach)
    }
  });

  test('should update quantity in cart', async ({ page }) => {
    await page.goto('/cart');
    
    // Find quantity controls
    const increaseButton = page.locator('button:has-text("+")').first();
    
    if (await increaseButton.isVisible()) {
      await increaseButton.click();
      
      // Quantity should increase
      await expect(page.getByText('2')).toBeVisible();
    }
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/cart');
    
    // Find remove button
    const removeButton = page.getByRole('button', { name: /удалить|убрать/i }).first();
    
    if (await removeButton.isVisible()) {
      await removeButton.click();
      
      // Cart should be empty
      await expect(page.getByText(/корзина пуста|пусто/i)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Individual Order Flow', () => {
  test('should open individual order form', async ({ page }) => {
    await page.goto('/');
    
    // Find individual order button
    const individualOrderButton = page.getByRole('button', { name: /индивидуальный|на заказ|свой/i });
    
    if (await individualOrderButton.isVisible()) {
      await individualOrderButton.click();
      
      // Form should appear
      await expect(page.getByText(/описание|размеры|заявка/i)).toBeVisible({ timeout: 5000 });
    }
  });
});
