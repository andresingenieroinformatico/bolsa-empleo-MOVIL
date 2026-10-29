# Backlog — Bolsa de Empleo UNIPAZ

> Product Owner: Andres Ferney Garcia Ramirez · Scrum Master: Juan Jose Figueroa Ayala

Este es el backlog de referencia del proyecto. Los identificadores y prioridades se alinean con [`requisitos.md`](requisitos.md) y [`vision-y-alcance.md`](vision-y-alcance.md). HU-01–HU-09 corresponden al alcance funcional base; HU-10 en adelante son funcionalidades posteriores o condicionadas a la capacidad del equipo.

## Prioridades

| Prioridad | Significado |
|---|---|
| **Must** | Imprescindible para cumplir el objetivo del producto y el MVP. |
| **Should** | Importante, se implementa después de las funcionalidades Must. |
| **Could** | Deseable si queda capacidad y no pone en riesgo el MVP. |

## Historias de usuario

Los criterios de aceptación están en formato Gherkin en `docs/criterios/`. Todas las historias comienzan en **Backlog**; pasan a **Listo** cuando cumplan la Definición de Listo de [`flujo-de-trabajo.md`](flujo-de-trabajo.md).

| ID | Épica | Historia de usuario | Prioridad | Puntos | Criterios | Estado |
|---|---|---|---|---:|---|---|
| HU-01 | Autenticación | Como estudiante de UNIPAZ, quiero iniciar sesión con Google OAuth institucional para acceder a la bolsa de empleo sin recordar otra contraseña. | Must | 3 | [HU-01](criterios/HU-01_autenticacion-google.feature) | Backlog |
| HU-02 | Empresas | Como representante, quiero registrar y verificar mi empresa con email y NIT para solicitar acceso a la publicación de vacantes. | Must | 3 | [HU-02](criterios/HU-02_registro-empresa.feature) | Backlog |
| HU-03 | Vacantes | Como empresa aprobada, quiero publicar y gestionar mis vacantes para encontrar estudiantes que se ajusten a mis necesidades. | Must | 3 | [HU-03](criterios/HU-03_publicacion-vacante.feature) | Backlog |
| HU-04 | Vacantes | Como estudiante, quiero buscar y consultar vacantes con filtros de área, modalidad, programa y horario para encontrar ofertas compatibles conmigo. | Must | 3 | [HU-04](criterios/HU-04_busqueda-vacantes.feature) | Backlog |
| HU-05 | Postulaciones | Como estudiante, quiero postularme a una vacante con mi hoja de vida PDF para que la empresa evalúe mi perfil. | Must | 3 | [HU-05](criterios/HU-05_postulacion-vacante.feature) | Backlog |
| HU-06 | Postulaciones | Como estudiante, quiero consultar el estado de mis postulaciones y recibir avisos de sus cambios para conocer el avance del proceso. | Must | 2 | [HU-06](criterios/HU-06_estado-postulacion.feature) | Backlog |
| HU-07 | Postulaciones | Como representante de empresa aprobada, quiero consultar y gestionar los candidatos de mis vacantes para llevar el proceso de selección. | Must | 3 | [HU-07](criterios/HU-07_gestion-candidatos.feature) | Backlog |
| HU-08 | Administración | Como administrador, quiero consultar los indicadores principales de la plataforma para supervisar su funcionamiento. | Should | 3 | [HU-08](criterios/HU-08_panel-administracion.feature) | Backlog |
| HU-09 | Perfil | Como estudiante, quiero completar mi perfil académico, registrar mi disponibilidad y administrar mi CV para facilitar mis postulaciones. | Must | 3 | [HU-09](criterios/HU-09_perfil-estudiante.feature) | Backlog |
| HU-10 | Vacantes | Como estudiante, quiero guardar y consultar vacantes favoritas para volver a ellas fácilmente. | Could | 2 | [HU-10](criterios/HU-10_vacantes-favoritas.feature) | Backlog |
| HU-11 | Notificaciones | Como usuario, quiero recibir notificaciones adicionales por correo sobre eventos relevantes para no perder actualizaciones. | Should | 2 | [HU-11](criterios/HU-11_notificaciones-correo.feature) | Backlog |
| HU-12 | Empresas | Como empresa aprobada, quiero actualizar la información de mi perfil público para mantener vigente la presentación de mi organización. | Should | 2 | [HU-12](criterios/HU-12_perfil-empresa.feature) | Backlog |
| HU-13 | Vacantes | Como estudiante, quiero compartir una vacante por WhatsApp para enviarla a una persona interesada. | Could | 2 | [HU-13](criterios/HU-13_compartir-whatsapp.feature) | Backlog |
| HU-14 | Administración | Como administrador, quiero exportar reportes a Excel para analizar y compartir la información de gestión. | Could | 3 | [HU-14](criterios/HU-14_reportes-excel.feature) | Backlog |
| HU-15 | Administración | Como administrador, quiero buscar, filtrar y recorrer la lista de usuarios para encontrar la cuenta que necesito gestionar. | Should | 2 | [HU-15](criterios/HU-15_listado-usuarios.feature) | Backlog |
| HU-16 | Administración | Como administrador, quiero consultar un gráfico mensual de postulaciones del año en curso para observar su evolución. | Could | 3 | [HU-16](criterios/HU-16_grafico-postulaciones.feature) | Backlog |
| HU-17 | Administración | Como administrador, quiero activar o desactivar cuentas de usuario para controlar su acceso a la plataforma. | Should | 2 | [HU-17](criterios/HU-17_estado-cuentas.feature) | Backlog |
| HU-18 | Administración | Como administrador, quiero consultar un historial de acciones administrativas para dar seguimiento a los cambios realizados. | Should | 2 | [HU-18](criterios/HU-18_auditoria-administrativa.feature) | Backlog |

