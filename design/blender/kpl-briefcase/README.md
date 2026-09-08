# Maletín KPL

La [animación completa de presentación y salida de las siete cartas](reveal/README.md) está en `reveal/`, con vídeo para Astro, GLB animado y escena editable independientes.

Modelo creado en Blender 5.2.1 mediante el MCP de Blender a partir del maletín del vídeo `public/cards/maletin-cartas-apertura.mp4`, según la corrección del usuario. Cuerpo negro acanalado, perfiles de aluminio, asa curva cromada, cierres negros con pulsadores dorados y forro interior. El logo procede de `public/kpl-logo-wordmark.png`.

## Archivos

- `kpl-briefcase.blend`: modelo editable, materiales procedurales, logo empaquetado, iluminación de estudio, dos cámaras y apertura de tapa.
- `../../../public/models/kpl/kpl-briefcase.glb`: recurso web autónomo con logo incluido, 13 mallas, 95.300 triángulos y aproximadamente 2,5 MB. Sin dependencia de decodificadores Draco.
- `../../../public/images/kpl/kpl-briefcase-{closed,open,transparent}.webp`: renders de 1600 × 1200. Las versiones `-800.webp` miden 800 × 600.
- `kpl-briefcase-{closed,open,transparent}.png`: originales del render.

Los directorios `public` anteriores se refieren a la raíz del proyecto Astro: las URLs públicas son `/models/kpl/…` y `/images/kpl/…`.

## Uso en Astro

```astro
<img
  src="/images/kpl/kpl-briefcase-transparent.webp"
  srcset="/images/kpl/kpl-briefcase-transparent-800.webp 800w, /images/kpl/kpl-briefcase-transparent.webp 1600w"
  sizes="(max-width: 768px) 100vw, 50vw"
  width="1600"
  height="1200"
  alt="Maletín metálico negro de Kings Padel League con cierres dorados"
/>
```

Si acompaña texto que ya describe el maletín y su papel es decorativo, usar `alt=""`. Reservar el espacio con las dimensiones indicadas. Para contenido fuera de la primera pantalla, añadir `loading="lazy"`.

En un visor 3D, cargar `/models/kpl/kpl-briefcase.glb`. La animación se llama `KPL_Open` y dura unos 3,57 segundos, con pausas al principio y al final. Anima la tapa de 0 a 105 grados; los cierres y el asa son piezas estáticas. Escala real: cuerpo de aproximadamente 48 × 30 × 12 cm. glTF usa Y vertical; el `.blend` usa Z vertical. Desactivar la reproducción automática cuando se solicite movimiento reducido y cargar el visor bajo demanda.

El GLB lleva materiales PBR con valores calibrados. Las microtexturas procedurales de Cycles están en el `.blend` y en los renders; no se han horneado en el GLB. Para apreciar el metal en un visor hace falta iluminación de entorno. El aspecto final del visor depende de su iluminación y gestión del color.

## Producción y comprobaciones

Ejecutar `01_model.py`, `02_studio.py` y `03_export.py`, en ese orden, en una sesión nueva de Blender mediante MCP. Los scripts contienen la ruta local de este proyecto. `render.py` acepta `preview`, `closed`, `open` o `transparent` después de `--` al ejecutar Blender en segundo plano con el `.blend`.

Comprobado: render en Cycles; reimportación del GLB en Blender; 13 mallas; apertura de tapa y límites espaciales en estados abierto y cerrado; una sola escena en el GLB. Los recursos están preparados en `public`; la página Astro y su vídeo existente no se han modificado. No se ha probado un visor WebGL en navegador.

Procedencia: geometría modelada mediante Python/Blender en esta sesión; vídeo y marca tomados del proyecto del usuario. No se han descargado modelos ni texturas externos. No se atribuye una licencia nueva al logo ni al vídeo del proyecto.
