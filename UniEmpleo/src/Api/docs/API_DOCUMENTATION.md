# DOCUMENTACIÓN TÉCNICA DE LA API REST BRIDGE (Next.js -> Laravel 12)
## Sistema de Bolsa de Empleo UNIPAZ (UniEmpleo)

**Base URL Gateway (Next.js):** `http://localhost:3000/api/v1`  
**Backend Core (Laravel):** `http://127.0.0.1:8000/api/v1`

---

## 1. Módulo de Autenticación (`/api/v1/auth`)

### 1.1 Iniciar Sesión (Login)
- **Método:** `POST`
- **URL:** `/api/v1/auth/login`
- **Headers:** `Content-Type: application/json`, `Accept: application/json`
- **Cuerpo (JSON):**
```json
{
  "email": "carlos.lopez@unipaz.edu.co",
  "password": "EstudianteUNIPAZ2024*"
}
```
- **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso.",
  "data": {
    "token": "8|mE2QVprVgqqSd...",
    "user": {
      "id": 4,
      "name": "Carlos Andrés López",
      "email": "carlos.lopez@unipaz.edu.co",
      "role": "student",
      "student_profile": {
        "id": 1,
        "program": "Ingeniería de Sistemas",
        "semester": "8"
      }
    }
  }
}
```
El campo `user.role` identifica la cuenta autenticada (`student`, `company` o
`admin`) y debe usarse como fuente de verdad para dirigir al usuario a su
sección. El inicio de sesión con Google se reserva para cuentas `student`;
empresas y administradores ingresan con correo y contraseña.

### 1.2 Registro de Estudiantes
- **Método:** `POST`
- **URL:** `/api/v1/auth/register/student` (o `/api/v1/auth/register-student`)
- **Cuerpo (JSON):**
```json
{
  "name": "Laura Sofía Martínez",
  "email": "laura.martinez@unipaz.edu.co",
  "password": "PasswordSegura123*",
  "program": "Ingeniería Informática",
  "semester": "7",
  "phone": "+57 312 456 7890",
  "about": "Estudiante con énfasis en desarrollo de software y base de datos."
}
```
- **Respuesta Exitosa (201 Created):** Retorna el token Sanctum y el objeto de usuario registrado.

### 1.3 Registro de Empresas
- **Método:** `POST`
- **URL:** `/api/v1/auth/register/company` (o `/api/v1/auth/register-company`)
- **Cuerpo (JSON):**
```json
{
  "name": "Contacto RRHH",
  "email": "contacto@nuevapetrolera.com",
  "password": "PasswordEmpresa123*",
  "password_confirmation": "PasswordEmpresa123*",
  "company_name": "Servicios Petroleros del Oriente S.A.S.",
  "nit": "901.888.777-1",
  "sector": "Petróleo y Gas",
  "contact_person": "Andrés Morales",
  "phone": "+57 310 999 8888",
  "address": "Zona Industrial, Barrancabermeja",
  "description": "Empresa dedicada a la prestación de servicios técnicos y de mantenimiento."
}
```
- **Respuesta (201 Created):** Empresa creada con estado `pending` a la espera de aprobación institucional.

### 1.4 Consultar Usuario Autenticado
- **Método:** `GET`
- **URL:** `/api/v1/auth/me`
- **Headers:** `Authorization: Bearer <TOKEN>`

---

## 2. Módulo de Estudiantes (`/api/v1/students` y `/api/v1/student`)

### 2.1 Consultar Perfil del Estudiante
- **Método:** `GET`
- **URL:** `/api/v1/students/profile` (o `/api/v1/student/profile`)
- **Headers:** `Authorization: Bearer <TOKEN_ESTUDIANTE>`

### 2.2 Actualizar Perfil del Estudiante
- **Método:** `PUT`
- **URL:** `/api/v1/students/profile`
- **Headers:** `Authorization: Bearer <TOKEN_ESTUDIANTE>`
- **Cuerpo (JSON):**
```json
{
  "program": "Ingeniería de Sistemas",
  "semester": "9",
  "phone": "+57 315 999 0000",
  "about": "Estudiante de 9no semestre con conocimientos en React Native, Next.js y Laravel."
}
```

### 2.3 Subir Hoja de Vida en PDF (Hasta 5 MB)
- **Método:** `POST`
- **URL:** `/api/v1/students/upload-cv` (o `/api/v1/student/profile/cv`)
- **Headers:** `Authorization: Bearer <TOKEN_ESTUDIANTE>`, `Content-Type: multipart/form-data`
- **FormData:** Clave `cv` (archivo `.pdf`, máx 5MB).
- **Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Hoja de vida subida exitosamente.",
  "data": {
    "cv_path": "cvs/1W9mmQmD2APQQJBGTvpBZMfPjAUUVMWI09wXSGDk.pdf",
    "cv_url": "http://127.0.0.1:8000/api/v1/student/profile/cv"
  }
}
```

---

## 3. Módulo de Empresas (`/api/v1/companies` y `/api/v1/company`)

