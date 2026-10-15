# Bolsa de Empleo UNIPAZ — Versión Móvil

Documentación técnica y funcional completa del sistema adaptado para la arquitectura móvil: **Frontend Móvil con React Native** y **Backend API REST con Next.js**, diseñado para gestionar la intermediación laboral entre estudiantes, empresas y la administración del Instituto Universitario de la Paz (UNIPAZ).

---

## 1. Descripción general

El sistema de **Bolsa de Empleo UNIPAZ (Móvil)** permite:

- **Registrar empresas** interesadas en vincular talento universitario y publicar vacantes.
- **Aprobar o rechazar empresas** desde el panel de control administrativo.
- **Gestionar vacantes laborales** por parte de empresas aprobadas (crear, editar, pausar, cerrar).
- **Permitir a estudiantes buscar oportunidades laborales** desde sus dispositivos móviles (Android / iOS), aplicando filtros por área, modalidad, tipo de contrato y compatibilidad con horarios académicos.
- **Postularse a vacantes** adjuntando hoja de vida (CV en formato PDF) y carta de presentación.
- **Consultar y seguir el estado de cada postulación** en tiempo real (`pending`, `reviewed`, `interview`, `accepted`, `rejected`).
- **Recibir notificaciones push en el móvil y correos electrónicos automáticos** ante eventos clave del sistema.
- **Autenticación con Google institucional** (`@unipaz.edu.co`) para estudiantes mediante OAuth 2.0 nativo, y autenticación con correo/contraseña segura para empresas y administradores.

El proyecto está construido bajo una arquitectura desacoplada:
- **Frontend Móvil**: React Native con Expo SDK, React Navigation y componentes optimizados para pantallas táctiles.
- **Backend API REST**: Next.js (App Router / Route Handlers) con TypeScript y Node.js.
- **Capa de Datos**: Prisma ORM con motor relacional MySQL / MariaDB (o PostgreSQL).

---

## 2. Objetivo del sistema

Centralizar la bolsa de empleo institucional de UNIPAZ en una plataforma moderna y accesible desde dispositivos móviles, facilitando la conexión directa entre:

- **Estudiantes de UNIPAZ**: que requieren oportunidades de empleo o prácticas laborales compatibles con sus horarios de clase.
- **Empresas y empleadores**: que demandan talento humano universitario calificado en Barrancabermeja y la región del Magdalena Medio.
- **La Universidad (UNIPAZ)**: que supervisa, valida y audita la calidad y formalidad de los procesos de inserción laboral.

---

## 3. Roles del sistema

### Administrador
Funciones principales:
- Acceder al dashboard administrativo con métricas y KPIs consolidados.
- Revisar solicitudes de registro de empresas pendientes.
- Aprobar o rechazar empresas verificando NIT y personería jurídica.
- Gestionar cuentas de usuario (activar, suspender o reactivar cuentas).
- Supervisar todas las vacantes publicadas y postulaciones activas.
- Consultar y exportar reportes estadísticos por programas académicos, sectores empresariales y estados de aplicación.

### Empresa
Funciones principales:
- Completar el perfil corporativo (nombre, NIT, sector, contacto, logo e información general).
- Publicar ofertas laborales detallando funciones, requisitos, salario, modalidad y fecha de cierre.
- Editar, pausar, reactivar o dar por cerradas sus vacantes.
- Visualizar candidatos postulados y descargar sus hojas de vida en formato PDF.
- Registrar notas internas privadas (`company_notes`) no visibles para el postulante.
- Actualizar el estado de cada aplicación: `pending` (pendiente), `reviewed` (en revisión), `interview` (en entrevista), `accepted` (aceptado) o `rejected` (no seleccionado).

