# KPL · Apertura y exposición de cartas

Animación de 12 segundos, 288 fotogramas a 24 fps. Utiliza el maletín aprobado y las siete imágenes de cartas que ya existen en `public/cards`. Las cartas se presentan como piezas negras con cantos dorados y el arte original impreso; el recorte de los márgenes transparentes se realiza mediante UVs, sin cambiar los PNG de origen.

| Tiempo aproximado | Acción |
| --- | --- |
| 0–1,1 s | Maletín de pie, asa arriba y emblema visible. |
| 1,1–3,2 s | El maletín se tumba mientras la cámara orbita hasta el frontal. |
| 3,5–4,5 s | Se pulsa el cierre izquierdo y su palanca se abre. |
| 4,6–5,7 s | Se pulsa el cierre derecho y su palanca se abre. |
| 6–8,4 s | Apertura de tapa con aceleración, ligero sobrepaso y asentamiento a 105°. Luz dorada interior. |
| 7,5–11,1 s | Las siete cartas salen escalonadas, giran y se colocan en abanico. |
| 11,1–12 s | Composición final inmóvil; las siete cartas quedan expuestas. |

## Entrega

- `kpl-reveal.blend`: escena editable, cámara animada, cierres independientes, tapa y siete cartas, luces y texturas empaquetadas. Configurada con Cycles para futuras exportaciones del master.
- `kpl-reveal-1080p.mp4`: vídeo master 1920 × 1080, H.264, sin audio.
- `/public/cards/kpl-reveal.mp4`: versión 1280 × 720 para la web, H.264 con `faststart`, sin audio.
- `/public/models/kpl/kpl-reveal.glb`: modelo animado autónomo. Una sola animación, `KPL_Reveal`, de aproximadamente 11,958 s; 52 nodos, 39 mallas y cámara animada `KPL_Reveal_Camera`.
- `/public/images/kpl/kpl-reveal-poster.webp`: primer fotograma.
- `/public/images/kpl/kpl-reveal-final.webp`: composición final para mantener las cartas expuestas o mostrar una alternativa estática.
- `storyboard.jpg`: vistas de los momentos clave tomadas del vídeo final.

Las rutas `/public` anteriores parten de la raíz del proyecto. Astro sirve esos recursos sin el prefijo `/public`.

## Reproducción en la web

Reproducir una sola vez y conservar el último fotograma. No activar `loop`, porque las cartas deben quedarse expuestas. El vídeo funciona con `muted` y `playsinline`. Si la persona solicita movimiento reducido, mostrar `kpl-reveal-final.webp` y permitir iniciar la animación explícitamente. Conservar la proporción 16:9 usando `contain` para que las siete cartas queden dentro del encuadre.

En un visor glTF, reproducir el clip `KPL_Reveal` una vez y fijar su estado final (`LoopOnce` y `clampWhenFinished` en Three.js). La cámara exportada conserva el recorrido cinematográfico; puede utilizarse para reproducir la composición del vídeo. La iluminación de estudio y las microtexturas procedurales están en el `.blend`; el GLB utiliza materiales PBR y necesita iluminación de entorno en el visor. La luz de área interior se reproduce en el vídeo y el `.blend`, pero no se exporta al GLB.

## Producción y verificación

Se creó la escena mediante el MCP de Blender. `../04_reveal_animation.py` parte del `.blend` aprobado; `../05_export_reveal.py` agrupa la geometría estática y exporta la animación completa. `../reveal_render.py` renderiza los fotogramas con EEVEE, trazado de rayos y 64 muestras a 1080p. `../package_reveal.py` codifica los vídeos y genera los recursos de publicación y el manifiesto.

Verificado el GLB mediante reimportación en Blender: cuerpo, tapa, ambos cierres, cartas de muestra y cámara coinciden con la escena original en seis instantes; desviación máxima de matriz inferior a 0,000001. Comprobados los 288 encuadres: toda la geometría permanece dentro de la imagen, con al menos un 4,4 % de margen, y por encima del suelo. Revisados fotogramas de los principales estados. La reproducción en navegador no se ha integrado en la página Astro en esta entrega.

Procedencia: geometría del maletín creado en esta conversación; marca y cartas del proyecto del usuario. No se han incorporado modelos, imágenes ni música de terceros.
