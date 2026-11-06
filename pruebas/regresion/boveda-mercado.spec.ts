import { test, expect } from '@playwright/test';
import { abrir, estado, leerGuardado, leerMundo } from './ayuda';

const conDiamante = () => estado({ pieces: [{ u: 1, t: 'diamante', paid: 2999.99, r: 0, i: 1, j: 1, s: 0 }], uid: 2 });

test('guardar y volver a exhibir una pieza', async ({ page }) => {
  await abrir(page, conDiamante());
  await page.click('#bVault');
  await page.locator('details summary').first().click();
  await page.click('[data-store="1"]');
  expect((await leerGuardado(page)).pieces[0].r).toBe(-1);
  // la lista se vuelve a dibujar cerrada (detalle menor anotado en el registro)
  await page.locator('details summary').first().click();
  await page.click('[data-show="1"]');
  expect((await leerGuardado(page)).pieces[0].r).toBe(0);
});

test('publicar exige al menos 10% más de lo que pagaste', async ({ page }) => {
  await abrir(page, conDiamante());
  await page.click('#bVault');
  await page.locator('details summary').first().click();
  await page.click('[data-sell="1"]');
  await page.fill('#sellIn', '3000');
  await expect(page.locator('#sellGo')).toBeDisabled();
  await page.fill('#sellIn', '3300');
  await expect(page.locator('#sellGo')).toBeEnabled();
  await page.click('#sellGo');
  const g = await leerGuardado(page);
  expect(g.pieces).toHaveLength(0);
  const mias = (await leerMundo(page)).listings.filter((l: any) => l.seller === 'me');
  expect(mias).toHaveLength(1);
  expect(mias[0]).toMatchObject({ price: 3300, piece: { t: 'diamante', paid: 2999.99 } });
});

test('retirar una publicación devuelve la pieza', async ({ page }) => {
  await abrir(page, conDiamante());
  await page.click('#bVault');
  await page.locator('details summary').first().click();
  await page.click('[data-sell="1"]');
  await page.fill('#sellIn', '5000');
  await page.click('#sellGo');
  await page.locator('[data-unl]').first().click();
  const g = await leerGuardado(page);
  expect(g.pieces).toHaveLength(1);
  expect(g.pieces[0].t).toBe('diamante');
});

test('comprarle a otro millonario descuenta el saldo y te da la pieza', async ({ page }) => {
  await abrir(page, estado());
  await page.click('#bMarket');
  const boton = page.locator('[data-buyl]').first();
  const precioTxt = (await boton.textContent())!;
  const id = await boton.getAttribute('data-buyl');
  await boton.click();
  const g = await leerGuardado(page);
  expect(g.pieces).toHaveLength(1);
  expect(g.wallet).toBeLessThan(250000);
  const precio = parseFloat(precioTxt.replace('US$', '').replace(/\./g, '').replace(',', '.'));
  expect(g.wallet).toBeCloseTo(250000 - precio, 1);
  expect(g.pieces[0].paid).toBeCloseTo(precio, 1);
  expect((await leerMundo(page)).listings.find((l: any) => l.id === id)).toBeUndefined();
});

// ERROR CONOCIDO (Etapa 0): comprar y revender a los bots genera dinero sin límite.
test.fail('revender a los bots no puede generar ganancia ilimitada', async ({ page }) => {
  await page.clock.install();
  await abrir(page, estado({ pieces: Array.from({ length: 5 }, (_, k) => ({ u: k + 1, t: 'diamante', paid: 2999.99, r: -1 })), uid: 6, wallet: 0 }));
  for (let k = 1; k <= 5; k++) {
    await page.click('#bVault');
    await page.locator('details summary').first().click();
    await page.locator('details[open] [data-sell]').first().click();
    await page.fill('#sellIn', '3300');
    await page.click('#sellGo');
    await page.click('#dlg .x');
  }
  // 40 rondas del mercado (10 minutos de juego); cada salto dispara una ronda
  for (let k = 0; k < 40; k++) await page.clock.fastForward(15_000);
  const g = await leerGuardado(page);
  // si los bots compran todo a +10%, se gana dinero sin hacer nada
  expect(g.wallet).toBeLessThan(5 * 2999.99);
});
