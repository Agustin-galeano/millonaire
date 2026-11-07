# Cómo trabajar con el código de Millonaire

## Dónde está cada cosa

```
cliente/                 ← el juego (lo que ve el jugador)
├── index.html           ← la estructura de la pantalla
├── src/principal.ts     ← la lógica del juego (TypeScript)
├── src/estilos.css      ← los estilos
├── recursos/fuentes/    ← fuente Pixelify Sans y su licencia
└── public/              ← archivos que se copian tal cual (licencias, manifest)
www/                     ← el juego ARMADO (lo genera Vite; no se edita a mano ni se sube a git)
android/  ios/           ← las apps nativas de Capacitor
pruebas/                 ← pruebas automáticas (ver pruebas/README.md)
herramientas/            ← scripts de apoyo (prueba en emulador de Android)
docs/                    ← documentación y registro de calidad
```

## Comandos

```bash
npm install
```
`npm` es el gestor de paquetes de Node. `install` baja todo lo que figura en `package.json`. Se hace una vez,
y cada vez que cambian las dependencias.

```bash
npm run dev
```
`run` ejecuta un atajo de `package.json`. `dev` abre el juego en `http://localhost:5173` y lo recarga solo cada vez
que guardás un cambio. Para trabajar.

```bash
npm run build
```
`build` ("armar"): Vite junta TypeScript, estilos y fuentes y deja el juego listo en `www/`.

```bash
npm run tipos
```
Revisa que el TypeScript no tenga errores de tipos, sin armar nada.

```bash
npm run pruebas
```
Arma el juego, lo sirve en `http://localhost:4173` y corre todas las pruebas de regresión.

```bash
npm run sync
```
Arma el juego y lo copia dentro de las apps de Android e iOS (`cap sync`).

## Reglas

- Antes de subir un cambio: `npm run tipos` y `npm run pruebas` tienen que dar bien.
- Cada cambio va a git con un mensaje que explica qué y por qué.
- GitHub repite las pruebas, compila el APK y lo prueba en un Android emulado en cada cambio.

## Estado de TypeScript

El código se pasó de JavaScript a TypeScript **sin cambiar su comportamiento**. Por ahora el control de tipos está
en modo flexible (`strict: false`) porque el archivo original no tenía tipos. Se va a endurecer módulo por módulo
a medida que se separe el código (Etapa 0, paso 3 en adelante).
