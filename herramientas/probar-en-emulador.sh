#!/usr/bin/env bash
# Instala el APK en un emulador de Android, lo abre, juega un poco y guarda capturas.
# Uso: herramientas/probar-en-emulador.sh <ruta-al-apk> <carpeta-de-salida>
set -u
APK="$1"; OUT="$2"; PKG=com.agustingaleano.millonaire
mkdir -p "$OUT"
falla() { echo "FALLA: $1"; echo "$1" > "$OUT/resultado.txt"; adb logcat -d > "$OUT/logcat.txt" 2>/dev/null; exit 1; }

adb install -r "$APK" || falla "no se pudo instalar el APK"
adb logcat -c
adb shell am start -W -n "$PKG/.MainActivity" || falla "no se pudo abrir la app"
sleep 20
adb exec-out screencap -p > "$OUT/1-al-abrir.png"

PID=$(adb shell pidof "$PKG" | tr -d '\r')
[ -n "$PID" ] || falla "la app se cerró sola"
adb logcat -d > "$OUT/logcat.txt"
grep -q "FATAL EXCEPTION" "$OUT/logcat.txt" && falla "la app tuvo un cierre inesperado"

# Conectamos las pruebas a la vista web de la app (solo funciona en la versión de prueba)
adb forward tcp:9222 "localabstract:webview_devtools_remote_$PID" || falla "no se pudo conectar a la vista web"
node herramientas/humo-android.mjs "$OUT" || falla "la prueba de humo dentro de la app falló"
adb exec-out screencap -p > "$OUT/3-despues-de-jugar.png"
adb logcat -d | grep "Capacitor/Console" > "$OUT/consola.txt" || true
echo "OK" > "$OUT/resultado.txt"
echo "La app abrió, se jugó y no hubo errores."
