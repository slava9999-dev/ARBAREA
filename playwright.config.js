// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Arbarea Mobile App
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directory with test files
  testDir: './e2e',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'on-first-retry',
    
    // Viewport for mobile-first testing
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    
    // Locale
    locale: 'ru-RU',
    
    // Timezone
    timezoneId: 'Europe/Moscow',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        channel: 'chrome',
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 14'],
      },
    },
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
