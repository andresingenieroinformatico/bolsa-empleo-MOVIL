# Flujo de Trabajo y Definición de Terminado — Bolsa de Empleo UNIPAZ

> **Sprint 0 · Paso 6.** Marco de trabajo: **Scrumban con fases de Mobile-D**, sprints de una semana de Sesión B a Sesión B.

---

## Roles del Equipo

Equipo de cuatro integrantes:

| Rol | Responsable | Especialidad / Tecnología |
|-----|-------------|---------------------------|
| **Product Owner** | Andres Ferney Garcia Ramirez | Gestión del Backlog y validación de usuarios |
| **Scrum Master** | Juan Jose Figueroa Ayala | Facilitación ágil, remoción de bloqueos y métricas |
| **Dev Frontend** | Darwin Garcia Andrade | **React Native (Expo)** / UI móvil |
| **Dev Backend** | Cristian Santiago Moncada | **Next.js (Node.js)** / API REST y Prisma ORM |

---

## 1. Columnas del tablero y políticas de entrada

Cada política responde a una pregunta: **¿qué tiene que cumplir una tarjeta para entrar en esta columna?**  
Límites de Trabajo en Progreso (WIP) para el equipo de cuatro integrantes:

| Columna | Política de entrada | WIP |
|---|---|---|
| **Backlog** | Cualquier idea con título claro. El Product Owner decide su orden de prioridad. | — |
| **Listo** | Cumple INVEST, tiene criterios de aceptación en Gherkin (`docs/criterios/`), estimación en puntos y el equipo la comprende plenamente. | **5** |
| **En desarrollo** | Un integrante se la asigna y crea su rama correspondiente (`hu-04-busqueda-vacantes`). Estrictamente una tarjeta en curso por persona. | **4** |
| **En revisión** | Hay un Pull Request abierto que enlaza el issue correspondiente y el linter/análisis estático (`npm run lint` / TypeScript) está completamente limpio. | **2** |
| **En dispositivo** | PR aprobado por otro desarrollador del equipo; build/APK de la rama instalado y probado en un **Android físico** (o cliente Expo Go). | **2** |
| **Hecho** | Cumple la Definición de Terminado (DoD) aplicable y el PR está fusionado en `main`. | — |

**Política añadida en el Sprint 1 · elementos de investigación (INV):**  
Esperan en «Backlog» con el campo Sprint asignado (la vista «Sprint actual» los muestra igual) y pasan a «En desarrollo» cuando alguien los toma. **No pasan por «En dispositivo»**: de «En revisión», donde otro integrante lee y valida el informe/evidencia, pasan directamente a «Hecho».

**Las historias Must se quedan en «Listo»** durante la fase de Exploración. Llegan a «Hecho» cuando estén construidas y probadas en un teléfono físico, desde la semana 6.

---

## 2. El resto de la definición

- **Elemento de trabajo:** un issue del repositorio (historia de usuario `HU-XX`, tarea técnica `TEC-XX`, defecto `BUG-XX` o investigación `INV-XX`).
- **Ciclo de vida:** **Empieza** cuando entra en «En desarrollo»; **termina** cuando entra en «Hecho». Entre esos dos momentos se mide el *cycle time*.
- **Expectativa de nivel de servicio (provisional):** «la mayoría de nuestros elementos se terminan en 4 días o menos». Se revisará con datos reales en el Sprint 4.
- **Bloqueos:** una tarjeta bloqueada lleva la etiqueta `bloqueada` y se menciona en el siguiente Daily. Si permanece bloqueada dos días, el Scrum Master interviene prioritariamente.
- **Métricas que se registran en cada Review:**
  - *Throughput:* número de elementos que llegaron a «Hecho» durante el sprint.
  - *Elemento en curso de mayor edad:* tiempo transcurrido del ítem más antiguo sin cerrar.
- **Convención de Ramas:**
  - Rama `main` protegida (requiere revisión aprobatoria).
  - Una rama individual por elemento (`hu-04-busqueda-vacantes`, `tec-02-api-prisma`, `inv-02-entrevistas`).
  - Todo cambio ingresa por Pull Request con revisión de pares.
  - El PR debe incluir en la descripción `Closes #N` para cerrar automáticamente el issue al fusionar.

---

## 3. Ceremonias

| Evento | Cuándo | Duración |
|---|---|---|
| **Sprint Review** | Inicio de cada Sesión B | 15 min |
| **Retrospectiva** | Inmediatamente después de la Review | 10 min |
| **Sprint Planning** | Después de la Retrospectiva | 20 min |
| **Daily** | Inicio de cada sesión; asíncrono lunes, miércoles y viernes | 10 min |