### Estudiante
Funciones principales:
- Iniciar sesión de forma rápida y segura con su cuenta institucional de Google (`@unipaz.edu.co`).
- Completar y mantener actualizado su perfil académico (código estudiantil, programa, semestre, teléfono, disponibilidad horaria y CV base).
- Explorar vacantes laborales en la app móvil con buscador interactivo y filtros avanzados.
- Consultar el detalle completo de cada oportunidad.
- Postularse en un solo toque adjuntando el CV del perfil o cargando uno nuevo desde el explorador de archivos del teléfono.
- Consultar el historial y estado de postulaciones con alertas visuales y notificaciones push.

---

## 4. Tecnologías utilizadas

### Frontend Móvil (App)
- **React Native (Expo SDK 51+)**: Desarrollo móvil multiplataforma nativo para Android e iOS.
- **TypeScript**: Tipado estático y robustez en toda la aplicación móvil.
- **React Navigation (v6 / v7)**: Navegación nativa con `NativeStackNavigator` y `BottomTabNavigator`.
- **NativeWind (Tailwind CSS para React Native)** / **React Native Paper**: Sistema de diseño moderno, accesible y responsivo.
- **Expo AuthSession / Google Sign-In**: Autenticación OAuth 2.0 nativa con Google.
- **Expo Document Picker & FileSystem**: Selección y manejo seguro de archivos PDF locales (hojas de vida).
- **Expo Notifications**: Gestión y recepción de notificaciones push en el dispositivo.
- **Axios & TanStack Query (React Query)**: Peticiones HTTP, caché local, reintentos y sincronización de datos offline/online.

### Backend (API REST & Panel de Gestión)
- **Next.js 14 / 15 (App Router)**: Framework full-stack para construir Route Handlers de alta velocidad en Node.js.
- **TypeScript**: Consistencia de tipos compartidos entre peticiones y respuestas.
- **Prisma ORM**: Modelado declarativo de base de datos, consultas tipo-seguras y migraciones automáticas.
- **MySQL / MariaDB**: Motor de base de datos relacional transaccional.
- **NextAuth.js / JWT**: Emisión, firma y validación de tokens Bearer para comunicación stateless con la app móvil.
- **Zod**: Validación estricta de payloads entrantes en los endpoints de la API.
- **Bcrypt / Argon2**: Hashing criptográfico unidireccional de contraseñas.
- **Nodemailer / Resend**: Servicio de envío de correos electrónicos transaccionales.
- **Expo Server SDK (Node.js)**: Servicio backend para despacho de notificaciones push a los dispositivos de los estudiantes.

---

## 5. Estructura del proyecto

El ecosistema está organizado como un repositorio monorepo o desacoplado con dos módulos principales:

