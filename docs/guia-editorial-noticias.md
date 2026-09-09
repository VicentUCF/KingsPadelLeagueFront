# Cómo crear y publicar una noticia (sin conocimientos técnicos)

Esta guía es para quien redacta noticias, no para quien programa. No hace falta saber de
Markdown, Git ni código: todo se hace desde el panel visual.

## 1. Entrar al panel

Abre `/admin` en el dominio del sitio (por ejemplo `https://kingspadelleague.com/admin`). La
primera vez tendrás que iniciar sesión con la cuenta que te haya dado la persona que administra
el proyecto en TinaCloud (normalmente tu email o tu cuenta de GitHub).

## 2. Crear una noticia nueva

1. En el menú lateral, entra en **Noticias**.
2. Pulsa **Create New** (arriba a la derecha).
3. Escribe el **Titular**. Ojo: el titular decide la dirección web (URL) de la noticia, y esa
   dirección ya no cambia después aunque más tarde edites el titular. Si te equivocas mucho en el
   titular antes de guardar por primera vez, mejor corrígelo ahora que después.

## 3. Rellenar los campos

- **Titular**: el título principal (máximo 90 caracteres).
- **Subtítulo**: una frase corta de entradilla (máximo 200 caracteres). Se ve en las tarjetas del
  listado de noticias y también es lo que se muestra al compartir el enlace en redes sociales.
- **Imagen principal**: opcional. Sube una foto, añade un **texto alternativo** describiéndola (lo
  usan los lectores de pantalla para personas con discapacidad visual) y, si aplica, el **crédito**
  de la foto.
- **Contenido**: el cuerpo de la noticia. El editor es visual: puedes poner negrita, cursiva,
  enlaces, listas, etc. sin escribir código.
- **Fecha de publicación**: mientras esta fecha esté en el futuro, la noticia queda guardada pero
  _no_ aparece todavía en la web, aunque esté marcada como publicada.
- **Categoría**: elige una de la lista (Equipos, Calendario, Cartas, Partidos).
- **Publicada**: actívalo cuando quieras que la noticia se vea en la web. Si lo dejas
  desactivado, la noticia queda como borrador: no aparece en el listado ni tiene página pública,
  pero puedes seguir revisándola con "Ver en directo" (ver más abajo).
- **Destacada en portada**: actívalo si quieres que aparezca en la portada del sitio. Si activas
  varias, usa **Prioridad en destacadas** para decidir el orden (cuanto menor el número, más
  arriba aparece).
- **Equipos relacionados** / **Jornada relacionada**: opcional, para enlazar la noticia con la
  ficha de un equipo o de una jornada.
- Los campos marcados como **"(fase futura)"** son para una función que todavía no existe en la
  web (generación automática de piezas para Instagram). Puedes dejarlos en blanco.

## 4. Previsualizar antes de publicar

Guarda los cambios y usa el botón **"Ver en directo"** del editor para ver exactamente cómo
quedará la noticia en el sitio, con el mismo diseño que verán los visitantes. Puedes seguir
editando desde ahí: los cambios se reflejan al momento en la vista previa.

Mientras la noticia esté marcada como borrador (o con fecha futura), ese enlace de vista previa es
la única forma de verla — no aparece en el listado público ni se indexa en buscadores.

## 5. Publicar

Para que la noticia sea pública:

1. Activa **Publicada**.
2. Comprueba que la **Fecha de publicación** no sea una fecha futura.
3. Guarda.

No hace falta ningún paso técnico adicional: guardar ya es publicar. El sitio se reconstruye solo
en segundo plano y la noticia aparece en unos minutos.

## Cosas a tener en cuenta

- **No edites `_plantilla-resultados-jornada`**: no es una noticia real, es una plantilla de
  referencia para quien prepara los resultados de cada jornada. Por eso ni siquiera aparece en el
  listado de Noticias del panel.
- **El titular no cambia la URL después de creada la noticia**: si corriges una errata en el
  titular más tarde, el enlace que ya haya compartido la gente sigue funcionando igual.
- **El enlace de "Ver en directo" de un borrador es privado pero no secreto**: no lo compartas en
  redes ni en sitios públicos si la noticia todavía no debe verse.
