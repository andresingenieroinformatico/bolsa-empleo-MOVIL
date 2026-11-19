# Backend API REST Bridge - Bolsa de Empleo UNIPAZ (UniEmpleo)

API REST oficial desarrollada con **Next.js 14 (App Router)**, **Node.js**, **TypeScript** y **Prisma ORM**, configurada como capa puente (API Gateway) para conectar la aplicación móvil **UniEmpleo** (React Native / Expo) con el backend central existente en **Laravel 12** (`http://127.0.0.1:8000`).

---

## 🏛️ Arquitectura de Integración

```text
[ App Móvil Expo (UniEmpleo) ]
            │
            ▼ (HTTP REST JSON / Multipart)
[ Next.js API REST Bridge (Puerto 3000) ] ── (Auditoría) ──> [ Prisma ORM & MySQL :3306 ]
            │
            ▼ (Forward con Bearer Token & FormData)
[ Laravel 12 Backend Core (Puerto 8000) ] ─────────────────> [ MySQL bolsa_empleo_unipaz ]
```

---

## 🚀 Comandos para Iniciar Ambos Servidores

### Terminal 1: Backend Central de Laravel (Puerto 8000)
Ubicarse en el directorio del proyecto Laravel. La primera vez hay que crear el
`.env`, la base SQLite y sembrar los datos de prueba:
```powershell
cd <ruta-del-backend-Laravel>
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```
> *(Disponible en `http://127.0.0.1:8000/api/v1`)*

Si `php artisan serve` no logra abrir el puerto (ocurre con algunas
instalaciones de PHP en Windows), sirve el proyecto directamente desde
`public`:
```powershell
cd public
php -S 127.0.0.1:8000 -t . "..\vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php"
```

Verifica el backend antes de arrancar el gateway:
```powershell
Invoke-WebRequest http://127.0.0.1:8000/api/v1/jobs -UseBasicParsing
```

### Terminal 2: API REST Oficial en Next.js (Puerto 3000)
Ubicarse en el directorio del proyecto Next.js e iniciar el servidor:
```powershell
cd UniEmpleo\src\Api
npm run dev
# O para producción:
npm run build
npm run start
```
> *(Disponible en `http://localhost:3000/api/v1`)*

El gateway escucha en todas las interfaces (`0.0.0.0`) para que un dispositivo
físico en la misma red pueda conectarse. Configura `EXPO_PUBLIC_API_URL` en la
app con la IP LAN del equipo donde corre Next.js, por ejemplo
`http://192.168.1.20:3000/api/v1`; `localhost` desde un teléfono apunta al mismo
teléfono. En el emulador Android usa `http://10.0.2.2:3000/api/v1`.

La app debe apuntar al gateway Next.js. `LARAVEL_API_URL` es solo para la
conexión servidor a servidor del gateway hacia Laravel y debe contener el host
base, sin `/api/v1`. Verifica primero `GET /api/v1` en el gateway: debe responder
HTTP 200 con `data.architecture.laravel_connected: true`. Si Laravel no es
alcanzable o no tiene `GET /api/v1/jobs`, responde HTTP 503 con estado `degraded`.
Después prueba el login. No uses como `EXPO_PUBLIC_API_URL` un dominio que solo
publique Laravel o la web.

### Despliegue en Render

Laravel y Next.js son servicios independientes. La guía
[DEPLOY-RENDER.md](../../../../Bolsa-empleo-unipaz-main/DEPLOY-RENDER.md)
describe bases de datos, variables de entorno, Docker, almacenamiento
persistente, health checks y la configuración que debe llevar la build Expo.
El dominio que se asigna a Next.js es el que se configura como
`EXPO_PUBLIC_API_URL`; `LARAVEL_API_URL` es solo para la conexión interna del
gateway con Laravel.

---

## 🧪 Ejecución de Pruebas Automatizadas (Sprint 3)

Para verificar el flujo completo de extremo a extremo (Autenticación, subida de CV en PDF, creación de vacante, postulación, bloqueo de duplicados 422, verificación de privacidad de `company_notes`, cambio de estado a entrevista y auditoría en Prisma ORM):

