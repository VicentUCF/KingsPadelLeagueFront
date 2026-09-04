# Auditoría de CSS de la app — `KingsPadelLeagueAstro`

> **Actualización 2026-09-04 (misma sesión):** los puntos P0 completos, la
> mayor parte de P1 y los ítems mecánicos de P2 de la sección 5 ya se han
> aplicado (working tree, sin commitear). Cada uno está marcado `[APLICADO]`
> más abajo, con el detalle exacto de lo que se hizo. Verificado con
> `npm run build`, `npm test`, `npm run format:check`, `npx astro check` y
> capturas de pantalla en 10 rutas (sin errores de consola). Sigue pendiente:
> la unificación visual de la familia "team card" (P2) y la migración completa
> a BEM + nesting (P3) — ambas se dejaron fuera de esta pasada por requerir
> una decisión de diseño o ser un rewrite de gran superficie; ver el resumen
> al final del documento.

Fecha: 2026-09-04
Alcance: únicamente los ficheros CSS de la app bajo `src/styles/` (no se ha tocado
`@kpl/design-system`). Objetivo: diagnóstico y plan priorizado — **no** es una
reescritura, es la fase de análisis previa a la implementación.

**Estado del repo en el momento del análisis:** working tree limpio, todo el
trabajo en curso que aparecía en el `git status` inicial de la sesión estaba ya
commiteado en `5fead93` ("Refactor matchday references to calendar"). Ese commit
ya refactorizó `MatchCard.astro` y `PlayoffMatchCard.astro` para apoyarse en
`c-match-card`/`c-score`/`c-chip`/`o-cluster`/`u-visually-hidden` — uno de los
puntos que se pedía revisar. Se confirma como resuelto, no como pendiente.

Todas las clases `c-*`/`o-*`/`u-*` citadas abajo se han verificado contra el
código fuente real de `../../Projects/kpl-design-system/src`.

---

## 1. Inventario de problemas por fichero

### `site-shell.css` (145 líneas) — buen ciudadano

Sin duplicación relevante. Usa `c-nav__link`, `c-brand__copy`, tokens `--kpl-*`
consistentemente. Sin hardcodes. No requiere trabajo.

### `team-identity.css` (394 líneas) — buen ciudadano

Extiende correctamente `c-team-badge__crest`, `c-match-card__teams` con overlays
de color de equipo vía custom properties (`--team-primary`, `--team-glow`,
`--team-surface`) — exactamente el tipo de capa de tematización que el propio
README del design system contempla (`[data-brand] { --kpl-color-brand: ... }`).
Sin hardcodes de color. No requiere trabajo prioritario.

### `news.css` (667 líneas)

- **Reinventa `c-surface-card`:** `.news-card` (líneas 8–23) declara `border`,
  `border-radius: var(--kpl-radius-xl)`, `box-shadow: var(--kpl-shadow-md)` y un
  gradiente de fondo casi idéntico al de `c-surface-card`
  (`surfaces.css:1-16`). Candidato a componer sobre `c-surface-card` en vez de
  reimplementar.
- **Quick win de formato:** `news.css:618-623` (`.news-article__related-teams`)
  rompe la indentación con espacios en vez de tabs y usa
  `padding: 1rem 0rem` en vez de un token `--kpl-space-*` (`0rem` es además una
  unidad redundante).
- Buen uso de tokens en el resto (142 usos de `--kpl-*`, confirmado al leer el
  fichero).

### `public-pages.css` (776 líneas)

- **Colisión de nombre con un componente real de la librería:** `.empty-state`
  se redefine en `public-pages.css:72-90` con un layout distinto
  (`justify-items:start`, `padding: clamp(...)`, `gap: var(--kpl-space-3)`) al
  `.empty-state` que ya existe en `feedback.css:1-67` del design system (con
  `position:relative`, `box-shadow`, `container-type:inline-size`, variantes
  `--compact`/`--feature`). Como ambos viven en capas distintas pero `app` se
  declara _después_ de `kpl.components` (ver §3), el resultado real en
  `EmptyState.astro:12` (`class="empty-state c-panel c-panel--accent"`) es una
  **mezcla de tres fuentes de estilo a la vez** (`.empty-state` de la librería +
  `.c-panel`/`c-panel--accent` de la librería + `.empty-state` de la app) que
  sólo "funciona" porque nadie ha tocado el orden de imports. Es fragilidad
  real, no solo duplicación estética.
