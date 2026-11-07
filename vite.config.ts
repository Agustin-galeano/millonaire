import { defineConfig } from 'vite';

// El código del juego vive en cliente/. Vite lo arma en www/, que es la carpeta
// que Capacitor copia dentro de las apps de Android e iOS.
export default defineConfig({
  root: 'cliente',
  base: './',            // rutas relativas: funciona dentro de la app y en cualquier carpeta
  build: {
    outDir: '../www',
    emptyOutDir: true,
    target: 'es2020',    // compatible con la vista web de Android 10+ e iOS 14+
    assetsInlineLimit: 0,
  },
  server: { port: 5173 },
  preview: { port: 4173, strictPort: true },
});
