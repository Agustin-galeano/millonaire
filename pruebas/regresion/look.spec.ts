import { test, expect } from '@playwright/test';
import { abrir, estado, leerGuardado } from './ayuda';

test('cambiar de ropa y guardar el look', async ({ page }) => {
  await abrir(page, estado());
  await page.click('#lookPill');
  await page.click('.o[data-k=outfit][data-v=vestido]');
  await page.click('.o[data-k=hat][data-v=nada]');
  await page.click('.o[data-k=skin][data-v="4"]');
  await page.click('#lookSave');
  const g = await leerGuardado(page);
  expect(g.look).toMatchObject({ outfit: 'vestido', hat: 'nada', skin: 4 });
});

test('las telas de lujo se compran antes de usarlas', async ({ page }) => {
  await abrir(page, estado());
  await page.click('#lookPill');
  await page.click('.o[data-k=col][data-v=oro]');
  await expect(page.locator('#lookSave')).toHaveCount(0);
  await page.click('#unlockGo');
  await page.click('#lookSave');
  const g = await leerGuardado(page);
  expect(g.unlocks.oro).toBe(true);
  expect(g.look.col).toBe('oro');
  expect(g.wallet).toBeCloseTo(250000 - 1999.99, 2);
});

test('la corona es solo para miembros VIP', async ({ page }) => {
  await abrir(page, estado());
  await page.click('#lookPill');
  await page.click('.o[data-k=hat][data-v=corona]');
  await expect(page.locator('#dlgBody')).toContainText('solo para el Club VIP');
  await expect(page.locator('#lookSave')).toHaveCount(0);
});