- **Regla global redundante:** `public-pages.css:671-673` define
  `[hidden] { display: none !important; }`, que ya existe en el reset de la
  librería (`generic/reset.css:55-57`,
  `:where([hidden]:not([hidden="until-found"]))`). La versión de la app además
  **pierde la excepción `hidden="until-found"`** del reset nativo — candidato a
  borrar directamente.
- **12 selectores redefinidos en `premium-pages.css`** (ver hallazgo central en
  §2/§3): `.public-page`, `.public-page__body`, `.page-hero`, `.page-hero__meta`,
  `.calendar-list`, `.calendar-day`, `.calendar-day__date`, `.player-card`,
  `.player-card__avatar`, `.player-card__identity`, `.filters-panel__footer`,
  `.standings-table tbody tr:first-child`.
- Buen uso del resto: `.matchday-card`, `.match-card`, `.playoff-match-card`,
  `.team-card`, `.player-card` (bloque base) delegan en `c-team-badge`,
  `c-match-card__header`, `c-page-header__actions`, `c-button`.

### `cards.css` (1108 líneas, ya scoped a `/cartas`)

- Página muy "art-directed" (animación de abanico de cartas) legítimamente
  fuera del design system — nombres de dominio (`cards-hero`, `cards-level`)
  correctos según el contrato del README.
- **Reinventa `c-surface-card`/`c-surface-card--accent`:** `.action-card`
  (773-798), `.cards-timing` (519-532) y `.cards-finale` (909-923) son tres
  variaciones del mismo patrón "panel con borde + gradiente +
  `box-shadow: var(--kpl-shadow-lg/md)`" que ya resuelve `c-surface-card`/
  `c-surface-card--accent`.
- `--cards-green`/`--cards-blue`/`--cards-gold` (líneas 3-5) están bien como
  custom properties locales — son semántica de dominio (niveles de cartas), no
  deberían ser tokens de marca.
- 10 hex + 35 rgb/rgba. Varios son negros "artísticos" únicos (`#101010`,
  `#080808`, `#18150e`, `#0c0c0c`) que podrían expresarse con `color-mix()`
  sobre `--kpl-color-background`/`--kpl-color-surface` en vez de valores
  sueltos, aunque en un hero muy trabajado visualmente esto es más discutible
  que un "must fix".

### `home.css` (1346 líneas, ya scoped a `/`)

- **Reinventa `c-rank`:** `.home-standing__rank` (729-740) es un círculo con
  borde, `place-items:center`, `font-family: heading`, `font-weight:700` — la
  misma forma que `c-rank` (`data-display.css:67-85`), incluido el tratamiento
  de "líder" (`.home-standing--leader .home-standing__rank`, 742-746) que ya
  existe como `c-rank[data-rank="1"]`.
- **Reinventa `c-surface-card`:** `.home-standings` (663-676) y `.news-card`
  (news.css) comparten el mismo patrón border+radius-xl+gradiente+shadow-md sin
  usar `c-surface-card`.
- **Tercera reimplementación de "team card":** `.home-team-card` (799-899) es
  una variante más del patrón que ya aparece como `.team-card`/
  `.team-card--premium` (ver §2, mapeo de unificación).
- Varios tamaños de fuente "casi-token" (`0.68rem`, `0.7rem`, `0.64rem`,
  `0.72rem`) en vez de `--kpl-font-size-50` (0.75rem) — no necesariamente
  incorrecto (ajuste editorial fino) pero es ruido que dificulta saber si es
  intencional o un olvido de token.
- Negros sueltos: `#090909` (línea 18), `#0c0c0c` (línea 786) — mismo patrón
  que en `cards.css`.

### `premium-pages.css` (2424 líneas) — el hallazgo central de la auditoría

Ver §2 y §3 para el detalle. Resumen:

