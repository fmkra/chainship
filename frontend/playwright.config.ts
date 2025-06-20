// Import necessary Playwright and Synpress modules
import { defineConfig, devices } from '@playwright/test'

// Define Playwright configuration
export default defineConfig({
    testDir: './test',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        // Set base URL for tests
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    // Additional Synpress-specific configuration can be added here
})