```text
bolsa-empleo-unipaz/
├── apps/
│   ├── mobile/                          # Frontend React Native (Expo)
│   │   ├── assets/                      # Íconos, splash screen e imágenes
│   │   ├── src/
│   │   │   ├── api/                     # Clientes Axios y llamadas a endpoints
│   │   │   ├── components/              # Componentes UI reutilizables (Botones, Cards, Inputs)
│   │   │   ├── context/                 # Contextos de Autenticación y Notificaciones
│   │   │   ├── hooks/                   # Custom hooks (useAuth, useVacantes, usePostulaciones)
│   │   │   ├── navigation/              # Configuradores de Stack y Bottom Tabs
│   │   │   ├── screens/                 # Pantallas de la aplicación
│   │   │   │   ├── auth/                # Login, Registro de Empresa, Callback Google
│   │   │   │   ├── estudiante/          # Home, Detalle Vacante, Postulación, Perfil, Mis Postulaciones
│   │   │   │   ├── empresa/             # Dashboard Empresa, Mis Vacantes, Candidatos
│   │   │   │   └── admin/               # Panel Admin, Aprobación de Empresas
│   │   │   ├── types/                   # Definiciones de TypeScript e interfaces
│   │   │   └── utils/                   # Formateadores de fecha, moneda y almacenamiento
│   │   ├── app.json                     # Configuración de Expo y permisos
│   │   ├── babel.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── backend/                         # Backend API REST (Next.js App Router)
│       ├── prisma/
│       │   ├── schema.prisma            # Esquema relacional de la base de datos
│       │   ├── migrations/              # Historial de migraciones SQL
│       │   └── seed.ts                  # Datos iniciales para pruebas
│       ├── src/
│       │   ├── app/
│       │   │   └── api/                 # Route Handlers (Endpoints de la API)
│       │   │       ├── auth/            # Google OAuth, login, registro, refresh
│       │   │       ├── empresas/        # CRUD empresas, aprobación admin
│       │   │       ├── vacantes/        # Búsqueda, creación, edición, filtros
│       │   │       ├── postulaciones/   # Creación, listado y cambio de estados
│       │   │       ├── perfil/          # Gestión de perfiles y disponibilidad
│       │   │       ├── archivos/        # Carga y streaming seguro de CVs / logos
│       │   │       └── admin/           # KPIs, gestión de usuarios y reportes
│       │   ├── lib/
│       │   │   ├── prisma.ts            # Instancia singleton del cliente Prisma
│       │   │   ├── auth.ts              # Lógica JWT y configuración NextAuth
│       │   │   ├── email.ts             # Cliente de correo Nodemailer
│       │   │   ├── push.ts              # Envío de notificaciones Expo Push
│       │   │   └── storage.ts           # Gestión de archivos en disco privado / S3
│       │   ├── middleware.ts            # Middleware global para verificación de JWT y roles
│       │   └── schemas/                 # Validadores Zod para cada petición
│       ├── .env.example
│       ├── package.json
│       ├── tsconfig.json
│       └── next.config.mjs
├── docs/                                # Documentación del proyecto (Scrum, RF, RNF, Sprints)
└── README.md
```

---

## 6. Modelos principales (Prisma Schema)

A continuación se detalla la definición de los modelos en `prisma/schema.prisma`:

### User
Representa a cualquier usuario del sistema. Roles disponibles: `ADMIN`, `COMPANY`, `STUDENT`.
```prisma
model User {
  id             String          @id @default(uuid())
  name           String
  email          String          @unique
  password       String?
  role           Role            @default(STUDENT)
  googleId       String?         @unique @map("google_id")
  avatar         String?
  active         Boolean         @default(true)
  pushToken      String?         @map("push_token")
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  studentProfile StudentProfile?
  company        Company?
  applications   Application[]
  notifications  Notification[]

  @@map("users")
}

enum Role {
  ADMIN
  COMPANY
  STUDENT
}
```

### Company
Representa la empresa registrada. Estados: `PENDING`, `APPROVED`, `REJECTED`.
```prisma
model Company {
  id            String        @id @default(uuid())
  userId        String        @unique @map("user_id")
  companyName   String        @map("company_name")
  nit           String?       @unique
  sector        String?
  contactPerson String?       @map("contact_person")
  phone         String?
  address       String?
  description   String?       @db.Text
  logoPath      String?       @map("logo_path")
  status        CompanyStatus @default(PENDING)
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobPostings   JobPosting[]

  @@map("companies")
}

enum CompanyStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### JobPosting
Representa una vacante publicada por una empresa aprobada.
```prisma
model JobPosting {
  id               String       @id @default(uuid())
  companyId        String       @map("company_id")
  title            String
  description      String       @db.Text
  requirements     String?      @db.Text
  responsibilities String?      @db.Text
  area             String
  contractType     String       @map("contract_type")
  modality         String       // "Presencial", "Remoto", "Híbrido"
  location         String?
  salaryRange      String?      @map("salary_range")
  positions        Int          @default(1)
  deadline         DateTime
  status           JobStatus    @default(ACTIVE)
  programsTargeted String?      @map("programs_targeted") // Lista en JSON o separada por comas
  createdAt        DateTime     @default(now()) @map("created_at")
  updatedAt        DateTime     @updatedAt @map("updated_at")

  company          Company      @relation(fields: [companyId], references: [id], onDelete: Cascade)
  applications     Application[]

  @@map("job_postings")
}

