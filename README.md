# Bolsa de Empleo UNIPAZ

**Intermediación laboral juvenil y oportunidades según disponibilidad académica · ODS 8 · Barrancabermeja**

Proyecto del curso *Desarrollo de Aplicaciones Móviles* (Ingeniería Informática, VIII semestre, UNIPAZ). Muestra cómo el equipo aplica el **Sprint 0** y el **Sprint 1** del marco del curso (Scrumban con fases de Mobile-D) para una solución móvil desarrollada con **React Native (Expo)** y backend en **Next.js**.

> **Estado: fin del Sprint 1 (semana 4), fase de Exploración.** Hay requisitos v0.1 y criterios de aceptación (Gherkin Dado / Cuando / Entonces) de las historias Must del MVP. La arquitectura técnica, el modelo de datos relacional y el checklist del examen práctico están formalizados. **Falta la validación con estudiantes y empresas reales en campo (INV-02).**

## Objetivo del Producto

> «Que cualquier estudiante de UNIPAZ consulte ofertas laborales verificadas en Barrancabermeja, filtre según su disponibilidad horaria y se postule con su hoja de vida en menos de dos minutos desde su teléfono móvil, y que las empresas e institución cuenten con un canal organizado y con trazabilidad».

**Para** los estudiantes de UNIPAZ **que** necesitan encontrar oportunidades laborales compatibles con sus horarios académicos y requieren ingresos para cubrir sus gastos, **Bolsa de Empleo UNIPAZ es una** app móvil de intermediación laboral **que** permite consultar ofertas según disponibilidad horaria y postularse en menos de dos minutos con su hoja de vida. **A diferencia de** buscar oportunidades de manera dispersa en redes sociales, grupos informales de WhatsApp o carteleras físicas, **nuestro producto** centraliza ofertas verificadas con empresas de Barrancabermeja, garantiza trazabilidad con notificaciones push ante cambios de estado y protege la privacidad de la información estudiantil y laboral.

## Dónde está cada cosa

| Sprint | Paso de la guía | Archivo |
|---|---|---|
| 0 | Visión, Objetivo del Producto, MoSCoW y fuera del alcance | [`docs/vision-y-alcance.md`](docs/vision-y-alcance.md) |
| 0 | Backlog ordenado y estimado | [`docs/backlog.md`](docs/backlog.md) |
| 0 | Tablero en GitHub Projects | [`docs/tablero.md`](docs/tablero.md) |
| 0 | Definición del Flujo de Trabajo y Definición de Terminado | [`docs/flujo-de-trabajo.md`](docs/flujo-de-trabajo.md) |
| 0 | Modelo de base de datos (Diagrama Entidad-Relación) | [`documentación/Diagrama entidad relacion DB.svg`](documentación/Diagrama%20entidad%20relacion%20DB.svg) |
| 0 | Roles, entregables y planificación del Sprint 1 | [`docs/sprints/sprint-0.md`](docs/sprints/sprint-0.md) |
| 1 | Review, Retrospectiva y Planning | [`docs/sprints/sprint-0.md`](docs/sprints/sprint-0.md) · [`docs/sprints/sprint-1.md`](docs/sprints/sprint-1.md) |
| 1 | Persona, mapa de experiencia, MVP, calidad, heurísticas | [`docs/requisitos.md`](docs/requisitos.md) (v0.1) |
| 1 | Criterios Dado / Cuando / Entonces (Gherkin) | [`docs/criterios/`](docs/criterios/) |
| 1 | Instrumentos de validación con usuarios (campo) | [`docs/validacion/`](docs/validacion/) |
| 1 | Examen práctico y checklist de evaluación | [`docs/examen-sprint1.md`](docs/examen-sprint1.md) |

## Ejecutar la prueba técnica

Requisitos del curso: Node.js 20+, npm o pnpm, Expo CLI, Android SDK API 34+ y un dispositivo Android físico con depuración USB / Expo Go (o emulador).

```powershell
# --- 1. Frontend Móvil (React Native con Expo) ---
# Instalación de dependencias y validación
npm install
npm run lint           # análisis estático de código
npx tsc --noEmit       # comprobación estricta de tipos TypeScript

# Iniciar servidor de desarrollo móvil
npx expo start         # escanear código QR desde Expo Go en Android o presionar 'a' para emulador

# --- 2. Backend API (Next.js + Prisma ORM) ---
# Dependencias y base de datos
npm install
npx prisma generate    # genera el cliente tipado de Prisma
npx prisma migrate dev # aplica migraciones en MySQL / MariaDB
npm run dev            # API REST activa en http://localhost:3000
```

En modo de desarrollo, la interfaz móvil maneja los cuatro estados clave de la experiencia de usuario: **con datos** (vacantes activas y postulaciones), **vacío** (sin resultados con los filtros aplicados o sin postulaciones), **falla al leer / red** (error de conexión con feedback claro y botón de reintento) y **cargando** (skeleton loaders e indicadores de progreso).

**Arquitectura del sistema:**
- **Frontend Móvil (React Native + Expo):** `screens/` (vistas por rol: estudiante, empresa, admin) · `components/` (componentes UI accesibles según RC-02) · `services/` (consumo de API REST) · `context/` (autenticación y tokens seguros con `Expo SecureStore`) · `navigation/` (React Navigation con control de acceso por roles).
- **Backend API (Next.js App Router):** `app/api/` (Route Handlers modulares con validación `Zod`) · `prisma/` (esquema relacional y migraciones MySQL) · `lib/` (Google OAuth 2.0, JWT, hashing con bcrypt y streaming seguro de hojas de vida en PDF).

## Ramas y forma de trabajar

- `main` está protegida: todo entra exclusivamente mediante Pull Request con revisión aprobatoria de pares.
- Una rama por elemento del backlog: `hu-01-auth-google`, `hu-04-busqueda-vacantes`, `hu-05-postulacion-cv`, `tec-02-api-prisma`, `inv-02-validacion-campo`.
- El PR dice `Closes #N` para cerrar el issue automáticamente y mover la tarjeta a «Hecho» al fusionar.
- Flujo de validación: las historias funcionales se prueban en un teléfono Android físico («En dispositivo») antes de fusionar en `main`; los elementos de investigación (`INV`) pasan de «En revisión» directamente a «Hecho».

## Historial de sprints

| Sprint | Semana | Objetivo | Throughput | Resultado |
|---|---|---|---|---|
| 0 | 3 | Tablero, acuerdos de equipo y backlog priorizado listos para trabajar | 0 (línea de base) | Hecho |
| 1 | 4 | Criterios de aceptación de historias Must del MVP y validación con usuarios | 2 (DOC-01, INV-01) | Criterios y checklist de examen listos; **validación en campo pendiente (INV-02)** |

## Usar este repositorio en clase

1. Leerlo junto a las guías-taller **22 · Sprint 0** y **23 · Sprint 1**: cada archivo en `docs/` dice a qué paso de la guía y fase de Mobile-D responde.
2. Para practicar o replicar el tablero: seguir la guía de configuración de GitHub Projects en [`docs/tablero.md`](docs/tablero.md) con las columnas, límites WIP y campos personalizados.
3. Para el examen del Sprint 1: contrastar los criterios de aceptación en Gherkin de [`docs/criterios/`](docs/criterios/) y el checklist de evaluación técnica en [`docs/examen-sprint1.md`](docs/examen-sprint1.md).

---
Desarrollo de Aplicaciones Móviles · Ingeniería Informática · UNIPAZ · 2026
