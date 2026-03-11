HANDOFF FRONTEND / BACKOFFICE

1. Objetivo del backoffice

El backoffice es la interfaz interna para gestionar la liga.
Debe permitir operar la temporada, equipos, plantillas, convocatorias, resultados, sanciones y MVP sin depender de cambios manuales en base de datos.

No es una web pública.
Es una herramienta de operación.

2. Roles que debe contemplar frontend
   ADMIN

Puede:

crear y activar temporada

crear equipos

asignar presidentes

crear jornadas

crear fixtures

aprobar cambios de plantilla

aprobar invitados

bloquear/publicar convocatorias

registrar/corregir resultados

aplicar/revertir sanciones

gestionar MVP si hay incidencias

PRESIDENT

Puede:

gestionar su equipo dentro de la temporada activa

enviar convocatoria

proponer altas/bajas

solicitar invitado

nominar MVP

emitir voto interno MVP

USER autenticado

Puede:

emitir voto público MVP

PÚBLICO

No entra en backoffice.

3. Módulos funcionales del backoffice

El front debería organizar el backoffice en estos módulos:

Dashboard

Seasons

Teams

Players

Roster Management

Matchdays

Fixtures

Lineups

Results

Sanctions

MVP

Users / Roles

Audit / Activity log

4. Vista general por módulo
   4.1 Dashboard
   Objetivo

Dar visibilidad rápida del estado operativo de la temporada.

Bloques recomendados

temporada activa

próxima jornada

fixtures pendientes de convocatoria

convocatorias pendientes

solicitudes pendientes:

roster changes

guest approvals

resultados pendientes de cerrar

sanciones recientes

estado del MVP de la jornada actual

Acciones rápidas

crear jornada

crear fixture

revisar solicitudes pendientes

cerrar fixture

abrir/cerrar MVP

4.2 Seasons
Qué debe mostrar

Listado de temporadas con:

nombre

año

estado

fechas

número de equipos

número de jornadas

Detalle de una season

datos básicos

estado

fechas

equipos asociados

jornadas

clasificación snapshot actual

Acciones admin

crear season

editar season en DRAFT

activar season

finalizar season

archivar season

Restricciones UI

solo puede haber una ACTIVE

una season FINISHED o ARCHIVED no debe permitir cambios operativos normales

si una season está activa, la UI debe resaltarlo claramente

4.3 Teams
Qué debe mostrar

Listado de equipos de la season activa o seleccionada:

nombre

shortName

logo

colores

presidente actual

jugadores regulares activos

estado

Detalle de equipo

Tabs recomendadas:

Info

President / Roles

Roster

Fixtures

Sanctions

MVP history

Acciones admin

crear equipo

editar datos visuales

asignar/cambiar presidente

archivar o desactivar

Acciones presidente

ver plantilla

iniciar solicitudes de alta/baja

solicitar invitado

ver historial de convocatorias

4.4 Players
Qué debe mostrar

Listado global de jugadores:

nombre

nick

imagen

estado

equipos históricos

user vinculado o no

Detalle de jugador

datos personales básicos

memberships históricas

participaciones

nominaciones MVP

si tiene user asociado

Acciones admin

crear ficha de jugador

editar ficha

desactivar

vincular a user

Restricción importante

La UI no debe dar a entender que un Player “pertenece” directamente a un equipo.
Debe mostrarse como:

equipo actual derivado

histórico de memberships

4.5 Roster Management

Este módulo es clave para backoffice.

Submódulos

Active roster

Roster change requests

Guest approval requests

4.5.1 Active roster
Qué debe mostrar

Para un equipo y season:

jugadores regulares activos

vigencia

estado membership

histórico de altas/bajas

Acciones admin

aprobar cambios pendientes

cerrar memberships

revisar histórico

Restricciones UI

máximo 6 regulares activos en v1

guest no se mezcla visualmente como jugador regular

mostrar claramente:

type = REGULAR / GUEST

status = ACTIVE / ENDED / REMOVED

4.5.2 Roster Change Requests
Qué debe mostrar

Listado de solicitudes:

team

player

actionType

requestedBy

effectiveFrom

status

createdAt

Acciones admin

aprobar

rechazar

cancelar si aplica

Acciones presidente

crear solicitud

ver estado

cancelar si aún está pending

Estados UI

PENDING

APPROVED

REJECTED

CANCELED

Necesidades visuales

Cada request debe mostrar:

justificación

