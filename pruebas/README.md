# Pruebas de Millonaire

Estas pruebas describen **cómo funciona el juego hoy**. Se escribieron antes de tocar el código
(Etapa 0, paso 2): si después de un cambio alguna falla, rompimos algo.

## Cómo correrlas

```bash
npm install
npx playwright install chromium
npm run pruebas
```

- `npm install`: baja las dependencias del proyecto (entre ellas Playwright, el programa que maneja el navegador solo).
- `npx playwright install chromium`: `npx` ejecuta un programa del proyecto, `playwright install` baja un navegador
  y `chromium` elige cuál. Se hace una sola vez por computadora.
- `npm run pruebas`: `run` ejecuta un atajo definido en `package.json`; `pruebas` corre `playwright test`, que abre el
  juego en un navegador invisible con tamaño de celular y hace cada prueba.

Para correr solo algunas: `npx playwright test -g "mercado"` (`-g` = solo las que tengan esa palabra en el nombre).

## Qué cubren (34 pruebas)

| Archivo | Pruebas |
|---|---|
| `arranque.spec.ts` | Bienvenida y nombre · carga sin errores en celular chico, celular, tablet y escritorio · recargar conserva el progreso |
| `catalogo.spec.ts` | Comprar descuenta saldo · sin fondos · artículos VIP bloqueados · edición limitada numerada · comprar y cambiar de salón · unirse al Club VIP |
| `boveda-mercado.spec.ts` | Guardar y exhibir · publicar con mínimo +10% · retirar publicación · comprarle a otro millonario |
| `sala.spec.ts` | Caminar a una baldosa · no pararse sobre muebles (abre la ficha) · rodear obstáculos · mover un mueble · no mover a lugar ocupado · cerrar el globo · visitar y volver |
| `look.spec.ts` | Cambiar ropa y guardar · telas de lujo se compran antes · corona solo VIP |
| `rendimiento.spec.ts` | 30 cuadros/s con CPU normal · gama media (CPU 4×) · gama baja (CPU 6×) · memoria al probar 200 combinaciones de ropa · estabilidad en 2 horas de juego simulado |

## Errores conocidos marcados con `test.fail`

Cinco pruebas describen lo que **debería** pasar y hoy no pasa. Están marcadas con `test.fail`: Playwright las cuenta
como correctas mientras sigan fallando. Cuando se corrija el error, la prueba va a "pasar inesperadamente" y hay que
sacarle la marca. Así un error corregido no puede volver sin que nos enteremos.

| Prueba | Por qué falla hoy | Se corrige en |
|---|---|---|
| Un guardado incompleto no rompe el juego | El juego queda en blanco (`TypeError`) | Etapa 0, paso 4 |
| Celular en horizontal: la sala es usable | La sala queda de 228 px de ancho | Etapa 0, paso 4 |
| Revender a los bots no genera ganancia ilimitada | En 10 minutos simulados se pasa de 0 a US$ 16.500 | Etapa 0, paso 4 (parche) y Etapa 3 |
| Gama media (CPU 4×) a 30 cuadros/s | Mediana 83 ms por cuadro (~12 cuadros/s) | Etapa 0, pasos 5 y 6 |
| Gama baja (CPU 6×) a 20 cuadros/s | Mediana 117 ms por cuadro (~9 cuadros/s) | Etapa 0, pasos 5 y 6 |

## Límites de estas pruebas

- Corren en Chromium. No reemplazan probar en un iPhone (WebKit) ni en un Android real.
- La "CPU 4× y 6× más lenta" es una simulación de gama media y baja; la medición definitiva se hace en un teléfono real.
- La prueba de 2 horas adelanta el reloj del juego: verifica la lógica (mercado, guardado, memoria de datos), no el
  calor ni la batería del teléfono. Para eso hay una prueba manual de 1 hora en el teléfono (ver `docs/CALIDAD.md`).
