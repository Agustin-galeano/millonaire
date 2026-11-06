import { Page, expect } from '@playwright/test';
import path from 'node:path';

export const URL_JUEGO = 'file://' + path.resolve(__dirname, '../../www/index.html');
export const CLAVE = 'millonaire-v2';
export const CLAVE_MUNDO = 'millonaire-world-v2';

export const LOOK_BASE = { skin: 1, hair: 'corto', hairc: 0, hat: 'galera', acc: 'monoculo', outfit: 'traje', col: 'marino', det: 'rojo' };

export function estado(extra: Record<string, unknown> = {}) {
  return {
    name: 'Tester', wallet: 250000, vip: false, look: { ...LOOK_BASE }, unlocks: {},
    rooms: [{ id: 'salon', paid: 0 }], cur: 0, pieces: [], uid: 1, listings: [], welcomed: true,
    ...extra,
  };
}

/** Carga el juego con un guardado preparado (solo en la primera carga de la pestaña). */
export async function abrir(page: Page, guardado?: unknown, mundo?: unknown) {
  if (guardado !== undefined || mundo !== undefined) {
    await page.addInitScript(([g, m, k, km]) => {
      if (sessionStorage.getItem('sembrado')) return;
      sessionStorage.setItem('sembrado', '1');
      if (g !== null) localStorage.setItem(k as string, typeof g === 'string' ? g : JSON.stringify(g));
      if (m !== null) localStorage.setItem(km as string, JSON.stringify(m));
    }, [guardado ?? null, mundo ?? null, CLAVE, CLAVE_MUNDO]);
  }
  const errores: string[] = [];
  page.on('pageerror', e => errores.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  await page.goto(URL_JUEGO);
  await page.waitForTimeout(500);
  return errores;
}

export async function leerGuardado(page: Page) {
  return JSON.parse((await page.evaluate(k => localStorage.getItem(k), CLAVE)) || 'null');
}
export async function leerMundo(page: Page) {
  return JSON.parse((await page.evaluate(k => localStorage.getItem(k), CLAVE_MUNDO)) || 'null');
}

/** Coordenadas de pantalla del centro de una baldosa (i, j). */
export async function baldosa(page: Page, i: number, j: number, subir = 0) {
  const caja = (await page.locator('#room').boundingBox())!;
  const ancho = await page.evaluate(() => (document.getElementById('room') as HTMLCanvasElement).width);
  const s = caja.width / ancho;
  return { x: caja.x + (ancho / 2 + (i - j) * 12) * s, y: caja.y + (80 + (i + j + 1) * 6 - subir) * s };
}
export async function tocarBaldosa(page: Page, i: number, j: number, subir = 0) {
  const p = await baldosa(page, i, j, subir);
  await page.mouse.click(p.x, p.y);
}

/** Cuenta píxeles de un color en el lienzo alrededor de una baldosa (sirve para saber si el personaje está ahí). */
export async function pixelesEn(page: Page, i: number, j: number, color: string) {
  return page.evaluate(([i, j, color]) => {
    const cv = document.getElementById('room') as HTMLCanvasElement;
    const g = cv.getContext('2d')!;
    const x = cv.width / 2 + ((i as number) - (j as number)) * 12, y = 80 + ((i as number) + (j as number) + 1) * 6;
    const d = g.getImageData(Math.round(x - 8), Math.round(y - 30), 16, 30).data;
    const n = parseInt((color as string).slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
    let c = 0; for (let k = 0; k < d.length; k += 4) if (d[k] === r && d[k + 1] === gg && d[k + 2] === b) c++;
    return c;
  }, [i, j, color] as const);
}

export async function abrirCatalogo(page: Page, cat: string, nombre: string) {
  if (!(await page.locator('#sheet.open').count())) await page.click('#bShop');
  await page.click(`#catTabs .tab[data-cat=${cat}]`);
  await page.locator('.card').filter({ has: page.getByText(nombre, { exact: true }) }).first().click();
  await expect(page.locator('#dNm')).toHaveText(nombre);
}
