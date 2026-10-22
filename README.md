# Visión y alcance de Bolsa de Empleo UNIPAZ

> Sprint 0 · semana 3 · Paso 1 y Paso 2 de la guía-taller del Sprint 0.  
> Actualizado en el Sprint 1 (semana 4): MoSCoW tras el corte del MVP.

## Problema y ODS

En Barrancabermeja, los estudiantes del Instituto Universitario de la Paz (**UNIPAZ**) enfrentan graves dificultades para encontrar oportunidades laborales o de prácticas compatibles con sus horarios académicos y que les permitan generar ingresos para costear su transporte, fotocopias y matrícula sin abandonar la carrera. Actualmente, las ofertas circulan de forma dispersa e informal en grupos de WhatsApp, publicaciones aisladas en Facebook y carteleras físicas; no hay verificación de las empresas, muchas vacantes ya están vencidas y los estudiantes no reciben constancia ni respuesta alguna sobre el estado de sus postulaciones.

- **ODS 8 · Trabajo decente y crecimiento económico**, meta 8.5: «De aquí a 2030, lograr el empleo pleno y productivo y el trabajo decente para todas las mujeres y los hombres, incluidos los jóvenes y las personas con discapacidad, así como la igualdad de remuneración por trabajo de igual valor».
- **Meta 8.6:** «De aquí a 2020, reducir sustancialmente la proporción de jóvenes que no están empleados y no cursan estudios ni reciben capacitación».
- **Vinculación secundaria con ODS 4 · Educación de calidad**, meta 4.4: aumento sustancial del número de jóvenes y adultos con competencias técnicas y profesionales para el empleo.
- **Usuario principal:** estudiantes activos y egresados de UNIPAZ que buscan vacantes compatibles con su disponibilidad académica (persona: Carlos Andrés Mendoza, ver [`docs/requisitos.md`](docs/requisitos.md)).
- **Usuario secundario:** empresas y empleadores locales de Barrancabermeja que requieren talento universitario verificado, y la coordinación de prácticas y egresados de UNIPAZ.

## Declaración de visión (plantilla de Moore)

**Para** los estudiantes de UNIPAZ **que** necesitan encontrar oportunidades laborales compatibles con sus horarios académicos y requieren ingresos para cubrir sus gastos de estudio,  
**Bolsa de Empleo UNIPAZ es una** app móvil de intermediación laboral juvenil **que** permite consultar vacantes según disponibilidad horaria y postularse en menos de dos minutos con su hoja de vida en PDF.  
**A diferencia de** buscar oportunidades dispersas en redes sociales, grupos informales de WhatsApp o carteleras físicas, **nuestro producto** centraliza ofertas laborales verificadas con empresas de Barrancabermeja, garantiza trazabilidad inmediata con notificaciones sobre cambios de estado y protege la privacidad de la información estudiantil y laboral.

## Objetivo del Producto

> «Que cualquier estudiante de UNIPAZ consulte ofertas laborales verificadas en Barrancabermeja, filtre según su disponibilidad horaria y se postule con su hoja de vida en menos de dos minutos desde su teléfono móvil, y que las empresas e institución cuenten con un canal organizado y con trazabilidad».

Va también en la descripción del proyecto de GitHub Projects.

## Alcance con MoSCoW

### Como quedó en el Sprint 0

| Must | Should | Could | Won't (este semestre) |
|---|---|---|---|
| Iniciar sesión con Google (HU-01) | Filtros por horario y carrera (HU-04) | Guardar vacantes favoritas (HU-10) | Chat interno estudiante-empresa |
| Registro de empresa con NIT (HU-02) | Panel admin: aprobar empresa (HU-08) | Compartir vacante por WhatsApp (HU-13) | Videollamadas o entrevistas virtuales |
| Publicar vacante por empresa (HU-03) | Notificaciones push de postulación (HU-06) | Modo oscuro | Contratación directa desde la app |
| Buscar y ver detalle de ofertas (HU-04) | Historial completo de postulaciones | Exportar reportes a Excel (HU-14) | Firma electrónica de contratos |
| Postularse con CV en PDF (HU-05) | Edición y cierre de vacantes | Métricas avanzadas y gráficos (HU-16) | Gestión de salarios, nómina o pagos |
| Ver candidatos y cambiar estado (HU-07) | Notificaciones por correo adicionales | | Selección con algoritmos de IA |
| Perfil con disponibilidad horaria (HU-09) | | | Versión publicada para iOS |

