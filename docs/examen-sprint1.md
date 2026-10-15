# Examen Sprint 1 — Bolsa de Empleo UNIPAZ

> **Fecha:** (por definir)  
> **Evaluador:** (por definir)

---

## 📋 Checklist de Evaluación — Sprint 1

### RF-01: Autenticación

| Criterio | Evidencia | ✅/❌ |
|----------|-----------|-------|
| Estudiante puede iniciar sesión con Google OAuth 2.0 | — | — |
| Empresa puede registrarse con email/contraseña | — | — |
| Admin puede iniciar sesión | — | — |
| Middleware de rol redirige al panel correcto | — | — |
| Contraseñas almacenadas con bcrypt | — | — |
| Rate limiting activo en login (`throttle:5,1`) | — | — |

---

### RF-02: Gestión de Empresas

| Criterio | Evidencia | ✅/❌ |
|----------|-----------|-------|
| Empresa nueva queda en estado `pending` | — | — |
| Admin puede aprobar empresa | — | — |
| Admin puede rechazar empresa | — | — |
| Se envía notificación por email al aprobar/rechazar | — | — |
| Empresa aprobada puede actualizar su perfil | — | — |
| Logo almacenado correctamente (max 2MB, disco privado) | — | — |

---

### RF-03: Gestión de Vacantes

| Criterio | Evidencia | ✅/❌ |
|----------|-----------|-------|
| Solo empresa aprobada puede crear vacante | — | — |
| Vacante requiere: título, descripción, requisitos, tipo contrato, modalidad, fecha límite | — | — |
| Empresa no puede editar vacantes de otra empresa (Policy devuelve 403) | — | — |
| Scopes `scopeActive()`, `scopeByArea()`, `scopeByModality()`, `scopeByProgram()` funcionan | — | — |

---

### Requerimientos No Funcionales

| Criterio | Evidencia | ✅/❌ |
|----------|-----------|-------|
| CVs NO accesibles por URL directa | — | — |
| Validaciones en `FormRequest` (no en controladores) | — | — |
| Rutas POST/PUT/DELETE protegidas por CSRF | — | — |
| Eager loading en consultas con relaciones | — | — |

---

## 📝 Observaciones del Examinador

```
(espacio para comentarios)
```

---

## 📊 Calificación

| Módulo | Puntaje Posible | Puntaje Obtenido |
|--------|----------------|-----------------|
| Autenticación | — | — |
| Gestión de Empresas | — | — |
| Gestión de Vacantes | — | — |
| Requerimientos No Funcionales | — | — |
| **Total** | **—** | **—** |

---

## 🔄 Acciones de Mejora Post-Examen

| # | Acción | Responsable | Fecha |
|---|--------|-------------|-------|
| — | — | — | — |
