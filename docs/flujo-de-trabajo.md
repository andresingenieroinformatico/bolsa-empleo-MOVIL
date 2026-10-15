# Flujo de Trabajo — Bolsa de Empleo UNIPAZ

## Metodología: Scrum

El proyecto sigue la metodología **Scrum** con sprints de duración fija.

---

## Roles

| Rol | Responsable | Tecnología |
|-----|-------------|------------|
| Product Owner | Andres Ferney Garcia Ramirez | — |
| Scrum Master | Juan Jose Figueroa Ayala | — |
| Dev Frontend | Darwin Garcia Andrade | **React Native** |
| Dev Backend | Cristian Santiago Moncada | **Next.js** |

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

- Toda validación de input → middlewares / validadores en Next.js API Routes
- CVs → almacenados en servidor privado, servidos solo por rutas autenticadas
- `company_notes` → nunca expuesto al estudiante
- Login → rate limiting en API Routes contra fuerza bruta
- Todas las rutas protegidas → validación de sesión con NextAuth.js o JWT

---

## 🛠️ Stack Técnico

| Capa | Tecnología |
|------|------------|
| App Móvil (Frontend) | **React Native** |
| API REST (Backend) | **Next.js (Node.js)** |
| Autenticación estudiantes | Google OAuth 2.0 (NextAuth.js) |
| Autenticación empresas/admin | Email + contraseña con NextAuth.js |
| Base de datos | PostgreSQL / MySQL (via Prisma ORM o similar) |
| Almacenamiento de archivos | Disco privado del servidor / S3 compatible |
| Notificaciones | Nodemailer / SendGrid (email) + DB |
| Colas de trabajo | BullMQ o similar (Node.js) |
