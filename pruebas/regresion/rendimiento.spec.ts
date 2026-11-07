import { test, expect, Page } from '@playwright/test';
import { abrir, estado, leerGuardado, leerMundo, tocarBaldosa } from './ayuda';

// Las mediciones de rendimiento corren de a una para no competir entre sí por la CPU.
test.describe.configure({ mode: 'serial' });

// Sala Palacio llena: 140 piezas variadas.
function palacioLleno() {
  const tipos = ['sillon', 'mesa', 'esmeralda', 'amatista', 'oro', 'piano', 'lampara', 'trono', 'estatua', 'cofre'];
  const pieces: any[] = []; let u = 1;
  for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) {
    if (i === 6 && j === 6) continue;
    if (pieces.length >= 140) break;
    pieces.push({ u: u++, t: tipos[(i * 3 + j) % tipos.length], paid: 100, r: 1, i, j, s: 0, seed: u });
  }
  return estado({ vip: true, rooms: [{ id: 'salon', paid: 0 }, { id: 'palacio', paid: 4999.99 }], cur: 1, pieces, uid: u });
}

async function medirCuadros(page: Page, cuadros = 90) {
  const t: number[] = await page.evaluate(n => new Promise(r => {
    const ts: number[] = []; let last = performance.now();
    function f(now: number) { ts.push(now - last); last = now; if (ts.length < n) requestAnimationFrame(f); else r(ts); }
    requestAnimationFrame(f);
  }), cuadros);
  t.sort((a, b) => a - b);
  return { mediana: t[Math.floor(t.length / 2)], p95: t[Math.floor(t.length * 0.95)] };
}

/*
 * Los resultados con "CPU 4x / 6x" dependen de qué tan rápida es la computadora que corre la prueba.
 * Para que den lo mismo en cualquier máquina, primero medimos una tarea fija ("calibración") y
 * calculamos cuánto hay que frenar la CPU para llegar a la velocidad de referencia.
 * Referencia: la máquina donde se midió el informe inicial (27 ms en esta tarea sin frenar).
 * Gama media = 4 veces más lenta que la referencia; gama baja = 6 veces.
 */
const REFERENCIA_MS = 27;
async function tareaFija(page: Page) {
  return page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 304; c.height = 240; const g = c.getContext('2d')!;
    const t: number[] = [];
    for (let k = 0; k < 7; k++) {
      const t0 = performance.now(); let a = 0;
      for (let i = 0; i < 60000; i++) { g.fillStyle = i % 2 ? '#123456' : '#abcdef'; g.fillRect(i % 300, (i * 7) % 240, 1, 1); a += Math.sqrt(i) * Math.sin(i); }
      t.push(performance.now() - t0 + (a > 1e12 ? 1 : 0));
    }
    t.sort((x, y) => x - y); return t[3];
  });
}
async function frenarCPU(page: Page, vecesMasLento: number) {
  const cdp = await page.context().newCDPSession(page);
  const medido = await tareaFija(page);
  const rate = Math.min(20, Math.max(1, (REFERENCIA_MS * vecesMasLento) / medido));
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  test.info().annotations.push({ type: 'calibración', description: `tarea fija ${medido.toFixed(1)} ms → CPU frenada ${rate.toFixed(1)}x` });
  return rate;
}

async function memoriaJS(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('HeapProfiler.collectGarbage');
  await cdp.send('Performance.enable');
  const { metrics } = await cdp.send('Performance.getMetrics');
  return metrics.find(m => m.name === 'JSHeapUsedSize')!.value / 1048576; // MB
}

test('sala llena con CPU normal: 30 cuadros por segundo o más', async ({ page }) => {
  await abrir(page, palacioLleno());
  const r = await medirCuadros(page);
  test.info().annotations.push({ type: 'medición', description: `mediana ${r.mediana.toFixed(1)} ms, p95 ${r.p95.toFixed(1)} ms` });
  expect(r.mediana).toBeLessThanOrEqual(34);
});

// CRITERIO DE ETAPA 0 (hoy no se cumple): gama media, CPU 4 veces más lenta.
test.fail('gama media (CPU 4x): sala llena a 30 cuadros por segundo o más', async ({ page }) => {
  await abrir(page, palacioLleno());
  await frenarCPU(page, 4);
  await page.waitForTimeout(500);
  const r = await medirCuadros(page, 60);
  test.info().annotations.push({ type: 'medición', description: `mediana ${r.mediana.toFixed(1)} ms, p95 ${r.p95.toFixed(1)} ms` });
  expect(r.mediana).toBeLessThanOrEqual(34);
});

// CRITERIO DE ETAPA 0 (hoy no se cumple): gama baja, CPU 6 veces más lenta, mínimo jugable 20 cuadros por segundo.
test.fail('gama baja (CPU 6x): sala llena a 20 cuadros por segundo o más', async ({ page }) => {
  await abrir(page, palacioLleno());
  await frenarCPU(page, 6);
  await page.waitForTimeout(500);
  const r = await medirCuadros(page, 60);
  test.info().annotations.push({ type: 'medición', description: `mediana ${r.mediana.toFixed(1)} ms, p95 ${r.p95.toFixed(1)} ms` });
  expect(r.mediana).toBeLessThanOrEqual(50);
});

test('memoria: probar 200 combinaciones de ropa no hace crecer la memoria más de 15 MB', async ({ page }) => {
  await abrir(page, estado());
  const antes = await memoriaJS(page);
  await page.click('#lookPill');
  const opciones = ['traje', 'smoking', 'vestido'];
  for (let k = 0; k < 200; k++) {
    await page.click(`.o[data-k=skin][data-v="${k % 6}"]`);
    if (k % 3 === 0) await page.click(`.o[data-k=outfit][data-v=${opciones[k % 3 === 0 ? (k / 3) % 3 : 0]}]`);
  }
  await page.click('#dlg .x');
  await page.waitForTimeout(300);
  const despues = await memoriaJS(page);
  test.info().annotations.push({ type: 'medición', description: `${antes.toFixed(1)} MB → ${despues.toFixed(1)} MB` });
  expect(despues - antes).toBeLessThan(15);
});

test('estabilidad: 2 horas de juego simulado sin errores y con datos acotados', async ({ page }) => {
  await page.clock.install();
  const errores = await abrir(page, estado());
  const mem0 = await memoriaJS(page);
  for (let k = 0; k < 480; k++) {             // 480 rondas de 15 s = 2 horas
    await page.clock.fastForward(15_000);
    if (k % 40 === 0) await tocarBaldosa(page, 2 + (k / 40) % 4, 5);
  }
  await page.clock.runFor(2_000);
  const mem1 = await memoriaJS(page);
  const mundo = await leerMundo(page);
  const guardado = JSON.stringify(await leerGuardado(page)) + JSON.stringify(mundo);
  test.info().annotations.push({ type: 'medición', description: `memoria ${mem0.toFixed(1)} → ${mem1.toFixed(1)} MB; guardado ${guardado.length} bytes; publicaciones ${mundo.listings.length}` });
  expect(errores).toEqual([]);
  expect(mundo.listings.length).toBeLessThanOrEqual(30);
  expect(mundo.feed.length).toBeLessThanOrEqual(20);
  expect(guardado.length).toBeLessThan(200_000);
  expect(mem1 - mem0).toBeLessThan(20);
});
