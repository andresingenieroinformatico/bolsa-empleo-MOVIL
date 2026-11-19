# UniEmpleo — Historial de cambios realizados

Este documento registra todo el trabajo realizado en el proyecto hasta la fecha:
rediseño de interfaz, flujo de notificaciones, permisos por rol, subida de PDF,
persistencia de horarios y conexiones API/frontend.

---

## 1. Arquitectura actual

El proyecto tiene tres capas que se comunican por HTTP:

| Capa | Tecnología | Ubicación | Función |
| --- | --- | --- | --- |
| App móvil/web | Expo SDK 58, React Native 0.88, React 19, Expo Router | `UniEmpleo/src/app`, `UniEmpleo/src/views` | Interfaz del estudiante, empresa y administrador |
| Gateway | Next.js (Route Handlers) | `UniEmpleo/src/Api/app/api/v1` | Punto único de entrada de la app; valida archivos, reenvía a Laravel y normaliza respuestas |
| API | Laravel 12 + SQLite | `bolsa-empleo-unipaz-main` | Autenticación SANCTUM, datos, notificaciones, reportes PDF y almacenamiento |

La app **nunca llama directamente a Laravel**: siempre apunta al gateway mediante
`EXPO_PUBLIC_API_URL=http://192.168.80.25:3000/api/v1`. El gateway reenvía a
`LARAVEL_API_URL=http://127.0.0.1:8000`.

---

## 2. Rediseño visual y sistema de diseño

- Se creó un sistema de tokens en `src/constants/theme.ts`:
  - Verde institucional `#00963F` / `#007832`.
  - Navy `#0D1B4C` / `#10235F`.
  - Canvas `#F4F5F7`, tinta `#1A1F36`, verde claro `#E6F7ED`.
  - `Space`, `Radius`, `Shadows` y `Type` para consistencia.
- Primitivas reutilizables en `src/components/ui/`: `Button`, `TextField`,
  `Chip`, `Sheet`, `Notice`, `Avatar`, `SectionHeader`, `Icon` (Ionicons).
- Se eliminó la estética de plantilla por defecto: no se usan emojis en la UI.
- Se construyó un shell propio en `src/app/index.tsx` con landing, login,
  registro y navegación inferior accesible (4 pestañas para empresa, 5 para
  estudiante y administrador; objetivos táctiles de al menos 44 pt).
- Accesibilidad: `accessibilityRole`, `accessibilityLabel`,
  `accessibilityState`, `accessibilityLiveRegion` y soporte para lectores de
  pantalla en las acciones principales.

**Commit:** `9bc12df`.

---

## 3. Registro, roles y sesión

- Registro de empresa reducido a seis campos: razón social, responsable, NIT,
  correo corporativo, contraseña y confirmación. La descripción dejó de ser
  obligatoria y se completada desde el perfil.
- Aviso persistente de perfil incompleto. Si la empresa intenta crear una
  vacante con el perfil incompleto, se abre un diálogo de compleción.
- Login con dos pestañas únicamente: **Estudiante** y **Empresa**. El
  administrador ingresa por la pestaña Empresa; el rol real lo decide la API.
- Estudiantes restringidos al dominio `@unipaz.edu.co`.
- Cada rol accede a su perfil desde su propia pestaña y tiene su propio cuadro
  de notificaciones.
- "Mi panel" lleva al panel del rol activo; "Continuar" vuelve al apartado
  anterior.
- Sesión persistente: `localStorage` en web (`uniempleo.auth-session`) y
  `SecureStore` en nativo.
- Aviso de logout que impide volver al panel anterior con el botón Atrás.
- Aviso de sesión expirada cuando la API responde 401.
- Búsqueda de correo de empresa en Laravel insensible a mayúsculas mediante
  `whereRaw('lower(email) = ?', ...)`.
- Se corrigió el perfil de estudiante sin `id` con `mapStudentProfile` y
  `withSessionIdentity`.

---

## 4. Empresas: aprobación, rechazo y reenvío

- Estado de revisión para empresas con migración
  `2026_11_18_000002_add_review_fields_to_companies_table.php`.
- `CompanyController`:
  - El registro notifica a todos los administradores.
  - `approve` y `reject` son idempotentes: solo notifican cuando cambia
    realmente el estado o el motivo.
  - `rejectCompany` exige `reason` (entre 10 y 1000 caracteres) y lo guarda en
    `rejection_reason`.
  - Al guardar el perfil, una empresa `rejected` pasa a `pending`, registra
    `resubmitted_at` y notifica a los administradores.
- Empresa rechazada: acciones de vacantes y candidatos deshabilitadas; ve en la
  notificación lo que el administrador pide corregir; puede editar su
  información y reenviarla a revisión.
- Contadores de dashboard `companies_rejected`.
- Notificaciones síncronas (sin `ShouldQueue`) para que el cambio se refleje de
  inmediato.

