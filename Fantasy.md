# Fantasy Pádel League – Documento de Definición Inicial

## 1. Contexto del proyecto

Se quiere crear una **web para gestionar una liga privada de pádel entre amigos** con un sistema similar a fantasy deportivo.

Objetivos principales:

1. Gestionar la **liga real** (equipos, jugadores, jornadas, resultados).
2. Tener un **mercado de jugadores con valor dinámico**.
3. (Opcional a futuro) crear un **fantasy para espectadores**.

La **prioridad inicial es la gestión de la liga**, no el fantasy.

---

# 2. Estructura de la liga

## Equipos

La liga estará formada por:

- **5 equipos**
- Cada equipo tendrá:
  - **1 o 2 presidentes**
  - **6 jugadores aproximadamente**

El número exacto puede ajustarse más adelante.

Ejemplo de estructura:

Liga
├─ Equipo 1
│ ├─ Presidente(s)
│ └─ Jugadores (6)
│
├─ Equipo 2
│ ├─ Presidente(s)
│ └─ Jugadores
│
└─ ...

---

# 3. Roles de usuario

Se necesitan varios tipos de usuario con distintos permisos.

## Administrador de liga

Ejemplo: **John**.

Permisos:

- Crear y configurar la liga
- Crear equipos
- Asignar jugadores
- Gestionar jornadas
- Crear partidos
- Modificar resultados
- Abrir y cerrar el mercado
- Gestionar usuarios

Puede haber **varios administradores**.

---

## Presidente de equipo

Responsabilidades:

- Gestionar su equipo
- Participar en el mercado de jugadores
- Consultar estadísticas
- Ver calendario y jornadas

Posibles permisos:

- Fichar jugadores
- Vender jugadores
- Gestionar plantilla

---

## Jugador

Permisos:

- Ver su perfil
- Consultar estadísticas
- Ver partidos
- Ver clasificación
- Ver su valor de mercado

No gestiona el equipo.

---

# 4. Calendario de la liga

## Formato

Liga en formato:

**Ida y vuelta**

Cada equipo juega contra todos.

Con 5 equipos:

4 rivales × 2 partidos = 8 jornadas por equipo

Este número todavía puede ajustarse.

---

## Organización de partidos

Los partidos se podrán jugar:

Lunes → Domingo

El **domingo se cierra la jornada**.

Flujo semanal:

Lunes – Domingo
se juegan partidos

Domingo
cierre jornada

Actualización de valores

Inicio nueva jornada

---

## Planificación

Inicialmente la planificación será **manual**.

Los administradores:

- crean las jornadas
- definen enfrentamientos
- publican los partidos

Se planificará aproximadamente **una semana por adelantado**.

Opcional futuro:

- fijar un **día oficial de jornada**.

---

# 5. Registro de resultados

Cada partido registrará:

- Equipo A
- Equipo B
- Resultado

Ejemplo:

Equipo A vs Equipo B

6-2
6-4

Esto permite calcular:

- ganador
- sets
- juegos

---

# 6. Clasificación de la liga

Todavía **no está completamente definido**.

Opciones posibles:

### Opción 1

Clasificación por **victorias**.

### Opción 2

Clasificación por **sets**.

### Opción 3

Clasificación por **juegos**.

Esto queda pendiente de decidir.

---

# 7. Sistema de mercado de jugadores

Uno de los elementos clave del proyecto.

Inspirado en sistemas tipo:

- Comunio
- Fantasy fútbol

---

# 8. Valor inicial de los jugadores

Cada jugador tendrá un **valor de mercado inicial**.

Se plantea:

- valor **asignado por los admins**
- dentro de un **rango definido**
- intentando mantener **equilibrio entre equipos**

Ejemplo de rango:

1M – 5M

El objetivo es que ningún equipo empiece con ventaja clara.

---

# 9. Evolución del valor de mercado

El valor de los jugadores cambiará según su rendimiento.

Se basa principalmente en:

### resultados de los partidos

Ejemplo:

Jugador gana 6-0 6-0
→ su valor sube bastante

Jugador pierde muchos partidos
→ su valor baja

En resumen:

victorias → sube valor
derrotas → baja valor

---

## Actualización del valor

La actualización se realizará:

**una vez por semana**

Flujo:

Lunes – Domingo
se juegan partidos

Domingo
se cierra jornada

Sistema recalcula valores

---

# 10. Apertura del mercado

El mercado no estará abierto desde el principio.

Idea actual:

- empezar liga
- jugar **primera vuelta**
- abrir mercado **a mitad de temporada**

Esto aún está pendiente de confirmar.

---

# 11. Acciones del mercado

Cuando el mercado esté abierto:

Los presidentes podrán:

- comprar jugadores
- vender jugadores
- negociar fichajes

Los detalles del sistema de fichajes aún no están definidos.

---

# 12. Perfil de jugador

Cada jugador tendrá una ficha con información como:

Nombre
Equipo
Valor de mercado
Partidos jugados
Victorias
Derrotas
Resultados
Histórico

También podría incluir:

ranking
estadísticas

---

# 13. Funcionalidades principales de la web

## Liga

- calendario
- jornadas
- resultados
- clasificación

---

## Equipos

- plantillas
- presidentes
- jugadores

---

## Jugadores

- perfil
- estadísticas
- valor de mercado

---

## Mercado

- valor de jugadores
- fichajes
- histórico

---

# 14. Fantasy (fase futura)

Esto **no es prioritario ahora mismo**.

Idea:

Personas que **no juegan en la liga** podrán:

- comprar jugadores
- crear equipos fantasy
- sumar puntos cada semana

Similar a sistemas tipo:

- Comunio
- Fantasy La Liga

Pero solo se hará **si la liga base ya funciona bien**.

---

# 15. Cabos sueltos (pendientes de definir)

Aún hay varias decisiones abiertas.

---

## Número exacto de jugadores por equipo

Actualmente:

6 jugadores aproximadamente

Pero podría cambiar.

---

## Sistema de clasificación

Falta decidir:

- puntos por victoria
- sets
- juegos

---

## Formato de enfrentamientos

No está definido:

- cuántos partidos por jornada
- cuántas parejas juegan
- si todos los jugadores participan

---

## Algoritmo del valor de mercado

Falta definir:

- fórmula exacta
- cuánto sube o baja el valor

---

## Rango de valores iniciales

Debe definirse:

valor mínimo
valor máximo

---

## Cómo se reportan resultados

Opciones posibles:

- administrador
- presidentes
- jugadores

---

## Validación de resultados

Quién confirma resultados oficialmente.

---

## Sistema de mercado

Falta decidir:

- subastas
- compra directa
- negociación entre equipos

---

## Gestión de calendario

Actualmente:

manual

Pero podría automatizarse en el futuro.

---

# 16. Estado actual del proyecto

## Ya definido

- estructura básica de equipos
- roles
- jornada semanal
- cierre de jornada domingo
- valores dinámicos de jugadores
- mercado futuro

---

## Pendiente de definir

- reglas exactas de la liga
- sistema de puntuación
- algoritmo del valor
- mercado detallado
- formato exacto de partidos

---

# 17. Prioridad de desarrollo

Orden recomendado de desarrollo:

1 → Usuarios
2 → Equipos
3 → Jugadores
4 → Jornadas
5 → Resultados
6 → Clasificación
7 → Valor de jugadores
8 → Mercado
9 → Fantasy (si se hace)