---

## 4. Definición de Terminado de la fase de Exploración (semanas 3 a 5)

Certifica que una historia está **lista para construirse**. Se gestiona como tres casillas de verificación dentro de cada issue:

- [ ] La historia tiene criterios de aceptación verificables en formato *Dado / Cuando / Entonces* (`.feature` en español), revisados por otra pareja del equipo.
- [ ] Su interfaz existe en el prototipo de Figma, en baja o mediana fidelidad como mínimo.
- [ ] El Product Owner la validó con al menos un usuario real (estudiante o empresa de UNIPAZ) y registró sus observaciones en la ficha de validación.

---

## 5. Definición de Terminado base del curso (desde la semana 6)

Una historia de usuario está **Hecha** cuando:

- [ ] Cumple todos sus criterios de aceptación, comprobados y validados en un **teléfono Android físico**.
- [ ] Entró mediante un Pull Request revisado y aprobado por otro desarrollador, y está fusionado en `main`.
- [ ] El linter (`npm run lint` / `npx tsc`) no reporta advertencias ni errores y todas las pruebas automáticas pasan exitosamente.
- [ ] La interfaz se visualiza correctamente en pantallas desde **360 dp** de ancho, sin desbordamientos de texto ni elementos recortados.
- [ ] Toda lista o pantalla con datos modela sus **cuatro estados obligatorios**:
  1. *Cargando (skeleton / spinner)*
  2. *Vacío (empty state con mensaje y acción)*
  3. *Error (alerta amigable con reintento)*
  4. *Con datos (listado renderizado)*
- [ ] Si utiliza permisos del dispositivo (almacenamiento de archivos PDF, notificaciones push), maneja adecuadamente el caso de **permiso denegado**.
- [ ] Toda área táctil (botones, enlaces, selectores) mide al menos **48 × 48 dp**.
- [ ] Todo texto respeta un contraste de color de al menos **4.5:1** respecto a su fondo *(Requisito de calidad RC-02)*.

---

## 6. Flujo General del Sistema

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
     | Se postula + CV en PDF   |                         |
     |---------------------------------------------> DB   |
     |                          | <--- Notificación ----  |
     |                          |                         |
     |                          | Actualiza estado        |
     | <--- Notificación Push - |                         |
     |   (reviewed/interview/   |                         |
     |    accepted/rejected)    |                         |
```

---

## 7. Estados de una Vacante y de una Postulación

### Vacante (JobPosting)
```
  [Borrador] --> [active] --> [paused] --> [active]
                    |
                    v
                [closed]
                    |
              (deadline superado → expirada automáticamente)
```

### Postulación (Application)
```
[pending] --> [reviewed] --> [interview] --> [accepted]
                                        \--> [rejected]
```
*Cada cambio de estado despacha una notificación push al smartphone del estudiante y un correo transaccional.*

---

## 8. Reglas de Validación y Seguridad

- **Validación de entradas:** Esquemas estrictos con **Zod** en todos los Route Handlers de Next.js.
- **Hojas de vida (CVs):** Almacenadas en disco privado/seguro del servidor; descarga únicamente mediante endpoint autenticado con streaming protegido.
- **Privacidad estricta:** El campo `company_notes` de la postulación jamás se expone al estudiante en la API.
- **Autenticación y Rate Limiting:** Verificación de Bearer Tokens JWT en `Expo SecureStore` y limitación de peticiones en rutas de autenticación.

---

## 9. 🛠️ Stack Técnico Oficial

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **App Móvil (Frontend)** | **React Native (Expo SDK 51+)** | Interfaz móvil nativa para estudiantes y empresas |
| **API REST (Backend)** | **Next.js 14/15 (App Router)** | Route Handlers y lógica de negocio en Node.js |
| **Base de Datos** | **MySQL 8.0 / MariaDB** | Almacenamiento relacional transaccional |
| **ORM** | **Prisma ORM** | Modelado tipado, consultas seguras y migraciones |
| **Autenticación Estudiantes** | **Google OAuth 2.0 (NextAuth)** | Restringido a correos institucionales `@unipaz.edu.co` |
| **Autenticación Empresas / Admin** | **Email + Password (Bcrypt)** | Registro corporativo y acceso administrativo |
| **Almacenamiento de Archivos** | **Disco privado / S3 compatible** | Custodia de CVs en PDF y logos empresariales |
| **Notificaciones** | **Expo Push API + Nodemailer (SMTP)** | Push notifications en el celular y correos automáticos |
