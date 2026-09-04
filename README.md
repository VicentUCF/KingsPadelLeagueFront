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
npm test         # pruebas de dominio, temporada y noticias
npm run test:ssg # build aislada contra una API fixture; no modifica dist/
```

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