**Regla del 60 %:** las Must del Sprint 0 suman 20 de 46 puntos (43.5 %), y junto a las tareas técnicas fundacionales del MVP (TEC-01 y TEC-02) alcanzan 25 de 46 puntos (**54.3 %**), cumpliendo el tope recomendado del 60 %.

**Revisión contra el Hito 3** (API + persistencia + función del dispositivo): autenticación Google / DocumentPicker para PDF (Must), persistencia relacional Prisma ORM + MySQL en backend con almacenamiento seguro de CVs (Must, TEC-02) y API REST en Next.js con endpoints modulares y notificaciones push (Must / Should, HU-06). Cubierto.

### Cambios del Sprint 1

| Cambio | Por qué |
|---|---|
| **HU-09 · Registro de disponibilidad horaria** entra y sube a **Must** | El mapa de experiencia de Carlos mostró que postularse sin filtrar por horarios de clase causa rechazo inmediato; sin esta historia el objetivo del producto no se cumple |
| **HU-06 · Estado de postulación y alertas visuales** sube a **Must** | En el mapa de experiencia, la incertidumbre tras postularse («no saber qué pasó») era el mayor dolor. Dar feedback visual de estado en la app cierra el ciclo del MVP |
| **HU-05 · Postulación a vacante** se simplificó (5 → 3 pts) | Se desacopló la subida/validación del archivo PDF (max 5 MB) del servicio asíncrono de notificación push (corte P de SPIDR) |
| **HU-13 · Compartir vacante por WhatsApp** baja a **Could** | No bloquea el flujo principal de postulación directa en la app y se priorizó la búsqueda y filtros esenciales en el MVP móvil |

## Fuera del alcance este semestre

- **Publicar la versión de iOS:** se distribuye solo el APK de Android y ejecución mediante Expo Go / depuración USB durante el semestre.
- **Chat interno en tiempo real y funciones de red social:** las comunicaciones formales de citación se gestionan por correo institucional y teléfono.
- **Videollamadas o entrevistas virtuales integradas:** la app gestiona el reclutamiento inicial y estado, no la ejecución de la entrevista.
- **Contratación directa y firma de contratos desde la app:** la formalización jurídica y laboral es externa entre empresa y estudiante.
- **Gestión de pagos, salarios o nómina:** la app no administra dispersión de fondos ni transferencias monetarias.
- **Selección automática de candidatos con IA:** la evaluación curricular es humana por parte de los reclutadores autorizados.
- **Garantizar la contratación efectiva:** la app asegura intermediación, verificación de vacantes y trazabilidad, no el otorgamiento del puesto.

## Dónde está cada cosa

| Sprint | Paso de la guía | Archivo |
|---|---|---|
| 0 | Visión, Objetivo del Producto, MoSCoW y fuera del alcance | [`docs/vision-y-alcance.md`](docs/vision-y-alcance.md) |
| 0 | Backlog ordenado y estimado | [`docs/backlog.md`](docs/backlog.md) |
| 0 | Tablero en GitHub Projects | [`docs/tablero.md`](docs/tablero.md) · [`scripts/crear-backlog.ps1`](scripts/crear-backlog.ps1) |
| 0 | Definición del Flujo de Trabajo y Definición de Terminado | [`docs/flujo-de-trabajo.md`](docs/flujo-de-trabajo.md) |
| 0 | Modelo de base de datos (Diagrama Entidad-Relación) | [`documentación/Diagrama entidad relacion DB.svg`](documentación/Diagrama%20entidad%20relacion%20DB.svg) |
| 0 | Roles, entregables y planificación del Sprint 1 | [`docs/sprints/sprint-0.md`](docs/sprints/sprint-0.md) |
| 1 | Review, Retrospectiva y Planning | [`docs/sprints/sprint-0.md`](docs/sprints/sprint-0.md) · [`docs/sprints/sprint-1.md`](docs/sprints/sprint-1.md) |
| 1 | Persona, mapa de experiencia, MVP, calidad, heurísticas | [`docs/requisitos.md`](docs/requisitos.md) (v0.1) |
| 1 | Criterios Dado / Cuando / Entonces (Gherkin) | [`docs/criterios/`](docs/criterios/) |
| 1 | Instrumentos de validación con usuarios (campo) | [`docs/validacion/`](docs/validacion/) |
| 1 | Examen práctico y checklist de evaluación | [`docs/examen-sprint1.md`](docs/examen-sprint1.md) |

---
Desarrollo de Aplicaciones Móviles · Ingeniería Informática · UNIPAZ · 2026
