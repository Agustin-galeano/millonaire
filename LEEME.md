# Millonaire: guía para llevarlo al celular y a las tiendas

Esta carpeta es el proyecto de la app. El juego está en `www/index.html`, y las carpetas `android/` e `ios/` son las "cáscaras" nativas que lo envuelven, hechas con **Capacitor**.

```
millonaire-app/
├── www/index.html          ← el juego (todo en un archivo, funciona sin internet)
├── android/                ← proyecto Android (ya con orientación vertical y firma preparada)
├── ios/                    ← proyecto iPhone (se abre con Xcode en una Mac)
├── assets/                 ← ícono y pantalla de inicio originales
├── capacitor.config.json   ← nombre de la app e ID (com.agustingaleano.millonaire)
├── package.json            ← lista de dependencias
└── .github/workflows/android.yml  ← receta para que GitHub compile el APK
```

---

## Paso 1: tener el APK en tu Android (gratis, sin instalar nada pesado)

GitHub tiene computadoras que compilan por vos. Vos subís el proyecto y en unos 5 minutos te devuelve el `.apk`.

### 1.1 Crear el repositorio
En github.com, tocá **New repository**, ponele `millonaire` y dejalo en **Private**. No marques ninguna casilla.

### 1.2 Subir el proyecto
Abrí una terminal dentro de la carpeta `millonaire-app` y ejecutá estos comandos uno por uno:

```bash
git init
```
- `git`: el programa que controla versiones de código.
- `init`: "inicializar". Convierte esta carpeta en un repositorio y crea la carpeta oculta `.git`, donde git guarda el historial.

```bash
git add .
```
- `add`: "agregar". Marca archivos para incluirlos en la próxima foto (commit).
- `.`: "esta carpeta y todo lo que tiene adentro".

```bash
git commit -m "Primera versión de Millonaire"
```
- `commit`: saca la "foto" de los archivos marcados y la guarda en el historial.
- `-m`: "message". Lo que va entre comillas es la descripción de esa foto.

```bash
git branch -M main
```
- `branch`: maneja las ramas, que son líneas de trabajo paralelas.
- `-M`: renombra la rama actual, aunque ya exista otra con ese nombre.
- `main`: el nombre nuevo. El workflow se dispara con pushes a `main`.

```bash
git remote add origin https://github.com/TU_USUARIO/millonaire.git
```
- `remote`: maneja los servidores remotos, o sea, dónde vive la copia en internet.
- `add`: agrega uno nuevo.
- `origin`: el apodo que le damos a ese servidor (es el nombre convencional).
- La URL: la dirección de tu repo. Cambiá `TU_USUARIO` por tu usuario de GitHub.

```bash
git push -u origin main
```
- `push`: "empujar". Sube tus commits al servidor.
- `-u`: "upstream". Deja recordado que tu `main` local va con `origin/main`, así la próxima vez alcanza con `git push`.
- `origin main`: a qué servidor y a qué rama subir.

> Si te pide contraseña, GitHub ya no acepta la de tu cuenta. Tenés que usar un **token**: Settings → Developer settings → Personal access tokens. Otra opción es instalar `gh` y correr `gh auth login`.

### 1.3 Bajar el APK
En tu repo, entrá a la pestaña **Actions** y abrí la ejecución "Compilar Android". Cuando termine en verde, abajo de todo, en **Artifacts**, vas a ver `millonaire-apk-prueba`. Bajalo, descomprimilo y pasá el `app-debug.apk` al celular. Al abrirlo, Android te va a pedir permiso para "instalar apps de origen desconocido".

Cada vez que cambies algo y hagas `git push`, GitHub compila un APK nuevo solo.

---

## Paso 2: Google Play

1. **Cuenta de desarrollador**: en play.google.com/console. Se paga una sola vez **US$ 25** y piden verificar tu identidad.
2. **Llave de firma.** Google Play exige que la app esté firmada. Creás la llave una sola vez en tu compu (necesitás Java instalado):

```bash
keytool -genkeypair -v -keystore millonaire.jks -keyalg RSA -keysize 2048 -validity 10000 -alias millonaire
```
- `keytool`: herramienta de Java para manejar llaves y certificados.
- `-genkeypair`: "generate key pair". Crea una llave privada y su certificado público.
- `-v`: "verbose". Muestra más detalle de lo que hace.
- `-keystore millonaire.jks`: el archivo donde se guarda la llave (un "llavero").
- `-keyalg RSA`: el algoritmo de cifrado de la llave.
- `-keysize 2048`: el tamaño de la llave en bits. Más bits, más difícil de romper.
- `-validity 10000`: cuántos días vale (unos 27 años; Google pide que dure más allá de 2033).
- `-alias millonaire`: el nombre de esta llave dentro del llavero.

Te va a pedir una contraseña y algunos datos. **Guardá el `.jks` y la contraseña en un lugar seguro.** Si los perdés, no podés volver a publicar actualizaciones con esa llave. Y nunca los subas al repositorio.

