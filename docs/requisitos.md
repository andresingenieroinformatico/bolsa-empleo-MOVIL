# Requisitos — Bolsa de Empleo UNIPAZ (React Native + Next.js)

## Requerimientos Funcionales

---

### RF-01: Autenticación y Gestión de Sesiones

| ID | Descripción |
|----|-------------|
| RF-01.1 | Registro de empresas con validación de email único, NIT opcional y estado inicial `"pending"`. |
| RF-01.2 | Login de empresas y admin con email/contraseña. Hash bcrypt/argon2. Bloqueo si el usuario está inactivo. |
| RF-01.3 | Autenticación de estudiantes exclusivamente vía Google OAuth 2.0 (Google Sign-In en React Native / NextAuth en Next.js). Creación automática del perfil si no existe. |
| RF-01.4 | Middleware de rol (`role:admin|company|student`) en todas las rutas y endpoints protegidos. Redireccionamiento / navegación al panel correcto post-login. |
| RF-01.5 | Cierre de sesión seguro: logout con invalidación de token JWT / sesión segura. |

---

### RF-02: Gestión de Empresas

| ID | Descripción |
|----|-------------|
| RF-02.1 | Una empresa recién registrada queda en estado `"pending"`. No puede publicar vacantes hasta ser aprobada. |
| RF-02.2 | El administrador puede aprobar o rechazar empresas. La aprobación dispara una notificación por email y base de datos al representante. |
| RF-02.3 | Una empresa aprobada puede actualizar su perfil: nombre, sector, descripción, logo (imagen max 2MB), teléfono y sitio web. |
| RF-02.4 | El logo de empresa debe almacenarse en disco privado de Storage y servirse mediante URL firmada o pública mediante symlink. |

---

### RF-03: Gestión de Vacantes (Job Postings)

| ID | Descripción |
|----|-------------|
| RF-03.1 | Solo empresas aprobadas pueden crear vacantes. La creación requiere: título, descripción, requisitos, tipo de contrato, modalidad y fecha límite. |
| RF-03.2 | Una empresa solo puede editar o eliminar sus propias vacantes (`Policy: JobPostingPolicy`). Violaciones devuelven 403. |
| RF-03.3 | Estados de vacante: `active`, `paused`, `closed`. Una vacante activa con deadline pasado se considera expirada aunque el estado sea `"active"`. |
| RF-03.4 | El admin puede pausar o activar cualquier vacante desde su panel sin restricción de propiedad. |
| RF-03.5 | Scopes requeridos: `scopeActive()` (status=active AND deadline >= hoy), `scopeByArea()`, `scopeByModality()`, `scopeByProgram()`. |

---

### RF-04: Postulaciones (Applications)

| ID | Descripción |
|----|-------------|
| RF-04.1 | Un estudiante solo puede postularse una vez por vacante (restricción en DB y validación en API). |
| RF-04.2 | Si la vacante requiere CV, el campo `cv` es obligatorio. Se puede adjuntar uno nuevo o reutilizar el del perfil del estudiante. |
| RF-04.3 | Los CVs se almacenan en almacenamiento privado (no accesibles directamente por URL pública). Solo se sirven mediante un endpoint autenticado en Next.js con headers de descarga segura. |
| RF-04.4 | Al crear una postulación, se notifica al representante de la empresa vía email y registro en DB. |
| RF-04.5 | La empresa puede actualizar el estado de la postulación: `pending → reviewed → interview → accepted|rejected`. Cada cambio notifica al estudiante (email + push notification). |
| RF-04.6 | El campo `company_notes` es privado: no debe exponerse al estudiante en ninguna vista ni respuesta JSON de la API. |

---

### RF-05: Panel de Administración

| ID | Descripción |
|----|-------------|
| RF-05.1 | Dashboard con KPIs: total estudiantes, empresas aprobadas, empresas pendientes, vacantes activas, total postulaciones. |
| RF-05.2 | Gráfico mensual de postulaciones del año en curso. Compatible con MySQL / PostgreSQL mediante consultas optimizadas de agregación en Prisma/SQL. |
| RF-05.3 | Gestión de usuarios: listado paginado con filtros por rol y búsqueda. Toggle de activación/desactivación (excepto admins). |
| RF-05.4 | Módulo de reportes: distribución de empresas por estado, postulaciones por estado, vacantes activas por área. |
| RF-05.5 | ⚠️ **[PENDIENTE]** Exportación de reportes a Excel mediante librería de Node.js (`exceljs` o `xlsx`). |

---

## Requerimientos No Funcionales

### 🔒 Seguridad

| Requerimiento | Especificación |
|---------------|----------------|
| Autorización a nivel API | Middleware y utilidades de autorización en Next.js Route Handlers para verificar roles y pertenencia de recursos (ej: empresa solo edita sus vacantes). |
| Validación con Zod | Toda validación de input en peticiones de API debe realizarse con esquemas Zod en los Route Handlers de Next.js, garantizando tipado estricto. |
| CVs en almacenamiento privado | Los archivos de CV se almacenan en directorio privado del servidor o bucket S3 privado, servidos únicamente vía endpoint autenticado con streaming seguro. |
| Protección de endpoints y JWT | Autenticación basada en JWT / Bearer Tokens o sesiones seguras HTTP-only cookies gestionadas por NextAuth.js. |
| Rate Limiting | Aplicar throttle / rate limiting en rutas de autenticación de Next.js (ej: con `@upstash/ratelimit` o middleware) para mitigar ataques de fuerza bruta. |

---

### ⚡ Rendimiento

| Requerimiento | Especificación |
|---------------|----------------|
| Consultas optimizadas | Todas las consultas con relaciones en Prisma deben usar `include` selectivo para evitar N+1 queries. Ej: `prisma.jobPosting.findMany({ include: { company: true } })`. |
| Paginación en API | Todos los listados paginados mediante `take` y `skip`: 12 para vacantes, 15 para empresas, 20 para usuarios. |
| Notificaciones en segundo plano | Envío asíncrono de emails y push notifications mediante cola de tareas (BullMQ o micro-tareas serverless). |
| Índices de DB | Índices recomendados: `users(role)`, `users(email)`, `companies(status)`, `job_postings(status, deadline)`, `applications(user_id, job_posting_id)`. |

---

### 🛠️ Mantenibilidad

| Requerimiento | Especificación |
|---------------|----------------|
| Service / Lib Layer | Funciones modulares en `src/services` o `src/lib` en Next.js para encapsular lógica de negocio: validar duplicados, subir CVs, crear `Application` y notificar. |
| Tests de Integración | Cobertura mínima con Jest/Vitest: estudiante no puede postular dos veces, empresa no edita vacante ajena, admin aprueba empresa y se notifica. |
| Seeders con Prisma | Script `prisma/seed.ts` para poblar usuarios, empresas, vacantes y aplicaciones con datos de prueba realistas. |
