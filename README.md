# Kings Padel League Web

Nuevo cliente web público de Kings Padel League, construido con Astro. El backoffice no forma parte de este proyecto.

## Requisitos

- Node.js 22.12 o superior
- npm 10 o superior

No hace falta ningún checkout local adicional: `@kpl/design-system` se instala directamente desde
[su repositorio en GitHub](https://github.com/VicentUCF/KPL-Design-System) (ver
[Sistema de diseño](#sistema-de-diseño)), así que `npm install` es suficiente en cualquier máquina
o entorno de CI/despliegue.

## Desarrollo

```sh
npm install
cp .env.example .env
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`.

## Comandos

```sh
npm run dev      # servidor de desarrollo
npm run dev:fixture # desarrollo con datos simulados, sin depender de la API remota
npm run build    # build de producción
npm run preview  # previsualización del build
npm run check    # validación estricta de Astro y TypeScript
npm run format   # formato automático del código
npm run lint     # ESLint (.ts, .astro)
npm test         # pruebas de dominio, temporada y noticias (Vitest)
npm run test:ssg # build aislada contra una API fixture; no modifica dist/
npm run test:e2e # smoke tests de Playwright contra dev:fixture
npm run quality  # gate completo: format, lint, typecheck, knip, arquitectura, tests, build, security
```

Pipeline de calidad completo (hooks de git, CI, Sonar, cobertura, arquitectura): ver
[`docs/quality.md`](docs/quality.md).

## Generación del sitio público

Todas las rutas públicas se prerenderizan por completo durante cada build. La variable privada
`KPL_API_BASE_URL` indica el backend desde el que se consultan temporadas, jornadas, equipos,
jugadores, partidos, alineaciones, puntuaciones oficiales y playoffs:

```sh
KPL_API_BASE_URL=https://kings-league-api.esteveep.dev npm run build
```

El despliegue también debe definir `KPL_SITE_URL` con el dominio público final, sin rutas. Esta
URL alimenta las etiquetas canonical, el sitemap, las vistas previas sociales y los datos
estructurados:

```sh
KPL_SITE_URL=https://kingspadelleague.com KPL_API_BASE_URL=https://kings-league-api.esteveep.dev npm run build
```

Los playoffs permanecen ocultos mientras sus endpoints públicos requieran autenticación. Para
probarlos expresamente cuando el backend esté preparado:

```sh
KPL_PLAYOFFS_ENABLED=true npm run dev
```

Si la variable no existe, la API no responde o devuelve datos inconsistentes, la build falla. El
despliegue debe publicar únicamente builds correctas para mantener online la última versión válida.
El navegador recibe los datos ya renderizados; únicamente los filtros de jugadores y calendario
usan JavaScript local y no realizan peticiones posteriores.

Rutas incluidas:

- `/`, `/clasificacion`, `/jornadas` y `/jornadas/:matchdayId`
- `/playoffs`
- `/equipos` y `/equipos/:slug`
- `/jugadores` y `/jugadores/:slug`
- `/calendario` y la página `404`
- `/noticias` (portada editorial con lead, secundarias y breves) y `/noticias/:slug`

Las rutas de autenticación, perfil y backoffice quedan fuera de este cliente público: este
proyecto se despliega en el dominio raíz y el panel de jugadores/presidentes vive aparte, en un
subdominio propio. La única integración con ese panel es un enlace de salida en el header,
controlado por la variable `KPL_PORTAL_URL` (URL completa del subdominio). Mientras no se defina,
el sitio no muestra ninguna referencia al login.

La build genera `/sitemap.xml` y `/robots.txt`. Las fichas de jornada sin cruces confirmados se
mantienen accesibles, pero no se indexan ni se incluyen en el sitemap hasta disponer de contenido
útil para jugadores y seguidores.

Las noticias se editan como Markdown en `src/content/news`. No hay backoffice ni API de
publicación: "publicar" es crear o editar un archivo y desplegar el build. Solo las entradas que
no sean borradores y cuya fecha no sea futura generan una URL real (`src/lib/news.ts`); marcar una
entrada con `featured: true` la promociona a la portada, ordenada opcionalmente por
`homePriority`.

## Gestión de noticias (TinaCMS)

Para que alguien sin conocimientos técnicos pueda crear y publicar noticias sin tocar
Markdown/YAML/git, las noticias se editan en `/admin` con [TinaCMS](https://tina.io/) a partir de
`tina/config.ts` (raíz del repo). No es un backend nuevo: TinaCloud solo hace commits de Markdown
a este mismo repo de GitHub — sigue siendo "publicar = crear/editar un archivo y desplegar el
build". El sitio público sigue siendo 100% estático (`output: 'static'`); el adapter de Vercel
(`astro.config.mjs`) solo sirve bajo demanda dos rutas puntuales para la edición visual (ver
abajo), no convierte el resto del sitio en SSR.

Guía paso a paso para quien redacta noticias (sin jerga técnica):
[`docs/guia-editorial-noticias.md`](docs/guia-editorial-noticias.md). Lo que sigue aquí es la
referencia técnica de cómo está montada la integración.

- **Dónde están los archivos**: cada noticia es un fichero Markdown en `src/content/news/`
  (Astro Content Collections, `src/content.config.ts`), la misma fuente que consumen
  `src/pages/noticias/[...page].astro` y `src/pages/noticias/[slug].astro`. Tina edita esos mismos
  archivos — no introduce una fuente de datos paralela.
- **Dónde están las imágenes**: la imagen principal (`cover.image`) se sube a
  `public/news/covers/` y se referencia como `/news/covers/<archivo>` (`media.tina` en
  `tina/config.ts`).
- **Qué hace `published`**: `published: true` hace visible la noticia en `/noticias` y genera su
  página de detalle; `published: false` la deja como borrador, sin listado ni URL pública
  (`selectPublishedNews` en `src/lib/news.ts` es la única puerta de esta regla).
- **Previsualizar un borrador**: el botón "Ver en directo" del admin abre
  `/noticias/preview/<slug>/<token>` (`src/pages/noticias/preview/[slug]/[token].astro`, bajo
  demanda), que renderiza la noticia real con el mismo componente que la página pública
  (`NewsArticleContent.astro`) sin pasar por `selectPublishedNews`. El token va como segmento de
  ruta y no como `?token=`: el iframe de previsualización que el propio admin de Tina abre desde su
  listado de documentos construye su `src` a partir de la ruta que devuelve `ui.router`
  descartando la query string, así que con `?token=` la vista previa dentro del admin siempre se
  veía como "no disponible" (el enlace "Ver en directo" copiado fuera del admin sí cargaba, porque
  ahí el navegador conserva la URL completa). El token (`TINA_PUBLIC_PREVIEW_SECRET`) evita que la
  URL sea adivinable o indexable — no es una autenticación real, es una capa adicional a
  `Disallow: /noticias/preview/` en `robots.txt`.
- **Edición visual**: el detalle de una noticia (`src/pages/noticias/[slug].astro`) usa
  `NewsArticleContent.astro`, envuelto en `<TinaIsland>` y con `tinaField()` en título, imagen y
  cuerpo. Al abrir esa página dentro del editor de `/admin`, el bridge de Tina refresca esa región
  en vivo contra `src/pages/tina-island/[name].ts` (la única ruta realmente dinámica del sitio);
  fuera del editor, esos marcadores son inertes y el HTML público no cambia.
- **`subtitle`**: la entradilla/bajada corta de la noticia. Se muestra en las tarjetas del listado
  y en la cabecera del detalle, y también se usa como `description` para SEO y redes (Open Graph).
- **`socialTitle`, `socialSubtitle` y `socialTemplate`**: campos opcionales, todavía sin uso en el
  frontend. Preparan el modelo de datos para una fase futura de generación automática de piezas
  para Instagram a partir de la misma noticia — de momento solo se guardan.

Configuración fuera de este repo, en [app.tina.io](https://app.tina.io/): crear un proyecto
TinaCloud conectado a `VicentUCF/KingsPadelLeagueFront`, y copiar su Client ID/token a las
variables de entorno `TINA_CLIENT_ID`/`TINA_TOKEN` (ver `.env.example`) tanto en local como en
Vercel. `npm run dev` (`tinacms dev -c "astro dev"`) y `npm run build`
(`tinacms build -c "astro build"`) generan `tina/__generated__/` y `public/admin/` — no se
versionan (`.gitignore`).

## Arquitectura de `src/lib`

La integración está separada por responsabilidad para que los cambios de contrato no se mezclen
con las reglas de presentación:

- `api/`: tipos HTTP, validación de respuestas, cliente de red y repositorio de la liga.
- `domain/`: participantes, fase regular, playoffs, clasificación, validación relacional y modelo
  público.
- `kpl-api.ts` y `public-league.ts`: fachadas estables para las páginas y los tests existentes.

Los módulos se extrajeron aplicando refactorizaciones pequeñas y verificables —Extract/Move Method
y Extract Class/Module— sin modificar el comportamiento público.

## Sistema de diseño

La dependencia `@kpl/design-system` apunta al commit fijado de
[`VicentUCF/KPL-Design-System`](https://github.com/VicentUCF/KPL-Design-System) en `package.json`
(`git+https://github.com/VicentUCF/KPL-Design-System.git#<sha>`). El repositorio es público, así
que `npm install` lo clona por HTTPS sin credenciales y ejecuta su propio `prepare` (`npm run
build`) para generar `dist/` antes de enlazarlo aquí — no depende de ninguna ruta local ni de
acceso SSH, por lo que funciona igual en CI o en cualquier plataforma de despliegue.

El layout base importa la entrada CSS recomendada:

```js
import '@kpl/design-system/css';
```

Para consumir una versión más reciente de la librería, actualiza el hash del commit en
`package.json` y ejecuta `npm install`. Para desarrollar ambos repositorios a la vez (cambios en
la librería reflejados al instante en este proyecto), sustituye temporalmente la dependencia por
un `file:` local (por ejemplo `file:../kpl-design-system`) o usa `npm link`; revierte a la
referencia de GitHub antes de hacer commit.

La composición específica de las páginas vive en `src/styles`; colores, tipografía, espaciado,
contenedores, botones, chips, tablas, métricas y superficies proceden del sistema de diseño.
