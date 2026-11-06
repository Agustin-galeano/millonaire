import { test, expect } from '@playwright/test';
import { abrir, estado, leerGuardado, tocarBaldosa, pixelesEn } from './ayuda';

const TRAJE = '#22305a'; // color del traje azul marino del personaje

test('tocar una baldosa libre hace caminar al personaje hasta ahí', async ({ page }) => {
  await abrir(page, estado());
  expect(await pixelesEn(page, 4, 4, TRAJE)).toBeGreaterThan(20); // empieza en el centro
  expect(await pixelesEn(page, 6, 2, TRAJE)).toBe(0);
  await tocarBaldosa(page, 6, 2);
  await page.waitForTimeout(2000);
  expect(await pixelesEn(page, 6, 2, TRAJE)).toBeGreaterThan(20);
  expect(await pixelesEn(page, 4, 4, TRAJE)).toBe(0);
});

test('el personaje no puede pararse sobre un mueble: tocarlo abre su ficha', async ({ page }) => {
  await abrir(page, estado({ pieces: [{ u: 1, t: 'mesa', paid: 1199.99, r: 0, i: 6, j: 2, s: 0 }], uid: 2 }));
  await tocarBaldosa(page, 6, 2, 8);
  await expect(page.locator('#info')).toBeVisible();
  await expect(page.locator('#infoTx')).toContainText('Mesa de mármol');
  await page.waitForTimeout(1500);
  expect(await pixelesEn(page, 4, 4, TRAJE)).toBeGreaterThan(20); // no se movió
});

test('rodea los obstáculos para llegar', async ({ page }) => {
  // una pared de mesas entre el personaje (4,4) y el destino (4,0), con hueco en (0,2).
  // (el destino se elige donde ningún mueble lo tapa en pantalla: tocar un mueble abre su ficha)
  const pared = [1, 2, 3, 4, 5, 6, 7].map((i, k) => ({ u: k + 1, t: 'mesa', paid: 1, r: 0, i, j: 2, s: 0 }));
  await abrir(page, estado({ pieces: pared, uid: 9 }));
  await tocarBaldosa(page, 4, 0);
  await page.waitForTimeout(4000);
  expect(await pixelesEn(page, 4, 0, TRAJE)).toBeGreaterThan(20);
});

test('mover un mueble a una baldosa libre queda guardado', async ({ page }) => {
  await abrir(page, estado({ pieces: [{ u: 1, t: 'sillon', paid: 799.99, r: 0, i: 6, j: 2, s: 0 }], uid: 2 }));
  await tocarBaldosa(page, 6, 2, 8);
  await page.click('#iMove');
  await expect(page.locator('#moveBar')).toBeVisible();
  await tocarBaldosa(page, 2, 6);
  await expect(page.locator('#moveBar')).toBeHidden();
  const p = (await leerGuardado(page)).pieces[0];
  expect([p.i, p.j]).toEqual([2, 6]);
});

test('no se puede mover un mueble a una baldosa ocupada', async ({ page }) => {
  await abrir(page, estado({ pieces: [
    { u: 1, t: 'sillon', paid: 799.99, r: 0, i: 6, j: 2, s: 0 },
    { u: 2, t: 'mesa', paid: 1199.99, r: 0, i: 2, j: 6, s: 0 }], uid: 3 }));
  await tocarBaldosa(page, 6, 2, 8);
  await page.click('#iMove');
  await tocarBaldosa(page, 2, 6);
  await expect(page.locator('#toast')).toContainText('ocupado');
  const p = (await leerGuardado(page)).pieces.find((q: any) => q.u === 1);
  expect([p.i, p.j]).toEqual([6, 2]);
});

test('tocar el globo de diálogo lo cierra', async ({ page }) => {
  await abrir(page, estado());
  await page.click('#bRank');
  await page.locator('.rk[data-bot^="b"]').first().click();
  await expect(page.locator('#bubble')).toHaveClass(/on/);
  await page.click('#bubble');
  await expect(page.locator('#bubble')).not.toHaveClass(/on/);
});

test('visitar a otro millonario y volver', async ({ page }) => {
  await abrir(page, estado());
  await page.click('#bRank');
  await page.locator('.rk[data-bot^="b"]').first().click();
  await expect(page.locator('#visitBar')).toBeVisible();
  await expect(page.locator('#roomPill')).toBeHidden();
  await page.click('#backBtn');
  await expect(page.locator('#roomPill')).toBeVisible();
});