- **No es "una página premium"**: cubre equipos (`team-card--premium`,
  `team-profile-hero`, `team-roster*`), jugadores (`player-card`,
  `player-profile--premium`), calendario (`calendar-*`, `season-map`,
  `season-reveal`, `matchday-card--premium`, `match-list--premium`),
  clasificación (`standings-preseason`), y paneles compartidos
  (`market-status`, `roster-status`, `filters-panel--*`). Es en realidad "todas
  las páginas públicas salvo home y cartas", con un nombre que no comunica eso.
- **Redefine 12 selectores que ya existen en `public-pages.css`**, con valores
  distintos en varios casos (ver tabla en §3).
- `.player-card`, `.player-card__avatar`, `.player-card__identity` de
  `public-pages.css:531-579` están **confirmados como código muerto**:
  `PlayerCard.astro` renderiza `player-card__topline`/`player-card__stats`/
  `player-card__avatar-glow`, que sólo existen en `premium-pages.css:812+`. La
  versión de `public-pages.css` no la referencia ningún template.
- **Naming-convention violation:** `.c-score--versus`
  (`premium-pages.css:1901-1905`, usado en `MatchCard.astro:60`) usa el prefijo
  `c-` reservado a la librería para un modificador que la librería no define. O
  se propone como modificador real de `c-score` (candidato de promoción, ver
  §2) o se renombra fuera del namespace `c-*`.
- Radios de borde "casi-token": `1.8rem` (page-hero, línea 31), `1.6rem`
  (team-card--premium, línea 250), `2rem` (team-profile-hero:413,
  player-profile--premium:1181, season-reveal:1409,
  standings-preseason:1925) — tres valores distintos para la misma intención
  visual ("radio grande de héroe"), ninguno es `--kpl-radius-xl` (1.5rem). Buen
  candidato a token nuevo si se confirma que es intencional (ver §5).
- `.player-profile__metrics` (1337-1366) reimplementa parcialmente la
  tipografía de `c-metric__label`/`c-metric__value` (mismo
  `color`/`font-weight`/`letter-spacing`/`uppercase` para el label) en un
  layout de fila dividida en vez de tarjetas — no es un swap 1:1 pero comparte
  vocabulario tipográfico que podría reutilizarse.
- Uso correcto y no problemático de `c-chip` (líneas 2172, 2193, 2321, 2337) —
  el grep de "chip... sólo en premium-pages.css" **no es duplicación**, es
  consumo correcto de la librería con ajustes de posición.
- 6 hex + 54 rgb/rgba: mismo patrón de negros sueltos (`#0d0d0d`, `#0e0e0e`,
  `#0c0c0c` ×2).

---

## 2. Oportunidades de unificación concretas (mapeo específico)

