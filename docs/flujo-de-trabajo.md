# Flujo de Trabajo — Bolsa de Empleo UNIPAZ

## Metodología: Scrum

El proyecto sigue la metodología **Scrum** con sprints de duración fija.

---

## Roles

| Rol | Responsable |
|-----|-------------|
| Product Owner | Andres Ferney Garcia Ramirez |
| Scrum Master | Juan Jose Figueroa Ayala |
| Dev Frontend | Darwin Garcia Andrade |
| Dev Backend | Cristian Santiago Moncada |

---

## Flujo General del Sistema

```
[Estudiante]                [Empresa]                 [Admin]
     |                          |                         |
     | Google OAuth 2.0         | Registro email/NIT       |
     |------------------------> |-----------------------> |
     |                          |   Estado: "pending"      |
     |                          |                         | Aprueba/Rechaza
     |                          | <----------------------- |
     |                          |   Notificación email     |
     |                          |                         |
     |                          | Publica Vacante          |
     |                          |-----------------------> DB
     |                          |                         |
     | Busca y filtra vacantes  |                         |
     |---------------------------------------------> DB   |
     |                          |                         |
     | Se postula + CV          |                         |
     |---------------------------------------------> DB   |
     |                          | <--- Notificación ----  |
     |                          |                         |
     |                          | Actualiza estado        |
     | <--- Notificación -----  |                         |
     |   (reviewed/interview/   |                         |
     |    accepted/rejected)    |                         |
```

---

## Estados de una Vacante

```
  [Borrador] --> [active] --> [paused] --> [active]
                    |
                    v
                [closed]
                    |
              (deadline pasado → expirada automáticamente)
```

---

## Estados de una Postulación

```
[pending] --> [reviewed] --> [interview] --> [accepted]
                                        \--> [rejected]
```

Cada cambio de estado dispara una **notificación** al estudiante vía email y base de datos.

---

## Flujo de Desarrollo (Scrum)

```
Product Backlog
      |
      v
Sprint Planning
      |
      v
Sprint (1-2 semanas)
  ├── Daily Scrum
  ├── Desarrollo
  └── Testing
      |
      v
Sprint Review + Retrospectiva
      |
      v
Incremento de Producto
```

---

## Convenciones de Ramas Git

| Rama | Uso |
|------|-----|
| `main` | Código en producción |
| `develop` | Integración continua |
| `feature/HU-XX-descripcion` | Nueva funcionalidad |
| `fix/descripcion` | Corrección de bug |

---

## Reglas de Validación y Seguridad

- Toda validación de input → clases `FormRequest` (nunca en controladores)
- CVs → disco privado, servidos solo con `Storage::download()` + autenticación
- `company_notes` → nunca expuesto al estudiante
- Login → `throttle:5,1` contra fuerza bruta
- Todas las rutas POST/PUT/DELETE → protegidas con `VerifyCsrfToken`
