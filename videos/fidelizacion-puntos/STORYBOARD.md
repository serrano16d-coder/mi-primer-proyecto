# Tutorial para clientes: campaña de puntos (26 s, 9:16, sin voz)

Personaje: Clara, la clienta (contorno negro, color plano y sombra suave, con lentes redondos como la referencia).
Colores: lila `#D380EB` y gris `#B1BDCE` como principales, con blanco y negro de apoyo.
Tipografía: Neue Plak si sus archivos están en `assets/fonts/`; si no, se usa Barlow en su lugar.
Música: sintetizada por código a 120 BPM, y cada cambio de escena cae en un golpe.

| # | Seg. | Fondo | Texto en pantalla | Qué hace Clara | Salida |
|---|---|---|---|---|---|
| 1 | 0–3 | Blanco, fachada "Tu tienda" | Tu compra de siempre **ahora suma** | Llega andando con la bolsa y saluda | Pan (sigue andando) |
| 2 | 3–7,5 | Gris, caja registradora | PASO 1 · **Compra** como siempre | Pone los productos en la cinta; cada uno da una estrella; sale el ticket "+ PUNTOS" | Caída |
| 3 | 7,5–12,5 | Lila, tarjeta "Mis puntos" | PASO 2 · **Suma** puntos con cada compra | Lanza estrellas a la tarjeta hasta llenarla y salta | Iris desde Clara |
| 4 | 12,5–17,5 | Blanco, caja de regalo | PASO 3 · **Canjea** tus puntos por premios | Se abre el regalo y salen una maleta, unos cascos y una sartén; Clara lo celebra | Whip |
| 5 | 17,5–22 | Negro | VENTAJAS · ¿Por qué **te conviene?** Sin cambiar tus hábitos / Cada compra suma / Premios que te encantan | Señala cada ventaja | Barrido blanco |
| 6 | 22–26 | Lila | Empieza a **sumar** hoy · botón "Pregunta en tu tienda" · logo TCC | Saluda con la bolsa | Fin |

Pendiente:
- Logo: poner `assets/logo-tcc.png` (PNG con fondo transparente). Mientras no esté, sale una firma de texto "TCC GLOBAL" provisional (no es el logo oficial).
- Tipografía: copiar los archivos de Neue Plak a `assets/fonts/` (`NeuePlak-Black|Bold|Regular` en .otf, .ttf o .woff2) y volver a renderizar.

Render: `CHROME_PATH=/opt/pw-browsers/chromium MUSIC_GAIN=0.55 SFX_GAIN=0.45 ./build.sh tcc-fidelizacion-tutorial`
Música: `.venv/bin/python music.py audio/music.wav 26 && ffmpeg -i audio/music.wav audio/music.mp3`
