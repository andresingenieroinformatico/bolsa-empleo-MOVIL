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
Ubicarse en el directorio del proyecto Laravel e iniciar el servidor:
```powershell
cd <ruta-del-backend-Laravel>
php artisan serve --host=127.0.0.1 --port=8000
```
> *(Disponible en `http://127.0.0.1:8000/api/v1`)*

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

### Despliegue del gateway en Railway

El host Laravel y el gateway Next.js son servicios distintos. En Railway crea
un servicio adicional desde este repositorio y configura:

- **Root directory:** `/UniEmpleo/src/Api`
- **Build command:** `npx prisma generate && npm run build`
- **Start command:** `npm run start`
- **Variables:** `DATABASE_URL`, `LARAVEL_API_URL` (host base Laravel sin
  `/api/v1`), `CORS_ALLOWED_ORIGINS` y `JWT_SECRET`.

Al terminar, usa el dominio generado para el servicio Next.js como
`EXPO_PUBLIC_API_URL`, añadiendo `/api/v1`. El dominio Laravel que ya existe no
es el gateway: el gateway atiende las rutas móviles y reenvía cada solicitud a
Laravel. El health check de Railway puede usar `/api/v1`; responde 200 solo si
la ruta pública `GET /api/v1/jobs` de Laravel responde correctamente.

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