3. **Pasarle la llave a GitHub sin exponerla.** Convertís el archivo a texto:

```bash
base64 -w 0 millonaire.jks > llave.txt
```
- `base64`: convierte un archivo binario en texto plano (letras, números, `+` y `/`).
- `-w 0`: "wrap 0". Todo en una sola línea, sin cortes.
- `millonaire.jks`: el archivo a convertir.
- `>`: redirige la salida a un archivo en vez de mostrarla en pantalla.
- `llave.txt`: el archivo donde queda el texto.

En el repo, entrá a **Settings → Secrets and variables → Actions → New repository secret** y creá estos 4:

| Nombre | Valor |
|---|---|
| `KEYSTORE_BASE64` | todo el contenido de `llave.txt` |
| `KEYSTORE_PASSWORD` | la contraseña del llavero |
| `KEY_ALIAS` | `millonaire` |
| `KEY_PASSWORD` | la contraseña de la llave (suele ser la misma) |

Después borrá `llave.txt`. Desde ese momento, cada compilación también genera **`millonaire-aab-google-play`**. Ese `.aab` es el archivo que se sube a Play Console.

4. **Prueba cerrada obligatoria.** Si tu cuenta es personal y nueva, Google exige una prueba cerrada con **12 testers durante 14 días seguidos** antes de dejarte publicar para todo el mundo. Las cuentas de organización (con número D-U-N-S) están exentas.
5. Completá la ficha: descripción, capturas, política de privacidad (una página web simple alcanza), clasificación de contenido y formulario de seguridad de datos.

---

## Paso 3: App Store (iPhone)

Para iPhone hacen falta dos cosas que no se pueden saltear:
- **Apple Developer Program**: **US$ 99 por año**.
- **Una Mac con Xcode**, o un servicio que compile en la nube con Mac, como Codemagic (tiene plan gratis) o GitHub Actions con `runs-on: macos-latest`.

En la Mac:
```bash
npm install
npx cap sync ios
npx cap open ios
```
- `npm install`: `npm` es el gestor de paquetes de Node; `install` baja todo lo que está en `package.json` y lo guarda en `node_modules/`.
- `npx`: ejecuta un programa instalado en el proyecto sin instalarlo en todo el sistema.
- `cap`: la herramienta de línea de comandos de Capacitor.
- `sync ios`: copia el juego (`www/`) dentro del proyecto de iPhone y actualiza los plugins.
- `open ios`: abre el proyecto en Xcode.

En Xcode: elegí tu equipo de desarrollador en *Signing & Capabilities*, después **Product → Archive** y subilo a App Store Connect.

**Ojo con Apple:** rechaza las apps que son "una página web metida en una app" (regla 4.2). A favor de Millonaire: funciona sin internet, vibra con el motor háptico del teléfono al comprar y es un juego con gráficos propios. Aun así, conviene sumarle más funciones nativas antes de mandarla a revisión. Ver "Próximos pasos".

---

## Cómo cambiar el juego

Editá `www/index.html` y después corré:
```bash
npx cap sync
```
- `sync`: copia los cambios del juego a Android e iOS de una sola vez.

Para cambiar el ícono, reemplazá los archivos de `assets/` y corré `npm run icons`. `run` ejecuta un "script" definido en `package.json`; este en particular genera todos los tamaños de ícono para Android e iPhone.

---

## Próximos pasos (para que compren con plata real)

Hoy el juego está en **modo demo**: la billetera es de mentira y los otros millonarios (ranking, mercado, Club VIP) están simulados en el teléfono. Para hacerlo real:

1. **Compras dentro de la app (In-App Purchases).** Tanto Apple como Google exigen que los bienes digitales se cobren **con su sistema de pagos**, y se quedan con entre el 15% y el 30%. Cada artículo del catálogo pasa a ser un "producto" que cargás en App Store Connect y en Play Console. En el código se integra con un plugin como `@revenuecat/purchases-capacitor` o `cordova-plugin-purchase`.
2. **Precios máximos.** Apple permite hasta **US$ 10.000** por compra, pero los precios más altos hay que pedirlos. Google Play subió su tope a unos **US$ 5.000**. Por eso el Diamante rosa (US$ 9.999,99) quizás tenga que ser más barato en Android.
3. **Servidor y cuentas de usuario**, para que nadie pierda su colección si cambia de celular y para tener el **ranking mundial**.
4. **Mercado entre jugadores con plata real.** Es la parte más delicada. Si un jugador puede cobrar en efectivo lo que vende, la app pasa a mover dinero entre personas, y eso trae regulaciones financieras e impuestos. Además, las tiendas tienen sus propias reglas. Lo más común es que el mercado use una **moneda propia del juego**, que se compra con In-App Purchases y **no se puede retirar**. Antes de lanzar esta parte, consultalo con un contador o un abogado.