## Elementos técnicos

| ID | Elemento | Prioridad | Puntos | Criterios de terminado | Estado |
|---|---|---|---:|---|---|
| TEC-01 | Configurar la base de la aplicación móvil con React Native, Expo y TypeScript, incluyendo navegación y ejecución en Android. | Must | 2 | La aplicación inicia en Android; la estructura permite añadir pantallas y navegación; configuración y pasos de ejecución quedan documentados. | Backlog |
| TEC-02 | Preparar la API REST con Next.js, Prisma ORM y MySQL, con migraciones, autenticación JWT, autorización por rol y validación de entradas con Zod. | Must | 3 | API conectada a la base de datos; migraciones reproducibles; rutas protegidas por rol; errores de validación explícitos; configuración local documentada sin incluir secretos. | Backlog |
| TEC-03 | Implementar el servicio de correo transaccional adicional definido para HU-11. | Should | 2 | Envíos desacoplados de la respuesta principal; errores de entrega registrados; credenciales configuradas mediante variables de entorno; pruebas de los eventos cubiertos por HU-11. | Backlog |

La notificación push de HU-06 es parte del alcance Must y debe implementarse con esa historia; no debe quedar bloqueada por TEC-03, que corresponde al correo adicional.

## Investigación

| ID | Elemento | Prioridad | Resultado esperado | Estado |
|---|---|---|---|---|
| INV-02 | Realizar cinco entrevistas estructuradas de 20 minutos: tres estudiantes de distintos programas y jornadas y dos representantes de empresas locales. | Must | Fichas diligenciadas en `docs/validacion/`, hipótesis contrastadas y observaciones que puedan convertirse en cambios del backlog. | Backlog |

## Orden de trabajo y dependencias

1. Preparar TEC-01 y TEC-02 antes de integrar historias móviles con la API.
2. Construir el flujo principal con HU-01, HU-02, HU-09, HU-03, HU-04, HU-05, HU-06 y HU-07; conservar las dependencias entre autenticación, perfil, vacantes y postulaciones.
3. Implementar HU-08, HU-15, HU-17, HU-18 y TEC-03 después de tener los datos y eventos que deben supervisarse o notificarse; HU-16 es posterior por prioridad Could.
4. Tomar HU-10–HU-18 únicamente cuando el equipo confirme capacidad y las prioridades Must no estén en riesgo.
5. Registrar cada defecto descubierto durante el desarrollo como un issue `BUG-XX`; no se crean defectos hipotéticos en este backlog.

La planificación detallada de los sprints se mantiene en [`sprints/`](sprints/). La Definición de Terminado, políticas WIP y criterios para que una historia pase a **Listo** están en [`flujo-de-trabajo.md`](flujo-de-trabajo.md).

