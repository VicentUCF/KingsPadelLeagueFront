# Calidad y validación automática

Pipeline de calidad del proyecto: qué corre en local, en cada hook de git y en CI, y cómo
extenderlo.

## Scripts

| Comando                 | Qué hace                                                             |
| ----------------------- | -------------------------------------------------------------------- |
| `npm run format`        | Formatea todo el repo con Prettier (incluye `.astro` vía el plugin). |
| `npm run format:check`  | Comprueba formato sin escribir cambios (usado en CI).                |
| `npm run lint`          | ESLint sobre todo el repo (`.ts`, `.astro`, config).                 |
| `npm run lint:fix`      | Igual que `lint`, aplicando fixes automáticos.                       |
| `npm run lint:css`      | Stylelint sobre `src/**/*.css`.                                      |
| `npm run lint:css:fix`  | Igual que `lint:css`, aplicando fixes automáticos.                   |
| `npm run typecheck`     | `astro check` — tipos de Astro + TypeScript en modo estricto.        |
| `npm run check`         | Alias histórico de `typecheck` (se mantiene por compatibilidad).     |
| `npm run test`          | Vitest en modo watch.                                                |
| `npm run test:run`      | Vitest, una sola pasada (usado en CI/pre-push).                      |
| `npm run test:coverage` | Vitest con cobertura (`src/lib/**`), aplica los thresholds mínimos.  |
| `npm run test:ssg`      | Build real de Astro contra una API fixture; no toca `dist/`.         |
| `npm run test:e2e`      | Playwright contra `dev:fixture` (smoke tests).                       |
| `npm run knip`          | Detecta archivos, exports y dependencias sin usar.                   |
| `npm run architecture`  | dependency-cruiser: ciclos, huérfanos, capas `api`/`domain`.         |
| `npm run security`      | `npm audit --audit-level=high` (bloquea solo high/critical).         |
| `npm run quality`       | Encadena todo lo anterior (menos Sonar y E2E) — el gate local/CI.    |

## Qué corre dónde

```
pre-commit (Husky + lint-staged)
  → eslint --fix y prettier --write, solo sobre los archivos staged

pre-push (Husky)
  → typecheck (astro check)
  → test:run (Vitest, una pasada)

CI (.github/workflows/ci.yml)
  → static-checks: format:check, lint, lint:css, typecheck, knip, architecture
  → unit-tests: test:coverage (sube el reporte como artifact)
  → build-check: test:ssg (build real contra la API fixture — ver nota abajo)
  → e2e: Playwright contra dev:fixture
  → security: npm audit
  → sonar: solo si existe SONAR_PROJECT_KEY (ver más abajo)
  → quality-gate: falla si cualquiera de los jobs anteriores falla
```

Pre-commit es intencionalmente mínimo: solo toca los archivos que vas a commitear, para que
nunca sea una razón real para usar `--no-verify`. La autoridad real es CI — los hooks locales
se pueden saltar y no hay que depender de ellos para garantizar calidad.

### Por qué `build-check` usa `test:ssg` y no `astro build`

`astro build` necesita `KPL_API_BASE_URL` apuntando al backend real de KPL (ver README). CI no
tiene esas credenciales, así que `build-check` usa `test:ssg`, que ya existía en el repo: levanta
`tests/fixtures/kpl-api-server.mjs` y construye el sitio contra esos datos deterministas. Es la
validación de build realista disponible sin secretos de despliegue.

## Knip

`knip.json` añade `tests/fixtures/kpl-api-server.mjs` como entry point explícito: ese archivo se
lanza como subproceso (`spawn(..., ['tests/fixtures/kpl-api-server.mjs'])`) desde
`tests/dev-with-fixture.mjs` y `tests/ssg-build.mjs`, no mediante un `import` estático, así que
Knip no puede verlo por análisis estático sin esa pista. El resto del árbol (páginas, componentes,
integraciones de Astro) lo detecta el plugin de Astro que trae Knip de serie.

## Arquitectura (dependency-cruiser)

`.dependency-cruiser.cjs` impone, sobre el grafo de `src/lib/**/*.ts`:

- sin dependencias circulares,
- sin módulos huérfanos (con las excepciones documentadas en el propio archivo),
- `src/lib/api` no puede depender de `src/lib/domain` (domain depende de api, no al revés).

**Límite conocido:** dependency-cruiser no tiene extractor para `.astro` (`npx depcruise -i` no
lo lista), así que no puede ver los imports dentro del frontmatter de componentes/páginas. La
regla "la UI solo consume las fachadas `src/lib/*.ts`, nunca `src/lib/api` o `src/lib/domain`
directamente" se aplica en su lugar vía ESLint (`no-restricted-imports` en `eslint.config.js`),
que sí entiende `.astro` a través de `eslint-plugin-astro`.

## Cobertura de tests

