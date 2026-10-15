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
| HU-01 | Login con Google OAuth 2.0 (estudiante) | — | Backend | ⬜ Todo |
| HU-02 | Registro de empresa con email y NIT | — | Backend | ⬜ Todo |
| HU-03 | Middleware de rol y redirección por panel | — | Backend | ⬜ Todo |
| HU-04 | Admin aprueba/rechaza empresa + notificación email | — | Backend | ⬜ Todo |
| HU-05 | Empresa actualiza su perfil (logo, sector, descripción) | — | Frontend | ⬜ Todo |
| HU-06 | Empresa publica una vacante (título, descripción, modalidad, fecha límite) | — | Backend | ⬜ Todo |
| HU-19 | Registro de disponibilidad horaria del estudiante | — | Frontend | ⬜ Todo |
| HU-20 | Subida de hoja de vida en perfil del estudiante | — | Backend | ⬜ Todo |

---

## ✅ Criterios de Aceptación del Sprint

- [ ] Un estudiante puede iniciar sesión con Google y su perfil se crea automáticamente
- [ ] Una empresa registrada queda en estado `pending` y no puede publicar hasta ser aprobada
- [ ] El admin ve el panel de empresas pendientes y puede aprobar/rechazar
- [ ] La empresa recibe notificación por email al ser aprobada
- [ ] Una empresa aprobada puede publicar vacantes con todos los campos requeridos
- [ ] El estudiante puede registrar su disponibilidad horaria
- [ ] Los CVs se almacenan en disco privado (no accesibles por URL directa)

---

## 🔒 Requerimientos Técnicos a Tener en Cuenta

- Usar `Laravel Socialite` para Google OAuth
- Hash `bcrypt` para contraseñas de empresas y admin
- `JobPostingPolicy` para controlar acceso a vacantes
- Todos los inputs validados con clases `FormRequest`
- Notificaciones implementando `ShouldQueue`
- Logo de empresa: max 2MB, almacenado en Storage con symlink

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