notas de decisión

quién decidió

cuándo se decidió

4.5.3 Guest Approval Requests
Qué debe mostrar

Listado de solicitudes de invitado:

fixture

team

player

requestedBy

justification

status

Acciones admin

aprobar

rechazar

Acciones presidente

solicitar invitado

Restricciones UI

máximo 1 invitado por equipo y fixture

solo regular season

no playoff

guest no elegible para MVP

La UI debe mostrar estas reglas cerca del formulario.
No las escondas.

4.6 Matchdays
Qué debe mostrar

Listado de jornadas:

number

stage

name

scheduledDate

lineupDeadlineAt

lineupsPublishAt

status

Detalle de jornada

fixtures asociados

estado operativo

MVP election

sanciones ligadas

clasificación post-jornada

Acciones admin

crear jornada

editar datos temporales si procede

cerrar jornada

Restricciones UI

No sobrecargar con demasiados estados.
La jornada tiene sentido como contenedor, no como workflow detallista.

4.7 Fixtures
Qué debe mostrar

Listado por jornada:

local vs visitante

fecha

estado

lineups status

resultado

forfeit o no

Detalle de fixture

Tabs recomendadas:

Summary

Lineups

Pair matches

Result

Sanctions

Guest requests

Audit

Acciones admin

crear fixture

editar fecha

cancelar fixture

marcar forfeit

cerrar fixture

reabrir/corregir fixture si procede

Restricciones UI

El fixture es el centro operativo.
No lo trates como una fila de calendario.

4.8 Lineups
Qué debe mostrar

Para cada fixture:

lineup home

lineup away

submittedBy

submittedAt

status

lockedAt

publishedAt

admin override

Estructura visual correcta

No mostrar “4 jugadores sueltos”.
Mostrar:

Pair One

Pair Two

Cada pareja con sus 2 jugadores.

Acciones presidente

crear/editar convocatoria antes de deadline

enviar convocatoria

Acciones admin

bloquear

publicar

override

sustituir jugador por causa justificada

Validaciones que frontend debe respetar

exactamente 4 jugadores únicos

exactamente 2 parejas

jugador no repetido

pair one y pair two obligatorias

guest permitido solo si aprobado

guest no permitido en playoff

La UI debe validar esto antes de enviar, aunque backend lo revalide.

4.9 Results
Qué debe mostrar

Por fixture:

Pair One result

Pair Two result

puntos asignados

ganador fixture

estado del cierre

Formulario de resultado

Para cada PairMatch:

status

homeSetsWon

awaySetsWon

homeGamesWon

awayGamesWon

Si es FORFEIT:

no pedir sets/games como obligatorios

mostrar motivo aparte

Acciones admin

registrar resultado de pair match

cerrar fixture

corregir resultado

marcar forfeit

Importante para UI

No permitir edición libre de:

homePointsAwarded

awayPointsAwarded

winnerTeamId

loserTeamId

Eso debe mostrarse como calculado, no editable.

4.10 Sanctions
Qué debe mostrar

Listado de sanciones:

team

season

fixture o jornada

type

pointsDelta

reason

appliedBy

appliedAt

reversed o no

Acciones admin

aplicar sanción

revertir sanción

Restricciones UI

pointsDelta negativo en v1

no borrar sanciones

una sanción revertida sigue visible

Esto debe quedar clarísimo en la UI.

4.11 MVP

Este módulo necesita estructura clara o será un caos.

Submódulos

Election overview

Nominations

Internal votes

Public votes

Result

4.11.1 Election overview
Qué debe mostrar

Por jornada:

estado de elección

ventanas temporales

número de nominaciones

número de votos internos

número de votos públicos

ganador si está cerrado

Estados

DRAFT

NOMINATIONS_OPEN

INTERNAL_VOTING_OPEN

PUBLIC_VOTING_OPEN

CLOSED

Frontend debe reflejar muy bien el estado actual.

4.11.2 Nominations
Qué debe mostrar

equipo

jugador nominado

nominatedBy

createdAt

Acciones presidente

nominar un jugador de su equipo

Restricciones UI

solo 1 nominado por equipo y jornada

el jugador debe haber participado esa jornada

guest no elegible

4.11.3 Internal votes
Qué debe mostrar

equipo votante

presidente votante

jugador votado

Acciones presidente

emitir 1 voto interno

Restricciones UI

no puede votar a su propio nominado

solo 1 voto interno por equipo y jornada