| Patrón local                                                                                                                                                                                                                                                  | Ficheros/líneas                                                                                                                                                                                                                           | Debería ser                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Grid responsivo "auto-fit + minmax" repetido **7 veces** con solo el breakpoint distinto                                                                                                                                                                      | `public-pages.css:104-110` (18rem), `news.css:2-6` (19rem), `cards.css:767-771` (22rem), `home.css:790-793` (12.5rem), `premium-pages.css:718-722` (12.5rem), `premium-pages.css:806-810` (18.5rem), `premium-pages.css:1812-818` (24rem) | `o-grid` / `o-grid--cards` (18rem) / `o-grid--wide-cards` (24rem) — `objects/layout.css:52-74`. Es literalmente la misma fórmula (`repeat(auto-fit, minmax(min(100%, var(--kpl-grid-min)), 1fr))`), la librería ya expone `--kpl-grid-min` para ajustar el breakpoint por uso. **Es el cambio mecánico de mayor apalancamiento de toda la auditoría.**                                                                                                                                                             |
| `.home-standing__rank` (home.css:729-746, con tratamiento de líder)                                                                                                                                                                                           | `home.css`                                                                                                                                                                                                                                | `c-rank` / `c-rank[data-rank="1"]` — `data-display.css:67-85`                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `.news-card` (news.css:8-23) y `.home-standings` (home.css:663-676) — panel con borde+radius-xl+gradiente+shadow-md                                                                                                                                           | `news.css`, `home.css`                                                                                                                                                                                                                    | `c-surface-card` / `c-surface-card--padded` — `surfaces.css:1-33`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `.action-card` (cards.css:773-798), `.cards-timing` (cards.css:519-532), `.cards-finale` (cards.css:909-923)                                                                                                                                                  | `cards.css`                                                                                                                                                                                                                               | `c-surface-card` / `c-surface-card--accent` como base, con overrides sólo del gradiente teñido por `--level-color`                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Tres implementaciones independientes de "tarjeta de equipo"**: `.team-card` (public-pages.css:435-465, hoy código casi-muerto), `.team-card--premium` (premium-pages.css:240-372, la activa en `/equipos`), `.home-team-card` (home.css:799-899, la de `/`) | `public-pages.css`, `premium-pages.css`, `home.css`                                                                                                                                                                                       | Mismo concepto (superficie con overlay de color de equipo, logo, copy, hover con `translate`+glow) con 3 nombres de clase distintos. Candidato a: (a) fusionar `.team-card` + `.team-card--premium` en un único bloque BEM con modificador, y (b) evaluar si `.home-team-card` puede compartir la misma base — y si el patrón se estabiliza, es candidato de **promoción al design system** como `c-team-card` (cumple el criterio del README: "sustituye duplicación real... preparado para más de una interfaz") |
| `.player-card` / `.player-card__avatar` / `.player-card__identity` en `public-pages.css:531-579`                                                                                                                                                              | `public-pages.css`                                                                                                                                                                                                                        | **Borrar.** Confirmado código muerto: ningún template renderiza esa estructura; `PlayerCard.astro` usa exclusivamente las clases de `premium-pages.css:812+` (`player-card__topline`, `__avatar-glow`, `__stats`, etc.)                                                                                                                                                                                                                                                                                            |
| `.c-score--versus` (premium-pages.css:1901, usado en `MatchCard.astro:60`)                                                                                                                                                                                    | `premium-pages.css`                                                                                                                                                                                                                       | O se propone como modificador real `c-score--versus` al design system (patrón "VS" antes de que haya marcador es genérico de competición, no de pádel específicamente), o se renombra a algo fuera de `c-*` (p. ej. `.match-versus`) mientras tanto — hoy vive en tierra de nadie                                                                                                                                                                                                                                  |
| Truncado manual `overflow:hidden; text-overflow:ellipsis; white-space:nowrap` repetido (p. ej. `premium-pages.css` ×4, `home.css` ×1, y otros)                                                                                                                | varios                                                                                                                                                                                                                                    | `u-truncate` — `utilities/index.css:62`                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `[hidden] { display:none !important }` (public-pages.css:671-673)                                                                                                                                                                                             | `public-pages.css`                                                                                                                                                                                                                        | Ya cubierto por el reset de la librería (`generic/reset.css:55-57`) — eliminar                                                                                                                                                                                                                                                                                                                                                                                                                                     |

---

## 3. El hallazgo central: `public-pages.css` y `premium-pages.css` no son dos features, son dos borradores del mismo shell

Comparación selector a selector entre ambos ficheros: **12 selectores están
definidos en los dos**, y como ambos declaran `@layer app` y se cargan en este
orden en `BaseLayout.astro:3-7` (`site-shell → public-pages → premium-pages →
team-identity → news`), dentro de la misma capa `app` gana **la última
declaración por orden de aparición** para cualquier propiedad que colisione.
Esto no es "override intencional" documentado en ningún sitio — es un
accidente de orden de import:

