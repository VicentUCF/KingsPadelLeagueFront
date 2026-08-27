# Kings Padel League Web

Nuevo cliente web público de Kings Padel League, construido con Astro. El backoffice no forma parte de este proyecto.

## Requisitos

- Node.js 22.12 o superior
- npm 10 o superior
- El repositorio local `kpl-design-system` en `../../Projects/kpl-design-system`

## Desarrollo

```sh
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`.

## Comandos

```sh
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run preview  # previsualización del build
```

## Sistema de diseño

La dependencia `@kpl/design-system` está enlazada al repositorio local mediante `file:../../Projects/kpl-design-system`.

El layout base importa la entrada CSS recomendada:

```js
import '@kpl/design-system/css';
```

Los cambios hechos en la librería se reflejan reinstalando la dependencia:

```sh
npm install
```
