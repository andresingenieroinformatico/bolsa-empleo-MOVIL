# Sprint 1 — Bolsa de Empleo UNIPAZ

> **Período:** (por definir)  
> **Objetivo:** Implementar autenticación, gestión de empresas y estructura base de vacantes.

---

## 🎯 Meta del Sprint

Que un estudiante pueda autenticarse con Google y que una empresa pueda registrarse, ser aprobada por el administrador y publicar su primera vacante.

---

## 📋 Sprint Backlog

| ID | Historia de Usuario | Puntos | Responsable | Estado |
|----|---------------------|--------|-------------|--------|
| HU-01 | Autenticación de estudiante con Google OAuth institucional | 3 | Backend | ⬜ Todo |
| HU-02 | Registro y verificación de empresa, incluida la aprobación o rechazo administrativo | 3 | Backend | ⬜ Todo |
| TEC-02 | Base de API, autenticación JWT y autorización por rol | 3 | Backend | ⬜ Todo |
| HU-03 | Publicación y gestión de vacantes por empresa aprobada | 3 | Backend | ⬜ Todo |
| HU-09 | Perfil del estudiante, disponibilidad horaria y CV PDF privado | 3 | Frontend + Backend | ⬜ Todo |
| HU-12 | Actualización del perfil público de empresa | 2 | Frontend + Backend | ⬜ Todo |

---

## ✅ Criterios de Aceptación del Sprint

- [ ] Un estudiante con correo `@unipaz.edu.co` puede iniciar sesión con Google y su perfil se crea automáticamente
- [ ] Una empresa registrada queda en estado `pending` y no puede publicar hasta ser aprobada
- [ ] El administrador puede aprobar o rechazar una empresa pendiente
- [ ] La empresa recibe notificación por email al ser aprobada
- [ ] Una empresa aprobada puede publicar vacantes con todos los campos requeridos
- [ ] Una empresa aprobada puede actualizar la información de su perfil
- [ ] El estudiante puede completar su perfil y registrar su disponibilidad horaria
- [ ] El estudiante puede subir un CV PDF de hasta 5 MB; se almacena de forma privada y no es accesible por URL directa

---

## 🔒 Requerimientos Técnicos a Tener en Cuenta

### Backend (Next.js)
- Verificar Google OAuth 2.0 y restringir el acceso estudiantil a cuentas `@unipaz.edu.co`
- Emitir tokens JWT y proteger las rutas según el rol del usuario
- Almacenar contraseñas empresariales con hash seguro
- Validar las entradas con esquemas `Zod`
- Mantener los CVs en almacenamiento privado y autorizar su consulta
- Logo de empresa: max 2MB, subida multipart y almacenamiento seguro

### Frontend (React Native)
- Integrar el inicio de sesión Google con la API y almacenar el token en `Expo SecureStore`
- Navegación entre pantallas: panel estudiante, panel empresa, panel admin
- Formularios controlados para registro, postulación y perfil
- Listado paginado de vacantes con filtros
- Selector de CV que solo permita PDF de hasta 5 MB

---

## 📊 Burndown Chart

| Día | Story Points Restantes |
|-----|----------------------|
| Día 1 | — |
| Día 2 | — |
| ... | — |

---

## 🔁 Retrospectiva Sprint 1

| ✅ Qué salió bien | ⚠️ Qué mejorar | 🔄 Acciones |
|------------------|----------------|-------------|
| (completar al finalizar) | (completar al finalizar) | (completar al finalizar) |

---

## 📝 Notas del Sprint

- El campo `company_notes` de las postulaciones nunca debe exponerse al estudiante
- Aplicar `throttle:5,1` en rutas de login y registro
