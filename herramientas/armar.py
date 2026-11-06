import base64,sys
src=open('herramientas/juego-fuente.html').read()
f='herramientas/fuentes/pixelify-sans-latin-%s-normal.woff2'
for w in ('400','700'):
    src=src.replace('/*FONT%s*/'%w, base64.b64encode(open(f%w,'rb').read()).decode())
open('www/index.html','w').write(src)
print(len(src))
