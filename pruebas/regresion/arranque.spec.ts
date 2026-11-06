import { test, expect } from '@playwright/test';
import { abrir, leerGuardado, URL_JUEGO } from './ayuda';

test('primera vez: muestra la bienvenida y guarda el nombre elegido', async ({ page }) => {
  const errores = await abrir(page);
  await expect(page.locator('#dlg')).toBeVisible();
  await expect(page.locator('#dlgTitle')).toHaveText('Bienvenido a Millonaire');
  await page.fill('#nameIn', 'Agus');
  await page.click('#wGo');
  await expect(page.locator('#dlg')).toBeHidden();
  const g = await leerGuardado(page);
  expect(g.name).toBe('Agus');
  expect(g.welcomed).toBe(true);
  expect(g.wallet).toBe(250000);
  expect(errores).toEqual([]);
});

for (const [nombre, w, h] of [['celular chico', 360, 640], ['celular', 390, 844], ['tablet', 820, 1180], ['escritorio', 1440, 900]] as const) {
  test(`carga sin errores en ${nombre} (${w}x${h})`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errores = await abrir(page);
    await page.click('#wGo');
    const caja = await page.locator('#room').boundingBox();
    expect(caja!.width).toBeGreaterThan(300);
    expect(errores).toEqual([]);
    await ctx.close();
  });
}

test('recargar la página conserva el progreso', async ({ page }) => {
  await abrir(page);
  await page.click('#wGo');
  await page.click('#bShop');
  await page.click('#buyBtn'); // el catálogo abre en Metales con el oro elegido
  const antes = await leerGuardado(page);
  await page.reload();
  await page.waitForTimeout(400);
  const despues = await leerGuardado(page);
  expect(despues.wallet).toBe(antes.wallet);
  expect(despues.pieces.length).toBe(1);
  await expect(page.locator('#dlg')).toBeHidden();
});

// ERROR CONOCIDO (Etapa 0): un guardado incompleto deja el juego en blanco.
test.fail('un guardado incompleto no rompe el juego', async ({ page }) => {
  const errores = await abrir(page, { wallet: 5 });
  expect(errores).toEqual([]);
});

// ERROR CONOCIDO (Etapa 0): en un celular en horizontal la sala queda diminuta.
test.fail('celular en horizontal: la sala es usable', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
  const page = await ctx.newPage();
  await page.goto(URL_JUEGO);
  await page.waitForTimeout(400);
  await page.click('#wGo');
  const caja = await page.locator('#room').boundingBox();
  expect(caja!.width).toBeGreaterThan(400);
  await ctx.close();
});