enum JobStatus {
  ACTIVE
  PAUSED
  CLOSED
}
```

### Application
Representa la postulación de un estudiante a una vacante.
```prisma
model Application {
  id           String            @id @default(uuid())
  userId       String            @map("user_id")
  jobPostingId String            @map("job_posting_id")
  coverLetter  String?           @db.Text @map("cover_letter")
  cvPath       String            @map("cv_path")
  status       ApplicationStatus @default(PENDING)
  companyNotes String?           @db.Text @map("company_notes") // Privado, no visible al estudiante
  createdAt    DateTime          @default(now()) @map("created_at")
  updatedAt    DateTime          @updatedAt @map("updated_at")

  user         User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobPosting   JobPosting        @relation(fields: [jobPostingId], references: [id], onDelete: Cascade)

  @@unique([userId, jobPostingId])
  @@map("applications")
}

enum ApplicationStatus {
  PENDING
  REVIEWED
  INTERVIEW
  ACCEPTED
  REJECTED
}
```

### StudentProfile
Perfil académico, profesional y de disponibilidad del estudiante.
```prisma
model StudentProfile {
  id           String   @id @default(uuid())
  userId       String   @unique @map("user_id")
  studentCode  String?  @map("student_code")
  program      String?
  semester     Int?
  phone        String?
  about        String?  @db.Text
  cvPath       String?  @map("cv_path")
  linkedin     String?
  availability String?  // Disponibilidad horaria (mañana, tarde, noche, flexible)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("student_profiles")
}
```

---

## 7. Flujo principal del sistema

### Registro y habilitación de empresa
1. El usuario accede a la pantalla de registro de empresa en la app móvil o web.
2. Ingresa correo institucional corporativo, contraseña, NIT y datos de contacto.
3. Se crea el registro `User` con rol `COMPANY` y el registro `Company` con estado inicial `PENDING`.
4. El administrador recibe notificación de una nueva empresa por aprobar.

### Aprobación administrativa
1. El administrador ingresa a su módulo (`/api/admin/empresas`).
2. Verifica la validez del NIT y los datos de la empresa.
3. Aprueba o rechaza la solicitud.
4. Al aprobar, el backend dispara un correo electrónico transaccional notificando al representante que ya puede publicar vacantes.

### Publicación y control de vacantes
1. La empresa autenticada accede a la sección de publicación desde la app.
2. Diligencia los campos obligatorios: título, descripción, requisitos, área, modalidad, contrato, fecha límite y vacantes disponibles.
3. El backend valida el payload con Zod y guarda la oferta en estado `ACTIVE`.
4. La vacante permanece visible mientras `status == ACTIVE` y la fecha actual no supere el `deadline`.

### Postulación del estudiante desde el móvil
1. El estudiante abre la app e inicia sesión mediante el botón **"Continuar con Google"** (cuenta `@unipaz.edu.co`).
2. Explora las vacantes en tarjetas dinámicas con filtros instantáneos por área, modalidad y jornada.
3. Selecciona la vacante de interés y presiona el botón **"Postularme"**.
4. Puede elegir usar el CV ya cargado en su perfil o seleccionar un archivo PDF desde su teléfono con el explorador nativo.
5. El backend registra la postulación en estado `PENDING`, guarda el archivo en almacenamiento seguro y envía notificación push/email a la empresa.

### Gestión de postulaciones y retroalimentación
1. La empresa consulta las postulaciones en su bandeja de entrada móvil.
2. Descarga el CV de cada aspirante mediante un enlace protegido de streaming seguro.
3. Cambia el estado a `REVIEWED`, `INTERVIEW`, `ACCEPTED` o `REJECTED`, pudiendo anotar observaciones privadas en `company_notes`.
4. Cada cambio de estado genera una **notificación push instantánea** en el teléfono del estudiante y un correo con el detalle del avance del proceso.

---

## 8. Rutas y Endpoints principales (Next.js API)

Todos los endpoints retornan respuestas estándar en formato JSON:

### Autenticación (`/api/auth`)
- `POST /api/auth/google`: Recibe `id_token` de Google OAuth, valida dominio `@unipaz.edu.co` y retorna JWT de sesión.
- `POST /api/auth/login`: Autenticación para empresas y administradores (email + password).
- `POST /api/auth/register-company`: Registro de nuevas empresas con validación de unicidad de NIT y correo.
- `GET /api/auth/me`: Retorna los datos y perfil del usuario autenticado.
- `POST /api/auth/push-token`: Registra o actualiza el Expo Push Token del dispositivo móvil del usuario.

### Estudiante (`/api/estudiante`)
- `GET /api/estudiante/perfil`: Consulta el perfil académico y disponibilidad horaria.
- `PUT /api/estudiante/perfil`: Actualiza datos académicos, de contacto y disponibilidad.
- `POST /api/estudiante/cv`: Sube o actualiza la hoja de vida base en PDF.
- `GET /api/estudiante/postulaciones`: Retorna el historial de vacantes a las que el estudiante ha aplicado con su estado actual.

### Vacantes (`/api/vacantes`)
- `GET /api/vacantes`: Listado público/autenticado con paginación (`page`, `limit`) y filtros (`area`, `modalidad`, `contrato`, `search`).
- `GET /api/vacantes/[id]`: Detalle completo de una vacante y estado de postulación si el estudiante ya aplicó.
- `POST /api/vacantes`: Creación de vacante (restringido a empresas con estado `APPROVED`).
- `PUT /api/vacantes/[id]`: Edición de vacante propia.
- `PATCH /api/vacantes/[id]/status`: Cambio de estado (`ACTIVE`, `PAUSED`, `CLOSED`).
- `DELETE /api/vacantes/[id]`: Eliminación lógica o física de la vacante.

### Postulaciones (`/api/postulaciones`)
- `POST /api/vacantes/[id]/postular`: Envío de postulación con carta y CV (adjunto o de perfil).
- `GET /api/empresa/vacantes/[id]/postulaciones`: Listado de candidatos postulados a una vacante específica.
- `PATCH /api/postulaciones/[id]/estado`: Actualización de estado del candidato y notas privadas por la empresa.

### Archivos (`/api/archivos`)
- `GET /api/archivos/cv/[applicationId]`: Streaming seguro de descarga de hoja de vida, protegido por autenticación y validación de propiedad (solo empresa receptora, estudiante dueño o admin).

### Administrador (`/api/admin`)
- `GET /api/admin/kpis`: Métricas globales (total estudiantes, empresas aprobadas, vacantes activas, postulaciones).
- `GET /api/admin/empresas`: Listado paginado de empresas con filtro por estado (`PENDING`, `APPROVED`, `REJECTED`).
- `PATCH /api/admin/empresas/[id]/aprobar`: Habilitación de una empresa.
- `PATCH /api/admin/empresas/[id]/rechazar`: Rechazo de una empresa con motivo.
- `GET /api/admin/usuarios`: Listado de usuarios con switch de activación/desactivación.
- `GET /api/admin/reportes`: Agrupación de datos para gráficos y reportes exportables a Excel.

---

## 9. Middleware y control de acceso

El archivo `src/middleware.ts` en Next.js intercepta las peticiones dirigidas a `/api/*`:

1. **Extracción del Token**: Lee el token Bearer del header `Authorization: Bearer <JWT>` o la cookie de sesión NextAuth.
2. **Validación de Firma**: Verifica la validez y expiración del JWT con la clave secreta `JWT_SECRET`.
3. **Control de Rol**:
   - Rutas `/api/admin/*` requieren `role === 'ADMIN'`.
   - Rutas `/api/empresa/*` y creación de vacantes requieren `role === 'COMPANY'`.
   - Rutas `/api/estudiante/*` requieren `role === 'STUDENT'`.
4. **Verificación de Empresa Aprobada**: Para publicar o editar vacantes, valida que `company.status === 'APPROVED'`. En caso contrario, retorna código HTTP `403 Forbidden`.
5. **Usuario Activo**: Si `user.active === false`, se deniega inmediatamente el acceso con código HTTP `401 Unauthorized`.

---

## 10. Base de datos y migraciones

El esquema se gestiona a través de **Prisma**:

- **Ejecutar migraciones en desarrollo**:
  ```bash
  npx prisma migrate dev --name init_mobile_schema
  ```
- **Generar cliente de Prisma tras cambios en el schema**:
  ```bash
  npx prisma generate
  ```
- **Poblar la base de datos con datos de prueba (Seed)**:
  ```bash
  npx prisma db seed
  ```
- **Abrir interfaz gráfica de la base de datos**:
  ```bash
  npx prisma studio
  ```

---

## 11. Requisitos de instalación

### Requisitos del entorno
- **Node.js**: Versión `>= 18.18.0` o `>= 20.x LTS`.
- **Gestor de paquetes**: `npm` (>= 9.x), `yarn` o `pnpm`.
- **Motor de Base de Datos**: MySQL 8.0+ / MariaDB 10.5+ o PostgreSQL 14+.
- **Expo CLI**: Integrado mediante `npx expo`.
- **Herramientas de emulación móvil**:
  - Para Android: Android Studio con Android SDK configurado y emulador AVD, o la app **Expo Go** en un teléfono físico Android.
  - Para iOS: macOS con Xcode y simulador iOS, o la app **Expo Go** en un dispositivo físico iPhone.

---

## 12. Instalación rápida

### Paso 1: Clonar el repositorio y configurar el backend
```bash
cd apps/backend
npm install
cp .env.example .env
# Configurar credenciales de DB, Google OAuth y JWT en .env
npx prisma migrate dev
npx prisma db seed
npm run dev
# El backend estará disponible en http://localhost:3000
```

### Paso 2: Configurar y ejecutar la app móvil (React Native)
```bash
cd ../mobile
npm install
cp .env.example .env
# Configurar EXPO_PUBLIC_API_URL con la IP local de la máquina de desarrollo (ej: http://192.168.1.50:3000)
npx expo start
```
*Escanear el código QR resultante desde la app **Expo Go** en el teléfono móvil o presionar `a` para abrir el emulador de Android.*

---

## 13. Variables de entorno

### Backend (`apps/backend/.env`)
```env
# Servidor y Entorno
NODE_ENV=development
PORT=3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto_super_seguro_para_jwt

# Base de datos
DATABASE_URL="mysql://root:password@127.0.0.1:3306/bolsa_empleo_unipaz"

# Autenticación con Google
GOOGLE_CLIENT_ID="tu_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu_google_client_secret"

# Servicio de Correo Transaccional (Nodemailer / SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=bolsaempleo@unipaz.edu.co
MAIL_PASS=tu_app_password
MAIL_FROM="Bolsa de Empleo UNIPAZ <bolsaempleo@unipaz.edu.co>"

# Almacenamiento de Archivos (Local privado o AWS S3)
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH="./storage/private"

# Notificaciones Push
EXPO_ACCESS_TOKEN=tu_expo_access_token_opcional
```

### Frontend Móvil (`apps/mobile/.env`)
```env
# URL de la API de Next.js (utilizar la IP local para pruebas en dispositivos físicos)
EXPO_PUBLIC_API_URL=http://192.168.1.50:3000/api
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=tu_google_client_id_android
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=tu_google_client_id_ios
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=tu_google_client_id_web
```

---

## 14. Autenticación con Google para estudiantes

1. En la app móvil, el estudiante presiona **"Continuar con Google"**.
2. Expo `AuthSession` o `@react-native-google-signin/google-signin` solicita la autorización al usuario en pantalla nativa.
3. Se obtiene un `id_token` firmado por Google y se envía por POST a `/api/auth/google`.
4. En el backend Next.js:
   - Se valida la firma y autenticidad del token con la librería oficial `google-auth-library`.
   - Se comprueba que el dominio del correo sea estrictamente `@unipaz.edu.co`. Si no pertenece a la institución, se rechaza la autenticación (`403 Acceso restringido al correo institucional UNIPAZ`).
   - Si el estudiante no existe en base de datos, se crea automáticamente su usuario con rol `STUDENT` y su registro `StudentProfile`.
   - Se emite un JWT firmado que la app móvil almacena en `Expo SecureStore` para autenticar todas las peticiones subsiguientes.

---

## 15. Notificaciones (Push y Correo Electrónico)

### Notificaciones Push (Dispositivo Móvil)
- Al iniciar sesión en la app, se solicita permiso de notificaciones y se obtiene el `ExpoPushToken`.
- Este token se registra en la base de datos asociado al usuario.
- Cuando una empresa actualiza el estado de una postulación (ej: de `pending` a `interview`), el backend envía una notificación push mediante `expo-server-sdk` al móvil del estudiante:  
  *“¡Novedad en tu postulación! La empresa [Nombre] ha agendado una entrevista para la vacante [Título]”*.

### Correos Electrónicos Transaccionales
Se despachan mediante Nodemailer ante los siguientes eventos:
- Bienvenida y aviso de aprobación de empresa por el administrador.
- Alerta a la empresa ante una nueva postulación recibida con los datos del estudiante.
- Notificación al estudiante con carta formal cuando su postulación pasa a aceptada o rechazada.

---

## 16. Gestión de archivos y CVs

- **Selección de archivo**: El estudiante utiliza `expo-document-picker` para seleccionar su hoja de vida en PDF desde su teléfono.
- **Validación**: Se verifica que el archivo no supere los 5 MB y que su tipo MIME sea estrictamente `application/pdf`.
- **Almacenamiento**: La subida se realiza mediante `multipart/form-data`. El backend almacena el archivo en una carpeta privada fuera del alcance público del servidor web o en un bucket privado S3 con nombres únicos (UUID).
- **Descarga y visualización**: Los CVs nunca se exponen por URL pública directa. Se accede mediante el endpoint `/api/archivos/cv/[id]`, el cual valida los permisos de sesión y realiza un streaming del archivo con cabeceras `Content-Type: application/pdf` y `Content-Disposition: inline`.

---

## 17. Seguridad y buenas prácticas

- **Validación con esquemas Zod**: Toda entrada de datos a la API pasa por esquemas estrictos que previenen inyecciones y datos malformados.
- **Almacenamiento seguro en el móvil**: Tokens de sesión y credenciales sensibles se guardan en `Expo SecureStore` (cifrado a nivel de hardware con Keychain en iOS y Keystore en Android).
- **Rate Limiting**: Protección en endpoints de autenticación contra ataques de fuerza bruta mediante `@upstash/ratelimit` o limitador en memoria.
- **Privacidad estricta**: El campo `company_notes` de la postulación está filtrado en el ORM para que nunca viaje en las respuestas de la API destinadas al estudiante.
- **Cifrado de contraseñas**: Contraseñas de empresas y administradores encriptadas con `bcrypt` (12 rondas de salting).
- **Sanitización y control de archivos**: Validación de firmas de cabecera en archivos PDF para evitar malware.

---

## 18. Comandos útiles

### Backend (Next.js)
```bash
npm run dev               # Iniciar servidor de desarrollo en puerto 3000
npm run build             # Compilar para producción
npm run start             # Ejecutar build de producción
npx prisma migrate dev    # Aplicar migraciones pendientes
npx prisma studio         # Explorador visual de base de datos
npx prisma db seed        # Poblar datos de prueba
```

### Frontend Móvil (React Native / Expo)
```bash
npx expo start            # Iniciar metro bundler
npx expo start -c         # Iniciar limpiando caché
npx expo run:android      # Ejecutar directamente en emulador Android nativo
npx expo run:ios          # Ejecutar directamente en simulador iOS (macOS)
npx expo lint             # Comprobar reglas de código y tipos
```

---

## 19. Despliegue

### Backend API (Next.js)
- Puede desplegarse en plataformas como **Vercel**, **Railway**, **Render** o un servidor **VPS Linux** con Docker.
- Se configuran las variables de entorno de producción (`DATABASE_URL`, `JWT_SECRET`, credenciales de correo y Google).
- Se ejecutan las migraciones de producción: `npx prisma migrate deploy`.

### Frontend Móvil (React Native)
- Utilizando **EAS (Expo Application Services)**:
  ```bash
  npm install -g eas-cli
  eas login
  eas build:configure
  ```
- **Generar APK para pruebas en Android**:
  ```bash
  eas build -p android --profile preview
  ```
- **Generar AAB (Android App Bundle) para publicación en Google Play Store**:
  ```bash
  eas build -p android --profile production
  ```
- **Generar build para Apple TestFlight / App Store**:
  ```bash
  eas build -p ios --profile production
  ```

---

## 20. Resumen funcional

El sistema móvil cubre de manera integral el ciclo de vida de la intermediación laboral en UNIPAZ:
1. **Administración**: Valida y certifica empresas reales, garantizando ofertas formales y de calidad.
2. **Empresas**: Publican vacantes con requerimientos detallados y gestionan a los postulantes de forma ágil desde cualquier lugar.
3. **Estudiantes**: Acceden a vacantes reales compatibles con sus horarios de estudio, envían su CV con un clic y reciben notificaciones push en su celular a lo largo de todo el proceso de selección.

---

## 21. Licencia

Este proyecto está licenciado bajo la licencia **MIT**, permitiendo su uso, adaptación y extensión con propósitos institucionales y educativos.

---

## 22. Referencias dentro del repositorio

- `docs/vision-y-alcance.md`: Documento de alcance y matriz MoSCoW.
- `docs/requisitos.md`: Requerimientos funcionales y no funcionales detallados.
- `docs/flujo-de-trabajo.md`: Convenciones Scrum, ramas de Git y flujo de trabajo.
- `docs/backlog.md`: Product Backlog con épicas e historias de usuario (HU-01 a HU-20).
- `docs/tablero.md`: Tablero Kanban de seguimiento por sprint.
- `docs/criterios/`: Criterios de aceptación de historias de usuario en formato Gherkin (`.feature`).
- `docs/sprints/sprint-0.md`: Planificación y entregables del Sprint 0.
- `docs/sprints/sprint-1.md`: Planificación y backlog del Sprint 1.
- `docs/examen-sprint1.md`: Rúbrica y checklist de evaluación del Sprint 1.
- `documentación/`: Archivos complementarios, diagramas entidad-relación y requerimientos base.

---

## 23. Recomendación final de desarrollo

Para avanzar ordenadamente en el desarrollo de la versión móvil:

1. **Configurar el Backend Next.js**: Levantar la base de datos MySQL, ejecutar `npx prisma migrate dev` y validar los endpoints de autenticación iniciales (`/api/auth`).
2. **Configurar la App Móvil**: Inicializar el proyecto con Expo, configurar `React Navigation` y validar la conexión HTTP con el backend mediante `EXPO_PUBLIC_API_URL`.
3. **Autenticación Estudiantil**: Probar el flujo de inicio de sesión con Google restringiendo a `@unipaz.edu.co` y almacenar el token en `SecureStore`.
4. **Módulo de Vacantes y Filtros**: Implementar el consumo del listado de vacantes y los filtros por área y disponibilidad horaria.
5. **Carga de CV y Postulación**: Integrar `expo-document-picker` y el endpoint de postulación con carga de PDF.
6. **Notificaciones Push**: Conectar `Expo Notifications` para alertar al estudiante sobre cambios en el estado de sus postulaciones.
