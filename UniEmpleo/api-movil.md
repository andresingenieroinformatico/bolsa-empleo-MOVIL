# API móvil

La API JSON está versionada bajo `/api/v1`. Para las rutas protegidas, envía el token de Sanctum en `Authorization: Bearer <token>` y `Accept: application/json`. Los errores de validación devuelven HTTP 422 y las rutas de cada rol responden HTTP 403 cuando la cuenta no tiene permisos.

Al desplegar cambios, ejecuta `php artisan migrate` para crear la tabla de tokens de Sanctum.

## Autenticación

`POST /api/v1/auth/login`

```json
{
  "email": "estudiante@unipaz.edu.co",
  "password": "contraseña",
  "device_name": "android"
}
```

La respuesta contiene `token`, `token_type` y el usuario. Guarda el token de forma segura en la app. Para cerrar la sesión de ese dispositivo usa `POST /api/v1/auth/logout`; `GET /api/v1/auth/me` es el alias público del gateway y devuelve los datos del usuario autenticado (`GET /api/v1/me` en Laravel).

Para iniciar sesión como estudiante con contraseña, la cuenta debe tener un correo `@unipaz.edu.co` verificado. Las cuentas de empresa y administración pueden usar el inicio de sesión con contraseña registrado para su rol.

Para estudiantes que usan Google, `POST /api/v1/auth/google` recibe `id_token` y `device_name`. La app debe solicitar el ID token con el client ID de servidor configurado en Laravel; el backend verifica el token y solo acepta correos institucionales `@unipaz.edu.co` verificados.

`POST /api/v1/auth/register/company` registra empresas y las deja en estado `pending`; el administrador debe aprobarlas antes de que puedan gestionar vacantes. `name`, `email`, `password`, `password_confirmation`, `company_name` y `contact_person` son obligatorios. `nit`, `sector`, `phone`, `address` y `description` son opcionales; la empresa puede completar su perfil después.

## Vacantes

- `GET /api/v1/jobs`: vacantes activas; acepta `search`, `area`, `modality`, `contract_type`, `location` y `page`.
- `GET /api/v1/jobs/{id}`: detalle de una vacante activa.
- `GET /api/v1/student/favorites`: vacantes favoritas del estudiante autenticado.
- `PUT /api/v1/jobs/{id}/favorite`: guardar como favorita.
- `DELETE /api/v1/jobs/{id}/favorite`: quitar de favoritos.

Las listas devuelven la estructura de paginación de Laravel (`data`, `links` y `meta`).

## Perfil y postulaciones

- `PUT /api/v1/student/profile`: actualiza el perfil. Envíalo como `multipart/form-data` si incluye `cv` (PDF, máximo 20 MB). `program` es obligatorio.
- `POST /api/v1/student/profile/cv`: reemplaza la hoja de vida del perfil existente; recibe `cv` como PDF de hasta 5 MB.
- `POST /api/v1/jobs/{id}/applications`: crea una postulación; recibe `cover_letter` opcional y `cv` opcional en PDF. Se usa el CV del perfil si no se adjunta uno. Si la vacante requiere CV y no hay uno en el perfil, `cv` es obligatorio.
- `GET /api/v1/student/applications`: historial paginado de postulaciones.
- `GET /api/v1/student/profile`: consulta el perfil del estudiante.

## Empresas

Las rutas `/api/v1/company/*` requieren una cuenta activa con rol `company`.

- `GET /api/v1/company/dashboard`, `GET /api/v1/company/reports`
- `GET|PUT /api/v1/company/profile` (envía `logo` como imagen multipart si se actualiza)
- `GET|POST /api/v1/company/jobs`
- `GET|PUT|DELETE /api/v1/company/jobs/{id}`; `DELETE` cierra la vacante
- `GET /api/v1/company/applications` (filtros opcionales `status` y `job`)
- `GET /api/v1/company/applications/{id}`
- `PUT /api/v1/company/applications/{id}/status` con `status` y `company_notes` opcional

Solo la empresa propietaria puede consultar o modificar sus vacantes y postulaciones. Publicar, actualizar o cerrar vacantes requiere que la empresa esté aprobada.

Al crear o actualizar vacantes, `schedule` es opcional (texto de hasta 191 caracteres) y `programs_targeted` es opcional (texto de hasta 500 caracteres). La app móvil envía los programas seleccionados como una lista; el gateway los convierte al texto separado por comas que almacena Laravel. Las respuestas incluyen `schedule` y `programs_targeted`.

## Administración

Las rutas `/api/v1/admin/*` requieren una cuenta activa con rol `admin`.

- `GET /api/v1/admin/dashboard`, `GET /api/v1/admin/reports`
- `GET|PUT /api/v1/admin/profile`
- `GET /api/v1/admin/companies` (filtros opcionales `status` y `search`)
- `POST /api/v1/admin/companies/{id}/approve`, `POST /api/v1/admin/companies/{id}/reject`, `DELETE /api/v1/admin/companies/{id}`
- `GET /api/v1/admin/users` (filtros opcionales `role` y `search`), `PATCH /api/v1/admin/users/{id}/toggle`
- `GET /api/v1/admin/jobs` (filtros opcionales `status`, `area` y `search`)
- `GET /api/v1/admin/jobs/{id}`, `PATCH /api/v1/admin/jobs/{id}/toggle`

## Funciones compartidas

- `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/{id}/read`, `PATCH /api/v1/notifications/read-all`
- `GET /api/v1/laws` (filtro opcional `category`), `GET /api/v1/laws/{id}`. Solo devuelve normas activas aplicables al rol autenticado.

Las listas devuelven la estructura de paginación de Laravel (`data`, `links` y `meta`). Credenciales inválidas devuelven HTTP 422 y una postulación duplicada devuelve HTTP 409.
