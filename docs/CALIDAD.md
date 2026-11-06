# Registro de calidad de Millonaire

Última actualización: 6 de noviembre de 2026 · Etapa actual: **0 (Cimientos)**

Una funcionalidad está **terminada** solo cuando su lógica funciona, sus datos persisten correctamente,
sus interacciones están implementadas y sus pruebas pasan. Con esa definición, hoy hay **0 terminadas**:
todo depende de datos que viven en el teléfono.

## Criterios de aceptación de la Etapa 0

No se avanza a la Etapa 1 hasta cumplir todos.

- [x] Copia íntegra del proyecto original (`millonaire-original-2026-11-06.tar.gz`, SHA-256 `c56985e9…6e88f`)
- [x] Versión inicial recuperable en git (etiqueta `v0-linea-base`)
- [x] Pruebas de regresión documentadas (`pruebas/README.md`): 34 pruebas, estables en 3 repeticiones
- [ ] Repositorio subido a GitHub *(espera la instalación de la app de Claude en GitHub)*
- [ ] El APK compila en GitHub y abre en un Android real
- [ ] Las 29 pruebas de comportamiento siguen pasando después de reorganizar el código
- [ ] Un guardado dañado no rompe el juego ni borra el progreso
- [ ] Ya no se puede generar dinero infinito revendiendo
- [ ] Las ediciones limitadas no se pueden duplicar
- [ ] Tablet y celular en horizontal usables
- [ ] **Rendimiento gama media** (CPU 4×): sala llena a 30 cuadros/s o más
- [ ] **Rendimiento gama baja** (CPU 6×): sala llena a 20 cuadros/s o más
- [ ] **Memoria**: 200 cambios de ropa suman menos de 15 MB; 2 horas simuladas suman menos de 20 MB
- [ ] **Estabilidad prolongada**: 2 horas simuladas sin errores y con datos acotados, más 1 hora real en un teléfono sin cierres ni recalentamiento anormal
- [ ] Licencia de la fuente incluida en la app
- [ ] Estructura de iOS preparada (compilarla requiere Mac o compilación en la nube: queda marcado como pendiente, no como hecho)

## Alcance de la seguridad

La seguridad no se limita al dinero. Cada operación de estas cuatro áreas se valida en el servidor
(desde la Etapa 1) y tiene pruebas de manipulación:

| Área | Qué se protege | Ejemplos de ataques que las pruebas tienen que rechazar |
|---|---|---|
| Dinero | Saldo, precios, comisiones | Editar el saldo en el teléfono · repetir una compra con la misma petición · comprar con saldo negativo |
| Propiedad de los objetos | Cada objeto tiene un ID único y un único dueño; las ediciones limitadas tienen número único | Vender un objeto ajeno · vender el mismo objeto dos veces a la vez · inventar un objeto que nunca se compró · mover muebles en una sala ajena |
| Permisos de las habitaciones | Pública, privada o con invitación; quién puede entrar, decorar o echar visitas | Entrar a una sala privada sin invitación · mover o retirar muebles como visitante · seguir en la sala después de ser expulsado |
| Identidad de los usuarios | Cuentas, sesiones y nombres | Hacerse pasar por otro jugador · reutilizar una sesión robada o vencida · registrar nombres que imitan a otro · cambiar el nombre o el perfil de otra persona |

Hoy (antes de la Etapa 1) ninguna de las cuatro áreas está protegida, porque todo se guarda en el teléfono.

## Pruebas

| Estado | Cantidad | Detalle |
|---|---|---|
| Pasan | 29 | Arranque, catálogo, bóveda, mercado, sala, look, CPU normal, memoria, estabilidad simulada |
| Fallan a propósito (errores conocidos, `test.fail`) | 5 | Guardado incompleto, horizontal, dinero infinito, gama media, gama baja |
| Sin verificar | — | Compilación del APK · iPhone/WebKit · teléfonos reales · prueba de 1 hora en un teléfono |

Mediciones de hoy:

| Medición | Resultado | Objetivo |
|---|---|---|
| Sala llena, CPU normal | 16,7 ms por cuadro (60 cuadros/s) | ≤ 33 ms |
| Sala llena, CPU 4× | 83 ms por cuadro (~12 cuadros/s) | ≤ 33 ms |
| Sala llena, CPU 6× | 117 ms por cuadro (~9 cuadros/s) | ≤ 50 ms |
| Memoria tras 200 cambios de ropa | 0,9 → 1,9 MB | menos de 15 MB de aumento |
| 2 horas simuladas | Memoria 1,1 → 2,5 MB · guardado 6 KB · 10 publicaciones | sin errores, datos acotados |

## Errores conocidos

| # | Error | Gravedad | Estado |
|---|---|---|---|
| 1 | Dinero infinito revendiendo a los bots | Crítica | Abierto (prueba `test.fail`) |
| 2 | Saldo, piezas y VIP editables desde el teléfono | Crítica | Abierto, se resuelve en la Etapa 1 |
| 3 | Progreso solo en el teléfono | Crítica | Abierto, se resuelve en la Etapa 1 |
| 4 | Guardado incompleto deja el juego en blanco | Crítica | Abierto (prueba `test.fail`) |
| 5 | Guardado ilegible se descarta y se pisa sin aviso | Alta | Abierto |
| 6 | Ediciones limitadas duplicables por los bots | Alta | Abierto |
| 7 | Rendimiento en gama media y baja | Alta | Abierto (pruebas `test.fail`) |
| 8 | Android 16 e iPad giran la pantalla; la interfaz no está lista para horizontal | Alta | Abierto (prueba `test.fail` en celular) |
| 9 | Licencia de la fuente no incluida en la app | Baja | Abierto |
| 10 | Al guardar o exhibir desde la Bóveda, la lista se vuelve a cerrar | Baja | Abierto (nuevo, encontrado al escribir las pruebas) |
| 11 | El mundo simulado no se guarda hasta la primera compra: si se recarga antes, las publicaciones de los bots cambian | Baja | Abierto (nuevo, encontrado al escribir las pruebas) |

## Riesgos técnicos

Ver el informe inicial. Los principales: alcance, gama baja en Android, diferencias del iPhone, fraude económico,
chat con menores y dependencia de una sola persona para el código.

## Decisiones pendientes

| Decisión | Cuándo |
|---|---|
| Instalar la app de Claude en GitHub (repositorio `millonaire`) | **Ahora: bloquea la Etapa 0** |
| Cuentas de Fly.io, Neon y dominio | Inicio de la Etapa 1 |
| Edad mínima | Antes del chat (Etapa 2) |
| Moneda virtual | Fin de la Etapa 2 |
| Bots simulados | Etapa 3 |
| Cuenta de Apple y Mac | Antes de la beta |
| Pagos reales | Etapa 7, solo con aprobación expresa |