```powershell
cd UniEmpleo\src\Api
npm run test:sprint3
```

---

## 👥 Credenciales de Prueba

No se guardan credenciales de prueba en el repositorio. Configura los usuarios y
contraseñas de tu entorno en `TEST_STUDENT_EMAIL`, `TEST_STUDENT_PASSWORD`,
`TEST_COMPANY_EMAIL`, `TEST_COMPANY_PASSWORD`, `TEST_ADMIN_EMAIL` y
`TEST_ADMIN_PASSWORD` antes de ejecutar `npm run test:sprint3`. Usa cuentas de
prueba aisladas, no cuentas personales o de producción.

El seeder elimina los registros existentes y solo se ejecuta en entornos
`development` o `test` cuando `ALLOW_DESTRUCTIVE_SEED=true` y las tres variables
`SEED_*_PASSWORD` tienen contraseñas de al menos 16 caracteres.

---

## 📂 Estructura de Endpoints Disponibles en Next.js (`app/api/v1/`)

```text
app/api/v1/
├── route.ts                            # GET: Estado general y salud del puente
├── auth/
│   ├── login/route.ts                  # POST: Login (Token Sanctum)
│   ├── me/route.ts                     # GET: Usuario autenticado
│   ├── logout/route.ts                 # POST: Cerrar sesión
│   ├── google/route.ts                 # POST: Auth con Google Workspace (@unipaz.edu.co)
│   ├── register/student/route.ts       # POST: Registro de estudiantes
│   └── register/company/route.ts       # POST: Registro de empresas
├── students/ (y student/)
│   ├── profile/route.ts                # GET/PUT: Perfil académico
│   └── upload-cv/route.ts              # POST: Subida de hoja de vida en PDF (máx 5MB)
├── companies/ (y company/)
│   ├── profile/route.ts                # GET/PUT: Perfil comercial
│   ├── status/route.ts                 # GET: Estado de aprobación
│   └── jobs/route.ts                   # GET/POST: Gestión de vacantes de la empresa
├── jobs/
│   ├── route.ts                        # GET (búsqueda/filtros) / POST (crear vacante)
│   ├── [id]/route.ts                   # GET (detalle) / PUT (actualizar)
│   └── [id]/apply/route.ts             # POST: Postulación directa por ID
├── applications/
│   ├── route.ts                        # POST: Postulación (evita duplicados con 422)
│   ├── student/route.ts                # GET: Postulaciones del estudiante (SIN company_notes)
│   ├── job/[jobId]/route.ts            # GET: Candidatos para la empresa
│   └── [id]/status/route.ts            # PUT: Actualizar estado y registrar notas internas
├── notifications/
│   ├── route.ts                        # GET: Notificaciones recibidas
│   ├── [id]/read/route.ts              # PUT/PATCH: Marcar como leída
│   ├── unread-count/route.ts           # GET: Conteo de no leídas
│   └── mark-all-read/route.ts          # POST: Marcar todas como leídas
└── admin/
    ├── companies/route.ts              # GET: Listado de empresas
    ├── companies/pending/route.ts      # GET: Empresas pendientes
    └── companies/[id]/approve/route.ts # PUT/POST: Aprobar o rechazar empresas
```

---

## 🛡️ Prisma ORM: Auditoría y Cumplimiento

Cada solicitud procesada por el cliente puente [`lib/laravel-bridge.ts`](file:///c:/xampp/htdocs/API-REST/lib/laravel-bridge.ts) registra automáticamente un evento en MySQL en la tabla `api_audit_logs`:
- Endpoint y método HTTP.
- Código de respuesta retornado.
- Tiempo de ejecución en milisegundos (`duration_ms`).
- Correo del usuario autenticado (si aplica).
- Dirección IP del cliente.

La auditoría nunca bloquea la respuesta al cliente. Si MySQL no está disponible
(por ejemplo, en un equipo de desarrollo que solo usa la base SQLite de Laravel),
define `AUDIT_LOG_ENABLED="false"` en `src/Api/.env.local` para desactivarla y
evitar errores de Prisma en cada solicitud. Cualquier otra ruta del gateway sigue
funcionando porque la lógica de negocio vive en Laravel.
