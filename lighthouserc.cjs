/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: ['http://localhost:4173/'],
      // Command to start the server
      startServerCommand: 'npm run preview',
      // Wait for server to be ready
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      // Number of runs for each URL
      numberOfRuns: 3,
      // Use Playwright's Chromium
      chromePath: require('playwright-core').chromium.executablePath(),
      // Chromium settings
      settings: {
        preset: 'desktop',
        // Throttle to simulate real-world conditions
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      assertions: {
        // Performance
        'categories:performance': ['warn', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3500 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.9 }],

        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.9 }],

        // SEO
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      // Upload to temporary public storage (free, 7 day retention)
      target: 'temporary-public-storage',
    },
  },
}
