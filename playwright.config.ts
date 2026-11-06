import { defineConfig, devices } from '@playwright/test';

// Pruebas de regresión: describen cómo funciona el juego HOY.
// Si una falla después de un cambio, rompimos algo.
export default defineConfig({
  testDir: './pruebas/regresion',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: false,
  },
  projects: [{ name: 'celular', use: { browserName: 'chromium' } }],
});
