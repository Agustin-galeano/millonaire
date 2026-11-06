import { test, expect } from '@playwright/test';
import { abrir, estado, leerGuardado, leerMundo, abrirCatalogo } from './ayuda';

test('comprar un lingote descuenta el saldo y aparece en la bóveda', async ({ page }) => {
  await abrir(page, estado());
  await abrirCatalogo(page, 'metal', 'Lingote de oro');
  await page.click('#buyBtn');
  const g = await leerGuardado(page);
  expect(g.wallet).toBeCloseTo(250000 - 99.99, 2);
  expect(g.pieces).toHaveLength(1);
  expect(g.pieces[0]).toMatchObject({ t: 'oro', paid: 99.99, r: 0 });
  await page.click('#sheet .x');
  await page.click('#bVault');
  await expect(page.locator('#dlgBody')).toContainText('Lingote de oro');
  await expect(page.locator('#dlgBody')).toContainText('x1');
});

test('sin saldo suficiente el botón queda deshabilitado', async ({ page }) => {
  await abrir(page, estado({ wallet: 50 }));
  await abrirCatalogo(page, 'metal', 'Lingote de oro');
  await expect(page.locator('#buyBtn')).toBeDisabled();
  await expect(page.locator('#buyBtn')).toContainText('SIN FONDOS');
});

test('los artículos VIP no se pueden comprar sin ser VIP', async ({ page }) => {
  await abrir(page, estado());
  await abrirCatalogo(page, 'gema', 'Diamante negro');
  await expect(page.locator('#buyBtn')).toBeDisabled();
  await expect(page.locator('#buyBtn')).toContainText('SOLO VIP');
});

test('la edición limitada se numera y descuenta disponibles', async ({ page }) => {
  await abrir(page, estado());
  await abrirCatalogo(page, 'gema', 'Diamante rosa');
  const quedan = Number((await page.locator('#dDs').textContent())!.match(/Quedan (\d+)/)![1]);
  const antes = 100 - quedan;
  await page.click('#buyBtn');
  const g = await leerGuardado(page);
  expect(g.pieces[0].ed).toBe(antes + 1);
  expect((await leerMundo(page)).minted.rosa).toBe(antes + 1);
  await expect(page.locator('#dDs')).toContainText(`Quedan ${100 - antes - 1}`);
});

test('comprar un salón te lleva a él y podés volver al anterior', async ({ page }) => {
  await abrir(page, estado());
  await abrirCatalogo(page, 'salon', 'Penthouse');
  await page.click('#buyBtn');
  await expect(page.locator('#roomName')).toHaveText('Penthouse');
  const g = await leerGuardado(page);
  expect(g.rooms.map((r: any) => r.id)).toEqual(['salon', 'penthouse']);
  expect(g.cur).toBe(1);
  await page.click('#roomPill');
  await page.locator('[data-room="0"]').click();
  await expect(page.locator('#roomName')).toHaveText('Salón');
  // no se puede comprar dos veces
  await abrirCatalogo(page, 'salon', 'Penthouse');
  await expect(page.locator('#buyBtn')).toContainText('YA ES TUYO');
});

test('unirse al Club VIP descuenta el precio y habilita el salón VIP', async ({ page }) => {
  await abrir(page, estado());
  await page.click('#bVip');
  await page.click('#vipGo');
  const g = await leerGuardado(page);
  expect(g.vip).toBe(true);
  expect(g.wallet).toBeCloseTo(250000 - 999.99, 2);
  await page.click('#vipIn');
  await expect(page.locator('#visitTx')).toContainText('Salón VIP');
  await page.click('#backBtn');
  await expect(page.locator('#roomPill')).toBeVisible();
});