**Commits:** backend `eb2d75c`, `ddc9749`; frontend `ede49fd`.

---

## 5. Administración

- Panel de administrador con KPIs, reportes PDF, usuarios, empresas y vacantes.
- Edición de estudiantes desde `PUT /users/{user}`: datos personales y cambio
  de contraseña con revocación de tokens (`$user->tokens()->delete()`).
- Búsqueda de estudiantes por nombre, correo y cédula.
- Filtros `active` y `profile` debajo del buscador.
- Aprobación y rechazo de empresas desde el listado; al rechazar se navega al
  listado filtrado por `pending` cuando corresponde.

---

## 6. Notificaciones

- `AppNotification` con `applicationId`, `companyId` y `status`.
- `mapNotification` prioriza `data.type` en snake_case sobre el nombre de clase;
  si falta, deriva el tipo del nombre de clase.
- Iconos por tipo: aprobada (check verde), rechazada ( X roja), nueva
  postulación (documento verde).
- `NotificationsSheet`: al seleccionar una notificación se marca como leída y se
  navega a la acción requerida:
  - Estudiante `application_status` → Mis postulaciones.
  - Empresa `new_application` → Candidatos; `company_rejected` → Perfil;
    `company_approved` → Mis vacantes.
  - Administrador `company_resubmitted` / `company_registration` → Empresas
    (Pendientes).
- "Marcar todas como leídas" persiste `read_at`.
- Solo emergentes necesarias: se eliminaron 13 `showApiError` duplicados
  (quedan 2) y el dock de error no se muestra en el landing.
- Refresco silencioso cada 60 s y al foco/visibilidad en web; en nativo con
  `AppState` al volver a `active`.
- `AdminCompaniesView` recibe `initialStatus` y `key`; el filtro manual
  sincroniza `adminCompaniesInitialStatus`.
- Backend: `NotificationController::markAsRead` por UUID; paginación de 20;
  respuesta `{success, data:{current_page, ..., data:[...]}}`.
- Se corrigió un crash nativo en `use-notifications.ts` usando `AppState` en
  móvil y listeners DOM solo con `Platform.OS === 'web'` con guardas de
  `window`/`document`. En nativo `window` existe pero `window.addEventListener`
  no, por eso los guards son por plataforma y tipo de función.

**Commit:** frontend `3e3e575`.

---

## 7. Paginación y reportes

- `fetchAllPages` obtiene todas las páginas antes de renderizar:
  - Vacantes y postulaciones: 12 por página.
  - Candidatos: 15.
  - Usuarios administrador: 20.
  - Empresas y vacantes del administrador: 15.
- Reportes PDF de administrador y empresa servidos por el gateway con
  `Cache-Control: no-store`.

---

## 8. Subida de hoja de vida PDF hasta 20 MB

Trabajo realizado en esta sesión:

- **Frontend**
  - Nueva fuente única de verdad `src/lib/document-limits.ts` con
    `MAX_CV_MB = 20`, `MAX_CV_BYTES` y `isCvWithinLimit`.
  - `src/services/api.ts`: `assertPdfWithinLimit` usa el nuevo límite y el
    mensaje dice 20 MB.
  - `src/views/student/HU09_PerfilView.tsx`: validación y texto "PDF · máx.
    20 MB".
  - `src/views/student/HU04_VacantesView.tsx`: validación del PDF alternativo
    al postularse y textos "Obligatoria (PDF, máx. 20 MB)" y "Selecciona un
    archivo PDF (máximo 20 MB)".
- **Gateway**
  - `src/Api/lib/upload-validation.ts`: `MAX_PDF_SIZE` pasó de 5 MB a 20 MB;
    margen de 1 MB para la envoltura multipart; mensajes actualizados.
  - `src/Api/app/api/v1/jobs/[id]/apply/route.ts`: se agregó
    `validateMultipartSize` antes de reenviar la postulación.
  - Documentación `src/Api/docs/API_DOCUMENTATION.md` y
    `ARQUITECTURA_API.md` actualizada a 20 MB.
- **Backend**
  - `StudentProfileController::uploadCv`: `max:20480` con mensajes
    personalizados en español.
  - `profileData` ahora devuelve `cv_size_bytes` y `cv_uploaded_at` para que la
    interfaz muestre el tamaño real del archivo en lugar de "0 MB".
  - `mapStudentProfile` convierte `cv_size_bytes` a megabytes con un decimal.
- **PHP / entorno**
  - El `php.ini` local tenía `upload_max_filesize=2M` y `post_max_size=8M`. El
    servidor de desarrollo se inicia con:
    `php -d upload_max_filesize=20M -d post_max_size=24M -d memory_limit=256M -S 0.0.0.0:8000 -t . "..\vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php"`
    ejecutado desde `bolsa-empleo-unipaz-main/public`.
  - Se ejecutó `php artisan storage:link` para que `/storage/cvs/...` sirva los
    PDFs.