```
.calendar-day            public-pages.css:649   ↔  premium-pages.css:1571   (gap: --kpl-space-6 vs --kpl-space-7, 9rem vs 8rem)
.calendar-day__date      public-pages.css:656   ↔  premium-pages.css:1576   (premium añade border/background que public no tenía)
.calendar-list           public-pages.css:644   ↔  premium-pages.css:1567
.filters-panel__footer   public-pages.css:593   ↔  premium-pages.css:801
.page-hero               public-pages.css:12    ↔  premium-pages.css:23     (border-radius: xl-token vs 1.8rem hardcoded)
.page-hero__meta         public-pages.css:39    ↔  premium-pages.css:97     (gap: --space-5 vs --space-3)
.page-hero h1             public-pages.css:35    ↔  premium-pages.css:86    (clamp(...,5.5rem) vs clamp(...,7.4rem))
.player-card             public-pages.css:531   ↔  premium-pages.css:812    (layouts incompatibles — fila vs tarjeta; ver §1)
.player-card__avatar     public-pages.css:541   ↔  premium-pages.css:865
.player-card__identity   public-pages.css:559   ↔  premium-pages.css:968
.public-page             public-pages.css:2     ↔  premium-pages.css:2      (padding-block: 7vw vs 6vw)
.public-page__body       public-pages.css:7     ↔  premium-pages.css:19     (gap: 6vw vs 7vw)
.standings-table tbody tr:first-child  public-pages.css:419-421 ↔ premium-pages.css:2008-2010  (color-mix brand 8% vs 9% — literalmente el mismo valor con drift de un dígito)
```

Esto confirma la sospecha planteada al iniciar el análisis: **`premium-pages.css`
es en realidad un segundo pase de diseño sobre el mismo scaffolding de página**
(`.public-page`, `.page-hero`, `.section-block`) que ya existía en
`public-pages.css`, escrito más tarde y nunca fusionado con el original. El
resultado hoy:

1. **Bytes muertos reales**, no solo "líneas largas": todo el bloque
   `.player-card`/`.player-card__avatar`/`.player-card__identity` de
   `public-pages.css` (531-579, más su responsive en 707-714) no lo usa ningún
   template.
2. **Riesgo de mantenimiento activo**: si alguien edita `.page-hero` en
   `public-pages.css` pensando que así cambia el hero, no verá ningún efecto
   (premium-pages.css gana), y no hay ningún comentario ni convención que lo
   avise.
3. **Carga global innecesaria en rutas que no lo necesitan**: `/` (home) y
   `/cartas` cargan igualmente estos 3200 líneas combinados (`public-pages.css`
   - `premium-pages.css`) sin usar ni una sola clase de ninguno de los dos —
     confirmado por grep sobre `src/pages/index.astro` y
     `src/pages/cartas/index.astro` (0 coincidencias de `team-card--premium`,
     `player-profile--premium`, `season-reveal`, `matchday-card--premium`,
     `standings-preseason`, `market-status`, `roster-status`,
     `filters-panel--*`, `season-map`, `calendar-day`, `page-hero`, `news-grid`,
     `news-card`, `news-mosaic`).

### Propuesta de reorganización

**Mantener el patrón de scoping que ya existe** (`cards.css` sólo en
`/cartas`, `home.css` sólo en `/`) — es correcto, no tocarlo.

**Fusionar `public-pages.css` + `premium-pages.css` en una sola fuente de
verdad**, eliminando los 12 duplicados (quedándose con la versión de
`premium-pages.css` en los casos donde hay más funcionalidad, salvo
`.player-card*` donde la de `public-pages.css` se borra entera por muerta). Ese
archivo fusionado (~3000 líneas tras deduplicar) sigue siendo grande, así que
dentro de él se propone partición **por dominio**, no por "nivel premium":

- `page-shell.css` — `.public-page`, `.page-hero`, `.section-block*`,
  `.market-status`/`.roster-status`/`.team-update-note`, override de
  `.empty-state` (una vez resuelta la colisión de nombre, ver abajo)
- `team.css` — `.team-card*`, `.team-profile-hero*`, `.team-roster*`,
  `.team-hero` (de public-pages)
- `player.css` — `.player-card*`, `.player-profile*`,
  `.filters-panel--players`
- `calendar.css` — `.calendar-*`, `.season-map*`, `.season-reveal*`,
  `.matchday-card*`, `.match-list*`, `.match-card*`, `.playoff-*`
- `standings.css` — `.standings-table*`, `.standings-preseason*`