4.11.4 Public votes
Qué debe mostrar para admin

conteo de votos

distribución por jugador

total de usuarios votantes

Acciones user

emitir 1 voto público por jornada

Restricciones UI

requiere autenticación

1 voto por jornada

4.11.5 Result
Qué debe mostrar

Por candidato:

votos internos

votos públicos

ratio interno

ratio público

score final

ranking final

Importante

No mostrar solo “ganador” sin breakdown.
El sistema tiene ponderación. La UI debe explicar el cálculo.

4.12 Users / Roles
Qué debe mostrar

users

roles globales

vínculo con player

team role assignments

Acciones admin

crear user

activar/desactivar

asignar rol global ADMIN

vincular a player

asignar presidente/delegate vía team role assignment

Importante

No modelar “presidente” como solo un badge global.
Debe verse en el contexto del equipo y season.

4.13 Audit / Activity log

No hace falta hipercomplejo en v1, pero el módulo debe existir en diseño.

Qué debería mostrar

aprobaciones/rechazos

overrides de lineup

cierre de fixtures

correcciones de resultado

sanciones aplicadas/revertidas

cambios de estado del MVP

Si no puedes implementarlo completo ahora, al menos deja hueco de navegación y diseño.

5. Entidades que frontend debe conocer

Frontend no necesita todo el schema de BD, pero sí esta visión:

Principales

User

Player

Season

Team

TeamRoleAssignment

TeamMembership

Matchday

Fixture

Lineup

LineupPair

PairMatch

RosterChangeRequest

GuestApprovalRequest

Sanction

MvpElection

MvpNomination

MvpVote

SeasonStandingsSnapshot

6. Estados y enums que frontend debe contemplar
   GlobalUserRole

ADMIN

USER

TeamRole

PRESIDENT

DELEGATE

SeasonStatus

DRAFT

ACTIVE

FINISHED

ARCHIVED

MembershipType

REGULAR

GUEST

MembershipStatus

ACTIVE

ENDED

REMOVED

MatchdayStage

REGULAR

PLAY_IN

SEMIFINAL

FINAL

MatchdayStatus

DRAFT

OPEN

IN_PROGRESS

CLOSED

FixtureStatus

SCHEDULED

READY

IN_PROGRESS

PLAYED

FORFEIT

CANCELED

LineupStatus

DRAFT

SUBMITTED

LOCKED

PUBLISHED

PairType

PAIR_ONE

PAIR_TWO

PairMatchStatus

SCHEDULED

PLAYED

FORFEIT

CANCELED

RequestStatus

PENDING

APPROVED

REJECTED

CANCELED

RosterChangeActionType

ADD_REGULAR

REMOVE_REGULAR

SanctionType

LATE_LINEUP

ADMIN_DECISION

MvpElectionStatus

DRAFT

NOMINATIONS_OPEN

INTERNAL_VOTING_OPEN

PUBLIC_VOTING_OPEN

CLOSED

VoteType

INTERNAL

PUBLIC

7. Reglas de UI que frontend debe asumir desde ya
   Reglas fuertes

solo una season activa

solo un lineup por equipo y fixture

lineup = 4 jugadores únicos y 2 parejas

no repetir jugador en parejas

Pair One vale 3 puntos

Pair Two vale 2 puntos

guest máximo 1 por equipo y fixture

guest no puede playoff

guest no puede MVP

clasificación derivada, no editable

puntos del fixture derivados, no editables

voto interno: 1 por equipo y jornada

voto público: 1 por usuario y jornada

Reglas de experiencia

no ocultar estados importantes

no mostrar acciones inválidas según rol o estado

los bloqueos temporales deben verse claramente

las operaciones sensibles deben pedir confirmación:

activar season

cerrar fixture

aplicar sanción

revertir sanción

cerrar MVP

aprobar/rechazar requests

8. Estructura de navegación recomendada del backoffice
   Backoffice
   ├── Dashboard
   ├── Seasons
   │ ├── List
   │ ├── Detail
   │ └── Create / Edit
   ├── Teams
   │ ├── List
   │ ├── Detail
   │ │ ├── Info
   │ │ ├── Roles
   │ │ ├── Roster
   │ │ ├── Fixtures
   │ │ ├── Sanctions
   │ │ └── MVP
   ├── Players
   │ ├── List
   │ └── Detail
   ├── Roster
   │ ├── Active Memberships
   │ ├── Roster Change Requests
   │ └── Guest Requests
   ├── Matchdays
   │ ├── List
   │ └── Detail
   ├── Fixtures
   │ ├── List
   │ └── Detail
   │ ├── Summary
   │ ├── Lineups
   │ ├── Pair Matches
   │ ├── Result
   │ ├── Sanctions
   │ ├── Guests
   │ └── Audit
   ├── MVP
   │ ├── Elections
   │ ├── Nominations
   │ ├── Votes
   │ └── Results
   ├── Users
   └── Audit