Los thresholds en `vitest.config.ts` (55% statements/functions/lines, 45% branches) están puestos
justo por debajo de la cobertura real medida al configurarlos (~60/64/60/50%), como suelo de
regresión, no como objetivo. El hueco real es `src/lib/api` (`http-client.ts`,
`league-repository.ts`): hacen I/O de red de verdad y necesitarían mockear `fetch` para probarse
con sentido — no se ha añadido esa suite en esta pasada para no inflar cobertura con tests
artificiales. Al subir esos ficheros de cobertura, sube los thresholds correspondientes.

## SonarQube / SonarCloud

El job `sonar` en CI solo se ejecuta si la variable de repositorio `SONAR_PROJECT_KEY` está
definida. Para activarlo, configura en el repo de GitHub:

- **Secret** `SONAR_TOKEN`
- **Variables** `SONAR_HOST_URL`, `SONAR_PROJECT_KEY`, `SONAR_ORGANIZATION`

`sonar-project.properties` ya define `sonar.sources`, `sonar.tests`, las exclusiones (`dist/`,
`node_modules/`, `coverage/`, `playwright-report/`, `test-results/`, `public/admin/`, `design/`,
`.astro/`) y el reporte de cobertura (`coverage/lcov.info`, generado por `test:coverage`).

Ninguna de las tres cosas anteriores (host, token, project key/organization) está configurada
todavía — nadie ha creado un proyecto SonarCloud/SonarQube para este repo — así que el job se
queda en pausa (no falla, simplemente no corre) hasta que existan.

### Reglas "Sonar" que sí corren ya, sin servidor

Levantar un SonarQube real necesita Docker (con el daemon arrancado — requiere `sudo`, no
disponible para el agente) o una cuenta SonarCloud (credenciales que nadie debe inventar). Mientras
tanto, dos herramientas aplican el mismo tipo de reglas —sin servidor, sin cuenta— dentro de
`lint`/`lint:css`:

- **`eslint-plugin-sonarjs`** (`.ts`/`.astro`, ver `eslint.config.js`): complejidad cognitiva,
  ternarios anidados, template literals anidados, `sort()` sin comparador, `.match()` en vez de
  `.exec()`, y ~275 reglas más de la config `recommended`. Se probó contra el código real antes de
  activarla: solo 5 categorías de regla producían hallazgos (14 en total), todos corregidos —
  varios extrayendo funciones pequeñas (p. ej. `resolveFocusPlayoff`, `resolveSpotlight` en
  `index.astro`) o partiendo `validateLeagueData` en `validation.ts` (complejidad cognitiva 21→un
  par de funciones bajo 15).
- **`kpl/max-file-lines`** (`stylelint-local-rules/max-file-lines.mjs`, regla 1000 líneas): el
  equivalente de la regla Sonar S104 ("Files should not have too many lines"), que no existe en
  Stylelint de serie. **Encuentra 3 violaciones reales ahora mismo** —
  `src/styles/premium-pages.css` (2382 líneas), `home.css` (1329) y `cards.css` (1099) — que
  `npm run lint:css`/`quality`/CI reportan como error. No se han dividido en esta pasada: partir
  hojas de estilo de miles de líneas sin tests de regresión visual es un cambio con riesgo real de
  romper algo visible, y ya existe un plan dedicado para ese trabajo en `docs/css-audit.md`. La
  regla se deja en `error` a propósito — bajar el umbral para que pase silenciaría exactamente lo
  que se pidió detectar.

## Patrones bloqueados/avisados (código generado por IA)

ESLint (`eslint.config.js`) trata como **error**: `@ts-ignore`, `@ts-nocheck`, `any` explícito,
`console.log` (se permite `console.warn`/`console.error`), `debugger`, promesas sin gestionar
(`no-floating-promises`), cualquier `eslint-disable` sin una razón (`-- motivo`) tras `--`,
ternarios/template literals anidados y complejidad cognitiva excesiva (`eslint-plugin-sonarjs`, ver
más abajo). Como **warning**: comentarios `TODO`/`FIXME`/`HACK`.

## Deuda técnica conocida (no arreglada en esta pasada)

- `src/lib/api` sin tests unitarios (ver "Cobertura de tests" arriba).
- `tsconfig.json` añade `noUncheckedIndexedAccess` (activo: expuso un bug real en
  `SeasonMap.astro`, ya corregido) pero no `exactOptionalPropertyTypes` — esa opción por sí sola
  generaba ~60 errores en tests existentes por cómo modelan `homePriority?: number`, y arreglarlo
  bien es un cambio de forma de los tipos, no algo para colar en esta pasada. Queda como próximo
  paso si se quiere ese nivel de estrictez.
- **3 hojas de estilo superan las 1000 líneas** (`premium-pages.css` 2382, `home.css` 1329,
  `cards.css` 1099) — `npm run lint:css` falla por esto a propósito, ver más arriba. Dividirlas es
  el siguiente paso lógico y ya tiene su propio plan en `docs/css-audit.md`.
- `no-descending-specificity` de Stylelint está desactivada (ver `stylelint.config.mjs`): con
  `stylelint-config-recommended` activo produjo 86 hallazgos, todos sobre orden de selectores en un
  código con clases BEM ya únicas por componente — ruido, no bugs de especificidad reales.