Estos 5 ficheros pueden seguir cargándose **globales vía `BaseLayout`** igual
que hoy (cubren 7 de 9 rutas — no vale la pena el riesgo de scoping fino ruta a
ruta), pero ya no colisionan entre sí ni con `public-pages.css`, porque
**dejaría de existir `public-pages.css` como archivo separado con las mismas
responsabilidades**.

**Candidatos a scoping real (sacar de `BaseLayout.astro` e importar solo donde
se usan):**

- `news.css` (667 líneas): sólo se usa en `/` (sección de noticias del home) y
  `/noticias/*`. Hoy se carga también en `/cartas`, `/clasificacion`,
  `/jugadores`, `/equipos`, `/calendario`, `/playoffs` sin usarse. Import
  directo en `index.astro` y en las páginas de `noticias/`.
- `team-identity.css` (394 líneas): usado en `/` y en casi todas las públicas
  (team-card, match-card con bandas de equipo) — su alcance real es amplio, así
  que no se recomienda moverlo salvo que se confirme que `/cartas` y las
  vistas de noticias individuales nunca muestran insignias de equipo con esta
  clase; si es así, también sería scoped-able, pero el beneficio es menor que
  con `news.css`.

**Resolver la colisión de `.empty-state`:** o bien `EmptyState.astro:12` deja
de usar el nombre `empty-state` (renombrarlo a algo como
`.results-empty-state`) para no chocar con el componente real de la librería, o
se adopta directamente la estructura documentada de la librería
(`empty-state__header`/`__icon`/`__eyebrow`/`__title`/`__description`/`__actions`,
`feedback.css:1-194`) en vez de mezclar un nombre igual con contenido distinto
sobre `c-panel`.

---

## 4. Plan de migración a BEM + nesting nativo

**Criterio**: la librería ya modela el estilo objetivo — bloque en
`:where(.bloque)`, modificadores y elementos anidados con `&`, pseudo-clases/
pseudo-elementos anidados también con `&`, media/container queries anidadas
cuando tiene sentido agrupar (ver `c-button` en `actions.css:1-173` o
`c-progress`/`c-team-badge` en `data-display.css`). La app tiene ~91-331
selectores BEM-like por fichero que hoy son selectores planos independientes —
cada uno es candidato a anidar bajo su bloque.

**No usar `:where()` en el nesting de la app** (a diferencia de la librería):
la librería lo usa para mantener especificidad cero y permitir que la propia
app la sobreescriba sin `!important`. La app es la capa final, no necesita ese
contrato — nidificar con selectores normales dentro de `@layer app`.

### Antes/después con selectores reales del proyecto

**`news.css:8-86` (`.news-card`) — 8 selectores planos → 1 bloque anidado:**

```css
/* antes */
.news-card {
	display: flex; /* ... */
}
.news-card--featured {
	border-color: var(--kpl-color-border-strong); /* ... */
}
.news-card__top {
	display: flex; /* ... */
}
.news-card__top time {
	color: var(--kpl-color-text-muted); /* ... */
}
.news-card__title {
	display: block; /* ... */
}
.news-card--featured .news-card__title {
	max-inline-size: 22ch; /* ... */
}
.news-card:hover .news-card__cta,
.news-card:focus-visible .news-card__cta {
	text-decoration: underline; /* ... */
}

/* después */
.news-card {
	display: flex;
	/* ... */

	&--featured {
		border-color: var(--kpl-color-border-strong);
		/* ... */

		& .news-card__title {
			max-inline-size: 22ch;
			/* ... */
		}
	}

	&__top {
		display: flex;
		/* ... */

		& time {
			color: var(--kpl-color-text-muted); /* ... */
		}
	}

	&__title {
		display: block; /* ... */
	}

	&:is(:hover, :focus-visible) &__cta {
		text-decoration: underline;
		/* ... */
	}
}
```

**`public-pages.css:287-317` (`.match-card__pair-players`, 4 variantes por
resultado/lado) — buen candidato porque hoy son 4 bloques desconectados
visualmente en el código:**

