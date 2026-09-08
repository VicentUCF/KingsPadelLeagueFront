---
# PLANTILLA — no es una noticia real. published: false la mantiene fuera de /noticias.
#
# Cómo usarla:
# 1. Duplica este archivo con un nombre nuevo (el nombre del archivo es la URL: /noticias/<nombre>).
# 2. Rellena todos los campos entre < >.
# 3. Pon la foto de portada en public/news/covers/ y referencia su ruta en cover.image.
# 4. Cuando esté lista, cambia published a true.
title: 'Resultados de la Jornada <número>: <titular breve, 90 caracteres máx.>'
subtitle: '<Entradilla de 1-2 frases sobre lo más destacado de la jornada, 200 caracteres máx.>'
category: partidos
publishedAt: 2026-01-01T20:00:00+02:00 # <- cambia esta fecha por la real
published: false
featured: false
relatedMatchdayId: jornada-<número>
relatedTeamSlugs:
  - <slug-equipo-1>
  - <slug-equipo-2>
cover:
  image: /news/covers/<archivo-de-la-foto>.jpg
  alt: '<Descripción objetiva de la foto, para lectores de pantalla>'
  credit: '<Foto: autor / fuente (licencia) — solo si la foto no es propia>'
---

La Jornada <número> <resumen del ambiente general: sorpresas, cruces ajustados, remontadas>.

## Resultados cruce a cruce

- **<Equipo A> <sets>–<sets> <Equipo B>** — <apunte breve: parcial ajustado, punto de oro decisivo>
- **<Equipo C> <sets>–<sets> <Equipo D>** — <apunte breve>
- **<Equipo E> <sets>–<sets> <Equipo F>** — <apunte breve>

<Si algún equipo ha descansado: "<Equipo> ha descansado esta jornada.">

<Párrafo opcional: una jugada, un punto de oro o un robo de saque que marcó la jornada.>

Consulta el marcador oficial y el resto de cruces en el [calendario](/calendario).