9. Qué puede empezar a construir frontend ya, aunque no exista backend

Esto sí se puede avanzar ya:

Layout y shell

sidebar

topbar

guards por rol simulados

breadcrumbs

tablas reutilizables

formularios admin

Vistas CRUD base

seasons list/detail

teams list/detail

players list/detail

matchdays list/detail

fixtures list/detail

Flujos de operación

submit lineup form

roster request form

guest approval request form

result entry form

sanction form

MVP nomination/vote screens

Componentes reutilizables

status badge por enum

role badge

timeline / audit item

confirmation modal

entity header

pair editor

standings table

request decision panel

10. Qué no debería hacer frontend todavía

No debería:

inventar contratos API definitivos

asumir que todos los campos de BD se exponen igual

meter reglas de negocio profundas solo en cliente

acoplar el diseño a Supabase directamente

modelar auth/policies finales sin backend definido

Front ahora debe construir:

navegación

pantallas

componentes

formularios

estados UI

mocks tipados razonables

No debe cerrar la capa de integración real todavía.

11. DTOs de lectura recomendados para que frontend piense bien

No son contratos finales, pero sirven como guía mental.

Team list item
type TeamListItem = {
id: string
name: string
shortName: string
logoUrl?: string
primaryColor?: string
secondaryColor?: string
president?: {
userId: string
displayName: string
}
activeRegularPlayersCount: number
isActive: boolean
}
Fixture detail
type FixtureDetail = {
id: string
stage: 'REGULAR' | 'PLAY_IN' | 'SEMIFINAL' | 'FINAL'
status: 'SCHEDULED' | 'READY' | 'IN_PROGRESS' | 'PLAYED' | 'FORFEIT' | 'CANCELED'
scheduledAt: string
homeTeam: {
id: string
name: string
shortName: string
}
awayTeam: {
id: string
name: string
shortName: string
}
homePointsAwarded?: number
awayPointsAwarded?: number
isForfeit: boolean
forfeitReason?: string
lineups: LineupDetail[]
pairMatches: PairMatchDetail[]
}
Lineup detail
type LineupDetail = {
id: string
teamId: string
status: 'DRAFT' | 'SUBMITTED' | 'LOCKED' | 'PUBLISHED'
submittedAt?: string
lockedAt?: string
publishedAt?: string
isAdminOverride: boolean
overrideReason?: string
pairs: {
pairType: 'PAIR_ONE' | 'PAIR_TWO'
players: Array<{
id: string
fullName: string
membershipType: 'REGULAR' | 'GUEST'
}>
}[]
}
Request detail
type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED'

type GuestApprovalRequestDetail = {
id: string
status: RequestStatus
team: { id: string; name: string }
player: { id: string; fullName: string }
fixture: { id: string; label: string }
justification: string
requestedBy: { id: string; displayName: string }
decidedBy?: { id: string; displayName: string }
decisionNotes?: string
createdAt: string
decidedAt?: string
} 12. Prioridad real para frontend

Orden recomendado de trabajo:

Prioridad 1

layout backoffice

navegación

dashboard

seasons

teams

players

Prioridad 2

roster management

matchdays

fixtures list/detail

Prioridad 3

lineup management

result entry

sanctions

Prioridad 4

MVP module

audit

Ese orden tiene sentido.
Empezar por MVP antes que fixtures sería perder el foco.

13. Conclusión para frontend

El backoffice debe construirse alrededor de estas ideas:

Fixture es el centro operativo

TeamMembership es la verdad de plantilla

TeamRoleAssignment resuelve presidencia

requests y approvals son parte central del flujo

la UI debe representar reglas y estados, no ocultarlos

clasificación y puntos son derivados, no editables manualmente

Lo más importante: no diseñéis una UI CRUD plana.
Esto no es “panel para editar tablas”.
Es una herramienta operativa con workflows, estados, bloqueos temporales y aprobaciones.