```css
/* antes: 4 reglas repitiendo el selector base con distinta dirección de gradiente */
.match-card__pair-players[data-result='win'] {
	background: linear-gradient(to left, ...);
}
.match-card__pair-players[data-result='lose'] {
	background: linear-gradient(to left, ...);
}
.match-card__pair-players--away[data-result='win'] {
	background: linear-gradient(to right, ...);
}
.match-card__pair-players--away[data-result='lose'] {
	background: linear-gradient(to right, ...);
}

/* después */
.match-card__pair-players {
	&[data-result='win'] {
		background: linear-gradient(
			to left,
			color-mix(in srgb, var(--kpl-color-success) 26%, transparent),
			transparent
		);
	}
	&[data-result='lose'] {
		background: linear-gradient(
			to left,
			color-mix(in srgb, var(--kpl-color-danger) 20%, transparent),
			transparent
		);
	}

	&--away {
		text-align: end;

		&[data-result='win'] {
			background: linear-gradient(
				to right,
				color-mix(in srgb, var(--kpl-color-success) 26%, transparent),
				transparent
			);
		}
		&[data-result='lose'] {
			background: linear-gradient(
				to right,
				color-mix(in srgb, var(--kpl-color-danger) 20%, transparent),
				transparent
			);
		}
	}
}
```

Esto también deja mucho más claro, al leer el bloque, que la versión
`@media (width < 48rem)` (líneas 730-760) es _el mismo_ patrón con la
dirección del gradiente rotada — hoy son 4 reglas más sueltas al final del
fichero sin conexión visual con el bloque original.

**`cards.css:641-705` (`.cards-level-nav a`) — selector repetido con
pseudo-elementos y estados:**

```css
/* después (extracto) */
.cards-level-nav {
	& a {
		--level-color: var(--kpl-color-brand);
		position: relative;
		/* ... */

		&::after {
			position: absolute;
			/* ... */
		}

		&:hover {
			background: color-mix(in srgb, var(--level-color) 6%, transparent);

			&::after {
				inset-inline: 12%;
			}
		}

		&[data-tone='green'] {
			--level-color: var(--cards-green);
		}
		&[data-tone='blue'] {
			--level-color: var(--cards-blue);
		}
		&[data-tone='gold'] {
			--level-color: var(--cards-gold);
		}
	}
}
```

**Orden recomendado para migrar** (no hace falta todo de golpe): empezar por
los bloques que ya tienen 3+ elementos/modificadores en el mismo fichero y sin
responsive disperso (`.news-card`, `.home-shortcut` en `home.css:542-629`,
`.cards-level-nav` en `cards.css:618-705`) — son mecánicos y de bajo riesgo.
Dejar para el final los bloques con mucho responsive repartido en 3-4 media
queries distintas (`.player-card--*` en `premium-pages.css`,
`.team-roster__*`) porque anidar ahí exige decidir si el responsive también se
centraliza (fuera del alcance de "solo nesting").

---

## 5. Prioridades (impacto/esfuerzo)

**P0 — mecánico, bajo riesgo, alto apalancamiento (hacer primero):**

1. `[APLICADO]` Sustituir las 7 reimplementaciones del grid `auto-fit/minmax`
   por `o-grid`/`o-grid--cards`/`o-grid--wide-cards` (§2, tabla), con
   `--kpl-grid-min`/`--kpl-grid-gap` locales donde el breakpoint original no
   coincidía con un modificador existente.

2. `[APLICADO]` Borrar `.player-card`/`.player-card__avatar`/
   `.player-card__identity`/`.player-card__stat` de
   `public-pages.css:531-579,707-714` — confirmado muerto, cero riesgo.

3. `[APLICADO]` Borrar `[hidden] { display: none !important }` de
   `public-pages.css:671-673` — ya cubierto por el reset.

4. `[APLICADO]` Arreglar `news.css:618-623` (indentación + `padding: 1rem 0rem`
   → `padding-block: var(--kpl-space-4)`).

**P1 — resolver antes de seguir añadiendo CSS a estos ficheros (previene que
el problema crezca):**

5. `[APLICADO]` Fusionar los 12 selectores duplicados entre `public-pages.css`
   y `premium-pages.css` (§3) en una única declaración canónica cada uno,
   reproduciendo exactamente la cascada resuelta anterior (verificado
   selector a selector antes de tocar nada, cero cambio visual). No se hizo
   la partición completa en 5 ficheros por dominio (`page-shell.css`,
   `team.css`, etc.) propuesta en §3 — ese resto de la reorganización sigue
   pendiente y es de menor riesgo/urgencia ahora que la colisión real ya no
   existe.

