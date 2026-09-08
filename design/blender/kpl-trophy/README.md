# Trofeo KPL · Champions · 400 mm

Modelo creado con Blender MCP a partir de la imagen facilitada. Incluye láminas
doradas facetadas, núcleo negro, rombo central, peana escalonada y placa
«KINGS PADEL LEAGUE / SEASON 2 / CHAMPIONS».

El emblema usa el SVG `public/KPL/KPL.svg`, sin corona ni pelota. Los trazados
de K, P y L se unen **en dos dimensiones antes de extruirlos**. Así se conserva
el relleno del SVG y se eliminan los cortes falsos entre las letras.

## Archivos principales

- `kpl-trophy.blend`: original editable, materiales procedurales, textos,
  objetos identificados y estudio de fotografía; fuentes empaquetadas.
- `kpl-trophy-web.blend`: versión con geometría agrupada y texturas PBR horneadas.
- `web/kpl-trophy.glb`: modelo web con las texturas incorporadas.
- `web/kpl-trophy-studio.hdr`: entorno de estudio para los reflejos del metal.
- `kpl-trophy-hero.png`: imagen principal de 1600 × 2000 px.
- `kpl-trophy-transparent.png`: imagen de 1600 × 2000 px con canal alfa.
- `kpl-trophy-front.png`, `kpl-trophy-side.png`, `kpl-trophy-rear.png` y
  `kpl-trophy-detail.png`: fotografías adicionales de 1200 × 1500 px.
- `kpl-trophy-web-preview.png`: captura del GLB cargado realmente en WebGL.
- `print/`: STL, piezas de calibración e informe de comprobación.
- `reference/`: imagen de referencia y SVG empleado.

En el proyecto web los archivos se encuentran en `public/models/kpl/` y las
imágenes WebP de entrega en `public/images/kpl/`.

## Impresión 3D

Dimensiones ensambladas: **171,83 × 155,88 × 400 mm**. El eje Z es vertical y
la parte inferior está en Z = 0. Los STL contienen coordenadas en milímetros:
importarlos al **100 %**, seleccionando mm si el laminador pregunta la unidad.

| Archivo | Dimensiones aproximadas, mm | Uso |
| --- | --- | --- |
| `kpl-trophy-full-400mm.stl` | 171,83 × 155,88 × 400 | Trofeo completo |
| `01-base-with-key.stl` | 155,88 × 155,88 × 90 | Peana y espiga inferior |
| `02-body-with-key.stl` | 106,01 × 62,56 × 165 | Cuerpo y espiga superior |
| `03-crown-with-socket.stl` | 171,83 × 61,40 × 165 | Parte superior |
| `fit-test-male.stl` | 25 × 22 × 13 | Prueba de espiga |
| `fit-test-female.stl` | 25 × 22 × 13 | Prueba de alojamiento |

Las tres secciones están colocadas individualmente sobre Z = 0 para imprimir.
Para reconstruir su posición en un programa 3D, colocar la base en Z = 0,
el cuerpo en Z = 80 mm y la parte superior en Z = 235 mm. Las alturas se
solapan por las espigas; el conjunto terminado sigue midiendo 400 mm.

Las espigas rectangulares de 14 × 10 mm y 12 × 8 mm impiden el giro. Los
alojamientos añaden 0,25 mm de holgura por pared y 0,5 mm en profundidad.
Imprimir primero las dos piezas de prueba para comprobar el ajuste en la
impresora y el material elegidos; lijar o ajustar la tolerancia si hace falta.
Ensamblar y encolar después de comprobar el ajuste en seco.

Los salientes de las láminas y la placa necesitan soportes. Revisar la
previsualización de capas en el laminador antes de imprimir. El cuerpo de
las láminas parte de espesores de 4–5 mm, con aristas y puntas más finas.
Manipular las puntas con cuidado durante la retirada de soportes y el acabado.

El dorado, el negro y el cepillado son materiales digitales. Para conseguir
ese aspecto en una impresión hay que aplicar el acabado físico correspondiente.
Los STL no contienen colores ni texturas. No se incluye G-code porque depende
de la impresora, la boquilla, el material y el perfil de laminado.

Las mallas exportadas se han vuelto a abrir y comprobar: volúmenes cerrados,
normales coherentes y un único componente conectado por archivo. Las uniones
ensambladas no producen interferencias de volumen. **No se ha realizado una
impresión física**; el informe geométrico está en `print/validation.json`.

## Uso web

GLB estándar, sin descompresores adicionales, con siete mallas y siete
materiales. Las seis texturas de rugosidad y normales están incorporadas.
La geometría se expresa en metros, con Y vertical: altura 0,4 m; frente +Z.

El metal necesita un mapa de entorno para reflejar el estudio. Cargar
`kpl-trophy-studio.hdr` como entorno de iluminación, por ejemplo mediante
PMREM en Three.js. Puede mantenerse un fondo transparente o un fondo propio.
La captura `kpl-trophy-web-preview.png` muestra el modelo con ese entorno.

Usar `public/images/kpl/kpl-trophy-transparent.webp` como imagen de reserva
cuando no se active el visor 3D. El activo queda preparado para integrarlo;
no se ha modificado ninguna página de la web.

`glb-validation.json` contiene el resultado del validador Khronos y
`browser-validation.json` las dimensiones, las texturas y los recursos de
dibujo comprobados en Chromium / Three.js. Las cifras exactas de peso y
triángulos están en `web-export.json`.

## Reproducción y edición

La escena principal utiliza metros. Las inscripciones permanecen como texto
editable; el logotipo procede de contornos vectoriales y es una malla unida.
Los materiales de estudio conservan sus nodos de cepillado y microrrelieve.

Los scripts contienen las rutas del proyecto original. Para reconstruir la
geometría se ejecutan `01_model.py`, `02_studio.py`, `03_refine.py` y
`04_connections.py` en Blender. Los contornos SVG muestreados se guardan en
`logo-contours.json`; `10b_union_logo_2d.py` prepara la unión 2D y
`10c_apply_logo.py` la instala. Finalmente se aplican `11_depth_profile.py`
y `12_finalize.py`.

Para reexportar: `05_export_sources.py` extrae las mallas; `07_print.py` une,
corta y valida los STL; `06_web.py` hornea materiales y exporta el GLB;
`08_render_delivery.py` genera las fotografías. `09_web_environment.py`
crea el entorno HDR. Los scripts de geometría externos necesitan trimesh,
manifold3d, numpy, networkx, shapely y mapbox-earcut.

`10_logo_fix.py` conserva una iteración intermedia y no forma parte de la
reconstrucción final. El resultado correcto se genera mediante la unión 2D.
