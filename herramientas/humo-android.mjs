// Prueba de humo dentro de la app real de Android (WebView), conectada por el puerto de depuración.
// Abre el juego, cierra la bienvenida, compra un lingote, camina y verifica que no haya errores.
// Usa el soporte de Android de Playwright, que se conecta a la vista web de una app por adb.
import { _android as android } from 'playwright-core';

const salida = process.argv[2] || '.';
const [device] = await android.devices();
if (!device) throw new Error('no hay ningún Android conectado');
console.log('Dispositivo:', device.model(), device.serial());
const webview = await device.webView({ pkg: 'com.agustingaleano.millonaire' });
const page = await webview.page();
console.log('Página:', page.url());
const errores = [];
page.on('pageerror', e => errores.push(String(e)));

const info = await page.evaluate(() => ({ ua: navigator.userAgent, ancho: innerWidth, alto: innerHeight }));
console.log('Vista web:', info);

if (await page.locator('#wGo').isVisible()) await page.click('#wGo');
await page.click('#bShop');
await page.click('#buyBtn');
await page.waitForTimeout(800);
await page.click('#sheet .x');
const g = JSON.parse(await page.evaluate(() => localStorage.getItem('millonaire-v2')));
if (!g || g.pieces.length < 1) throw new Error('la compra no quedó guardada');
console.log('Compra guardada. Saldo:', g.wallet);

const caja = await page.locator('#room').boundingBox();
await page.mouse.click(caja.x + caja.width * 0.62, caja.y + caja.height * 0.62);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${salida}/2-juego-en-android.png` });
if (errores.length) throw new Error('errores de JavaScript: ' + errores.join(' | '));
console.log('Prueba de humo OK');
await device.close();
