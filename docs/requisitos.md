# Requisitos — Bolsa de Empleo UNIPAZ (React Native + Laravel)

## Requerimientos Funcionales

---

### RF-01: Autenticación y Gestión de Sesiones

| ID | Descripción |
|----|-------------|
| RF-01.1 | Registro de empresas con validación de email único, NIT opcional y estado inicial `"pending"`. |
| RF-01.2 | Login de empresas y admin con email/contraseña. Hash bcrypt. Bloqueo si el usuario está inactivo. |
| RF-01.3 | Autenticación de estudiantes exclusivamente vía Google OAuth 2.0 (Laravel Socialite). Creación automática del perfil si no existe. |
| RF-01.4 | Middleware de rol (`role:admin|company|student`) en todas las rutas protegidas. Redireccionamiento al panel correcto post-login. |
| RF-01.5 | Cierre de sesión seguro: logout con invalidación de sesión y regeneración de token CSRF. |

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
| RF-04.1 | Un estudiante solo puede postularse una vez por vacante (restricción en DB y validación en servicio). |
| RF-04.2 | Si la vacante requiere CV, el campo `cv` es obligatorio. Se puede adjuntar uno nuevo o reutilizar el del perfil del estudiante. |
| RF-04.3 | Los CVs se almacenan en disco privado (no accesibles directamente por URL). Solo se sirven mediante `Storage::download()` con autenticación. |
| RF-04.4 | Al crear una postulación, se notifica al representante de la empresa (`NewApplicationNotification`) vía email y base de datos. |
| RF-04.5 | La empresa puede actualizar el estado de la postulación: `pending → reviewed → interview → accepted|rejected`. Cada cambio notifica al estudiante. |
| RF-04.6 | El campo `company_notes` es privado: no debe exponerse al estudiante en ninguna vista ni respuesta JSON. |

---

### RF-05: Panel de Administración

| ID | Descripción |
|----|-------------|
| RF-05.1 | Dashboard con KPIs: total estudiantes, empresas aprobadas, empresas pendientes, vacantes activas, total postulaciones. |
| RF-05.2 | Gráfico mensual de postulaciones del año en curso. Compatible con SQLite, MySQL y PostgreSQL (expresiones de fecha dinámicas). |
| RF-05.3 | Gestión de usuarios: listado paginado con filtros por rol y búsqueda. Toggle de activación/desactivación (excepto admins). |
| RF-05.4 | Módulo de reportes: distribución de empresas por estado, postulaciones por estado, vacantes activas por área. |
| RF-05.5 | ⚠️ **[PENDIENTE]** Exportación de reportes a Excel mediante `maatwebsite/laravel-excel` o similar. |

---

## Requerimientos No Funcionales

### 🔒 Seguridad

| Requerimiento | Especificación |
|---------------|----------------|
| Autorización a nivel modelo | Implementar `JobPostingPolicy` y `ApplicationPolicy` con `Gate` para evitar que una empresa acceda a recursos de otra. |
| Validación con FormRequests | Toda validación de input debe vivir en clases `FormRequest`, no en controladores, para separar responsabilidades y facilitar testing. |
| CVs en disco privado | Los archivos de CV no deben estar en `storage/app/public`. Usar disco `local` y servir mediante rutas autenticadas con `Storage::download()`. |
| Protección CSRF | Todas las rutas POST/PUT/DELETE protegidas por el middleware `VerifyCsrfToken` de Laravel (por defecto activo). |
| Rate Limiting | Aplicar throttle en rutas de autenticación: `throttle:5,1` en login y register para mitigar ataques de fuerza bruta. |

---

### ⚡ Rendimiento

| Requerimiento | Especificación |
|---------------|----------------|
| Eager Loading | Todas las consultas con relaciones deben usar `with()`. Ej: `JobPosting::with('company')`, `Application::with(['user','jobPosting.company'])`. |
| Paginación | Todos los listados paginados: `paginate(12)` para vacantes, `paginate(15)` para empresas, `paginate(20)` para usuarios. |
| Notificaciones en cola | Activar `QUEUE_CONNECTION=database` en producción y ejecutar `php artisan queue:work`. Las 3 notificaciones ya implementan `ShouldQueue`. |
| Índices de DB | Índices recomendados: `users(role)`, `users(email)`, `companies(status)`, `job_postings(status, deadline)`, `applications(user_id, job_posting_id)`. |

---

### 🛠️ Mantenibilidad

| Requerimiento | Especificación |
|---------------|----------------|
| Service Layer | Crear `ApplicationService` para encapsular: validar duplicado, verificar vacante activa, subir CV, crear `Application`, disparar notificación. |
| Tests de Feature | Cobertura mínima: estudiante no puede postular dos veces, empresa no edita vacante ajena, admin aprueba empresa y se notifica. |
| Seeders de desarrollo | Factories para `User`, `Company`, `JobPosting`, `Application` con estados variados para facilitar el desarrollo y testing manual. |