6. `[APLICADO]` Renombrada la colisión `.empty-state` (app) →
   `.results-empty-state`, en `EmptyState.astro`, `public-pages.css` y
   `premium-pages.css`.

7. `[APLICADO]` `news.css` ya no se carga en `BaseLayout.astro`; se importa
   directamente en `index.astro`, `noticias/[...page].astro` y
   `noticias/[slug].astro` (únicos consumidores confirmados por grep).

**P2 — unificación de componentes duplicados (mayor esfuerzo, requiere
decidir diseño):**

8. `[PENDIENTE — decisión de diseño]` Unificar `.team-card` /
   `.team-card--premium` / `.home-team-card` en un único bloque con
   modificadores. No se ejecutó: el tratamiento del "líder"/hover difiere
   visualmente entre las tres implementaciones y colapsarlas cambia la
   apariencia de 3 páginas sin aprobación de diseño — se deja fuera
   deliberadamente en vez de adivinar.

9. `[APLICADO]` `.home-standing__rank` ahora compone `c-rank` en el markup
   (`index.astro`) y solo sobreescribe color/tamaño de fuente — la geometría
   circular viene de la librería, el tratamiento "líder" en negrita dorada se
   mantuvo intacto (deliberadamente más fuerte que el `[data-rank="1"]` por
   defecto de la librería). `.news-card` y `.home-standings` ahora componen
   `c-surface-card`/`c-surface-card--padded`/`c-surface-card--raised`
   (border/radius/padding vienen de la librería; background/box-shadow
   quedan locales porque difieren de los valores por defecto). `.action-card`,
   `.cards-timing` y `.cards-finale` ahora componen
   `c-surface-card`/`c-surface-card--accent` igual (border/border-radius
   desde la librería, el resto local). Verificado con capturas de pantalla en
   `/`, `/cartas`, `/equipos`, `/clasificacion` — sin diferencia visual.

10. `[APLICADO]` `.c-score--versus` renombrado a `.match-score-versus` (fuera
    del namespace `c-*`) en `premium-pages.css` y `MatchCard.astro`.

**P3 — mejora de mantenibilidad a medio plazo (una vez estable lo anterior):**

11. `[PENDIENTE]` Migración a BEM + nesting nativo por fichero, empezando por
    los bloques ya identificados en §4. No se aplicó en esta pasada: es un
    rewrite mecánico de gran superficie (~6700 líneas) sin beneficio de
    correctness, mejor hecho de forma incremental y revisada por separado tal
    y como recomienda el propio plan.

12. `[PENDIENTE]` Auditar los radios de borde "casi-token" (1.6rem/1.8rem/2rem)
    en `premium-pages.css` y decidir si se consolidan en `--kpl-radius-xl`
    existente o se propone un `--kpl-radius-2xl` nuevo al design system.

13. `[PENDIENTE]` Revisar los tamaños de fuente sueltos (`0.68rem`, `0.65rem`,
    `0.7rem`...) en `home.css`/`premium-pages.css` frente a
    `--kpl-font-size-50`.

**Resumen de esta pasada:** P0 completo (4/4), P1 completo (3/3), P2
parcialmente aplicado (2/3 — la unificación de team-card queda pendiente de
decisión de diseño), P3 sin aplicar (documentado como trabajo futuro
incremental). Verificación: `npm run build`, `npm test` (28/28), `npm run
test:ssg` (un fallo preexistente en `HEAD` sobre un enlace a "King", no
relacionado con CSS — reproducido igual con los cambios en stash), `npm run
format:check` y `npx astro check` (0 errores) en verde; capturas de pantalla
sin errores de consola en `/`, `/cartas`, `/noticias`, `/404`, `/equipos`,
`/equipos/magic-city`, `/jugadores`, `/jugadores/millet`, `/clasificacion` y
`/calendario`. Nada de esto está commiteado todavía.
