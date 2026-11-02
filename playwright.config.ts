import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 360, height: 740 },
    hasTouch: true,
    isMobile: true,
    locale: 'pt-BR',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