## Correspondencia con los eventos de los sprints 2–4

Los códigos **EV** de los documentos de sprint son agrupaciones de trabajo, no sustituyen los identificadores **HU**, **TEC** e **INV** de este backlog.

| Plan del sprint | Elemento del backlog |
|---|---|
| Sprint 2: EV-01, página principal | Base de navegación y entrada a la app dentro de TEC-01 y HU-01/HU-02. |
| Sprint 2: EV-02, registro empresarial | HU-02. |
| Sprint 2: EV-03–EV-05, autenticación y sesión | HU-01 y TEC-02. |
| Sprint 2: EV-29, perfil administrativo; API, roles y conexión móvil | HU-08, TEC-01 y TEC-02. |
| Sprint 3: EV-08–EV-09, perfil y CV | HU-09. |
| Sprint 3: EV-10–EV-11, búsqueda y favoritos | HU-04 y HU-10. |
| Sprint 3: EV-12 y EV-14, postulación y seguimiento | HU-05 y HU-06. |
| Sprint 3: EV-15–EV-16, perfil empresarial y postulaciones recibidas | HU-12 y HU-07. |
| Sprint 3: EV-17 y EV-19, cambio de estado y publicación de vacantes | HU-07 y HU-03. |
| Sprint 4: EV-06, EV-07, EV-13 y EV-18, notificaciones | HU-11 y TEC-03 para el correo adicional. HU-06 y sus notificaciones push Must corresponden al seguimiento EV-14 del Sprint 3. |
| Sprint 4: EV-20–EV-21, administración y reportes | HU-08 y HU-14. |
| Sprint 4: EV-22, aprobar o rechazar empresas | HU-02. |
| Sprint 4: EV-23, buscar, filtrar y paginar usuarios | HU-15. |
| Sprint 4: EV-24, activar o desactivar cuentas | HU-17. |
| Sprint 4: EV-25, moderar vacantes | HU-03. |
| Sprint 4: EV-26, KPIs | HU-08. |
| Sprint 4: EV-27, gráfico mensual de postulaciones | HU-16. |
| Sprint 4: EV-28, historial de acciones administrativas | HU-18. |
| Sprint 4: pruebas de eventos, errores críticos, documentación y demostración | Definición de Terminado de cada HU y trabajo de cierre del sprint; los defectos se registran como `BUG-XX`. |

### Definición funcional de EV-22–EV-28

| Evento | Función y alcance | Criterios vinculados |
|---|---|---|
| EV-22 | Revisar empresas pendientes: aprobar o rechazar con motivo. La aprobación habilita la publicación; el rechazo no. | HU-02 |
| EV-23 | Consultar usuarios con búsqueda por nombre/email, filtros por rol y paginación. | HU-15 |
| EV-24 | Activar o desactivar cuentas; bloquear el acceso de cuentas inactivas y proteger las cuentas administrativas contra desactivación. | HU-17 |
| EV-25 | Pausar, reactivar o cerrar vacantes. Solo se puede reactivar una vacante cuya fecha límite siga vigente y cuya empresa esté aprobada. | HU-03 |
| EV-26 | Mostrar KPIs: estudiantes, empresas aprobadas, empresas pendientes, vacantes activas y postulaciones. | HU-08 |
| EV-27 | Mostrar postulaciones agrupadas por mes del año en curso, también los meses sin registros. | HU-16 |
| EV-28 | Registrar y permitir consultar acciones administrativas con actor, fecha/hora, acción y registro afectado, sin guardar secretos ni CVs. | HU-18 |

Los eventos EV identifican entregables del sprint. Cuando una capacidad ya pertenece a una historia existente (EV-22/HU-02 y EV-25/HU-03), se conserva allí; las capacidades independientes se refinan como HU-15–HU-18 y cuentan con criterios propios.

## Funcionalidades descartadas (Won't Have)

- Chat interno entre estudiante y empleador.
- Videollamadas o entrevistas virtuales.
- Contratación directa o firma de contratos desde la aplicación.
- Gestión de pagos, salarios o nómina.
- Selección automática de candidatos mediante IA.
- Integración con otras plataformas de empleo.
- Publicación de la versión iOS durante este semestre.