### 3.1 Consultar Estado de Aprobación
- **Método:** `GET`
- **URL:** `/api/v1/companies/status`
- **Headers:** `Authorization: Bearer <TOKEN_EMPRESA>`
- **Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Estado de la empresa obtenido",
  "data": {
    "empresa_id": 1,
    "nombre_empresa": "TecnoSoluciones S.A.S.",
    "aprobada": true,
    "status": "approved",
    "mensaje": "La empresa está aprobada para publicar ofertas laborales."
  }
}
```

### 3.2 Consultar y Actualizar Perfil Comercial
- **Método:** `GET` / `PUT`
- **URL:** `/api/v1/companies/profile`
- **Headers:** `Authorization: Bearer <TOKEN_EMPRESA>`

---

## 4. Módulo de Vacantes (`/api/v1/jobs`)

### 4.1 Listar Vacantes Públicas con Filtros y Paginación
- **Método:** `GET`
- **URL:** `/api/v1/jobs?search=TypeScript&modalidad=Híbrido&ciudad=Barrancabermeja&page=1`
- **Parámetros Query:** `search`, `modalidad` (o `modality`), `ciudad` (o `location`), `page`, `per_page`.
- **Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Vacantes consultadas correctamente.",
  "data": {
    "data": [
      {
        "id": 5,
        "title": "Desarrollador Fullstack Next.js / TypeScript",
        "description": "Creación y soporte de interfaces móviles y microservicios...",
        "location": "Barrancabermeja",
        "modality": "hybrid",
        "salary_range": "$ 2.800.000 COP",
        "status": "active",
        "company": {
          "company_name": "TecnoSoluciones S.A.S."
        }
      }
    ],
    "meta": {
      "current_page": 1,
      "total": 1
    }
  }
}
```

### 4.2 Detalle de Vacante
- **Método:** `GET`
- **URL:** `/api/v1/jobs/5`

### 4.3 Publicar Nueva Vacante (Empresa Aprobada)
- **Método:** `POST`
- **URL:** `/api/v1/jobs` (o `/api/v1/company/jobs`)
- **Headers:** `Authorization: Bearer <TOKEN_EMPRESA>`
- **Cuerpo (JSON):**
```json
{
  "titulo": "Desarrollador Móvil React Native Junior",
  "descripcion": "Buscamos estudiante con experiencia en Expo y TypeScript.",
  "ubicacion": "Barrancabermeja",
  "salario": "$ 2.200.000 COP",
  "modalidad": "Híbrido"
}
```

---

## 5. Módulo de Postulaciones (`/api/v1/applications`) - SPRINT 3

### 5.1 Postularse a una Vacante (Estudiante)
- **Método:** `POST`
- **URL:** `/api/v1/applications` (o `/api/v1/jobs/:id/apply`)
- **Headers:** `Authorization: Bearer <TOKEN_ESTUDIANTE>`
- **Cuerpo (JSON o Multipart):**
```json
{
  "job_offer_id": 5,
  "cover_letter": "Estimado equipo, me postulo a esta vacante adjuntando mi experiencia técnica."
}
```
- **Control Anti-Duplicados:** Si el estudiante ya se postuló, responde automáticamente con HTTP 422: `"Ya te has postulado a esta vacante."`.

### 5.2 Consultar Postulaciones del Estudiante (Seguridad de Privacidad)
- **Método:** `GET`
- **URL:** `/api/v1/applications/student` (o `/api/v1/student/applications`)
- **Headers:** `Authorization: Bearer <TOKEN_ESTUDIANTE>`
- **Protección de Privacidad:** El campo privado `company_notes` jamás se envía al estudiante.

### 5.3 Listar Postulantes de una Vacante (Empresa)
- **Método:** `GET`
- **URL:** `/api/v1/applications/job/5` (o `/api/v1/company/applications?job_id=5`)
- **Headers:** `Authorization: Bearer <TOKEN_EMPRESA>`
- **Retorno:** Lista de candidatos postulados con datos del estudiante, hoja de vida y campo `company_notes`.

### 5.4 Actualizar Estado del Candidato y Registrar Notas Privadas
- **Método:** `PUT`
- **URL:** `/api/v1/applications/1/status` (o `/api/v1/company/applications/1/status`)
- **Headers:** `Authorization: Bearer <TOKEN_EMPRESA>`
- **Cuerpo (JSON):**
```json
{
  "estado": "interview",
  "company_notes": "Candidato agendado a entrevista técnica para el viernes 10:00 AM."
}
```
- **Estados Permitidos:** `pending`, `reviewed`, `interview`, `accepted`, `rejected`.
- **Efecto:** Actualiza la base de datos de Laravel y dispara una notificación en la cuenta del estudiante.

---

## 6. Módulo de Notificaciones (`/api/v1/notifications`)

### 6.1 Listar Notificaciones
- **Método:** `GET`
- **URL:** `/api/v1/notifications`
- **Headers:** `Authorization: Bearer <TOKEN>`

### 6.2 Marcar Notificación como Leída
- **Método:** `PUT` o `PATCH`
- **URL:** `/api/v1/notifications/1/read`
- **Para marcar todas:** `/api/v1/notifications/all/read`

---

## 7. Módulo de Administración (`/api/v1/admin`)

### 7.1 Listar Empresas Pendientes de Aprobación
- **Método:** `GET`
- **URL:** `/api/v1/admin/companies/pending` (o `/api/v1/admin/companies?status=pending`)
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN>`

### 7.2 Aprobar o Rechazar Empresa
- **Método:** `PUT` o `POST`
- **URL:** `/api/v1/admin/companies/2/approve`
- **Headers:** `Authorization: Bearer <TOKEN_ADMIN>`
- **Cuerpo (Opcional):** `{ "aprobada": true }` (o `{ "aprobada": false }` para rechazar).