- **Verificación**
  - Login como estudiante y subida de un PDF de **exactamente 20 971 520 bytes**
    por `POST /api/v1/students/upload-cv` a través del gateway: `success: true`.
  - Perfil devuelve `cv_url`, `cv_size_bytes: 20971520` y `cv_uploaded_at`.
  - Descarga directa del PDF: HTTP 200, 20 971 520 bytes, `application/pdf`.
  - Un PDF de 20 MB + 1 byte fue rechazado por el gateway con
    "El PDF debe pesar entre 5 bytes y 20 MB."

---

## 9. Horarios de disponibilidad del estudiante

Trabajo realizado en esta sesión:

- Problema: la matriz de horarios de `HU09_PerfilView` permitía marcar días y
  turnos, pero el backend no guardaba `availability`, por lo que la selección
  se perdía al recargar.
- Solución backend:
  - Migración `2026_11_19_000001_add_availability_to_student_profiles_table.php`
    (columna JSON nullable).
  - `StudentProfile`: `availability` en `$fillable` y cast `'array'`.
  - `StudentProfileController::update`: valida `availability`, `availability.*`
    y `availability.*.*`, y normaliza los valores con
    `normalizeAvailability`, que solo conserva los días
    Lunes a Sábado y los turnos Mañana, Tarde y Noche.
  - `profileData` devuelve `availability`.
- Solución frontend:
  - `HU09_PerfilView` tiene una nueva prop `onSaveAvailability`.
  - Cada vez que se marca o desmarca una celda se guarda automáticamente; se
    usa un contador de secuencia (`useRef`) para que una respuesta tardía no
    sobrescriba el estado de una selección más reciente.
  - Indicador con `accessibilityLiveRegion="polite"`: "Guardando horarios…",
    "Horarios guardados.", error en rojo o texto inicial "Cada cambio se guarda
    automáticamente."
  - `index.tsx` implementa `handleSaveAvailability`, que llama a
    `updateStudentProfile(session.token, { availability })` y actualiza el
    estado local sin recargar toda la vista.
- Verificación por API: PUT y GET devuelven la misma matriz
  (`Lunes: Mañana, Tarde`; `Miércoles: Noche`; `Sábado: Mañana`) y la fila en
  SQLite conserva el JSON.

---

## 10. Estado de compilación y calidad

- `npx tsc --noEmit`: correcto.
- `npx expo lint`: correcto.
- `php -l` en controladores, modelo y migraciones: correcto.
- `php artisan migrate --force`: migración de horarios aplicada.
- `php artisan config:clear` y `php artisan config:cache`: correctos.
- Cambios pendientes de commit en este momento: ver `git status` en ambos
  repositorios (frontend `UniEmpleo`, backend `bolsa-empleo-unipaz-main`).

---

## 11. Datos de prueba y credenciales

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@unipaz.edu.co` | `AdminUNIPAZ2024*` |
| Empresa 2 | `info@tecnosoluciones.edu.co` | `EmpresaUNIPAZ2024*` |
| Empresa 3 | `contacto@distribuidoraregional.edu.co` | `EmpresaUNIPAZ2024*` |
| Estudiante | `Carlos.lopez@unipaz.edu.co` | `EstudianteUNIPAZ2024*` |

Datos creados durante las pruebas:
- Empresa 5 "Fundacion Semilla Local" en estado `pending`.
- Empresa 6 "MielesG&G" creada por el usuario (no eliminar).
- Notificaciones históricas ya leídas en admin y empresa 2.

---

## 12. Limitaciones conocidas

- Railway (`https://bolsa-empleo-unipaz-production.up.railway.app`) sirve la web
  Laravel, pero `/api/v1/*` responde 404; no hay credenciales para redesplegar.
- MySQL local detenido sin privilegios de administrador; la auditoría Prisma
  está desactivada localmente. Se usa SQLite.
- No hay emulador o dispositivo disponible; el arreglo nativo de notificaciones
  está verificado por compilación y lint, no en runtime móvil.
- No se pueden leer capturas adjuntas desde este modelo.
- Hallazgos menores de la auditoría aún no corregidos: tinta `#161D2E` en
  `theme.ts` frente a `#1A1F36` solicitado; índigo `#3B3F94`, `#EEF0FD` y
  `#D5D9F7` en `StatusBadge.tsx` y `HU06_PostulacionesView.tsx`; scaffolding
  muerto de Expo (`app-tabs*`, `explore.tsx`, `themed-*`, `animated-*`,
  `web-badge`); emojis/mojibake solo en scripts de Prisma; contrato NIT
  `nullable` frente a requerido; tres rutas duplicadas de mark-all en
  `routes/api.php:76-78`; `src/app/index.tsx` de más de 1700 líneas.
