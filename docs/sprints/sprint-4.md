# Sprint 4 — Administración, notificaciones y cierre

**Duración:** días 11–15

## Objetivo

Completar las funciones de notificaciones y administración, validar de forma integral los eventos del sistema y preparar la entrega.

## Trabajo planificado

- **EV-06, EV-07, EV-13 y EV-18:** implementar las notificaciones.
- **EV-20 y EV-21:** implementar la administración y los reportes empresariales.
- **EV-22 a EV-28:** completar las funciones administrativas definidas en el backlog:
  - **EV-22:** revisar empresas pendientes y aprobarlas o rechazarlas con motivo.
  - **EV-23:** consultar usuarios con búsqueda, filtros por rol y paginación.
  - **EV-24:** activar o desactivar cuentas, protegiendo las cuentas administrativas.
  - **EV-25:** moderar vacantes; pausar, reactivar o cerrar una vacante.
  - **EV-26:** consultar los indicadores principales de la plataforma.
  - **EV-27:** consultar el gráfico mensual de postulaciones del año en curso.
  - **EV-28:** consultar el historial de acciones administrativas.
- Ejecutar pruebas integrales de los 29 eventos.
- Corregir errores críticos.
- Completar la documentación y preparar la demostración.

## Criterios de aceptación para EV-22–EV-28

- Solo un administrador autenticado puede ejecutar estas operaciones.
- Cada acción que cambia datos muestra confirmación; si falla, informa el error y conserva el estado anterior.
- EV-22 / HU-02: aprobar una empresa pendiente habilita su publicación de vacantes; rechazarla exige un motivo y no le permite publicar.
- EV-23 / HU-15: el listado permite buscar por nombre o email, filtrar por rol y recorrer resultados paginados.
- EV-24 / HU-17: desactivar una cuenta bloquea su acceso y activarla lo restaura; un administrador no puede desactivar cuentas administrativas.
- EV-25 / HU-03: pausar o cerrar una vacante la retira de la búsqueda estudiantil; reactivarla solo se permite si la fecha límite sigue vigente y la empresa está aprobada.
- EV-26 / HU-08: los KPIs muestran estudiantes, empresas aprobadas, empresas pendientes, vacantes activas y postulaciones, con conteos consistentes con los datos persistidos.
- EV-27 / HU-16: el gráfico presenta las postulaciones agrupadas por mes para el año en curso, incluidos los meses sin registros.
- EV-28 / HU-18: cada acción administrativa que cambie datos conserva actor, fecha y hora, tipo de acción y registro afectado; el historial no incluye contraseñas, tokens ni contenido de CVs.

## Entrega del sprint

Funciones administrativas y notificaciones integradas, eventos validados mediante pruebas integrales y versión preparada para documentación y demostración.
