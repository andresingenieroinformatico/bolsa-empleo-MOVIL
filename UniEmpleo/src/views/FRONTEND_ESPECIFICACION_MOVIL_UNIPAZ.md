# Especificación del frontend móvil y responsivo — Emplea UNIPAZ

> **Propósito:** referencia vigente de producto, diseño y comportamiento para la app móvil UniEmpleo. Las decisiones confirmadas en esta revisión sustituyen las referencias heredadas a Laravel Blade, Bootstrap y una web responsiva.
>
> **Estado:** Expo/React Native, Android-first. El contrato de datos es `src/Api/docs/API_DOCUMENTATION.md`; no asumir que las rutas web de Laravel están disponibles en la app.

## 1. Objetivo y alcance

Construir una aplicación móvil Android con Expo y React Native para conectar estudiantes, empresas y administración con las oportunidades laborales de UNIPAZ. La versión web de Expo es solo una vista de desarrollo; no debe dirigir las decisiones de interacción móvil.

### Perfiles

| Rol | Acceso actual | Necesidad principal |
|---|---|---|
| Estudiante | Google OAuth con correo `@unipaz.edu.co` | Completar perfil, descubrir vacantes, postularse y consultar el proceso. |
| Empresa | Correo y contraseña; registro sujeto a aprobación | Publicar oportunidades y administrar postulantes. |
| Administrador | Correo y contraseña; no hay registro público | Validar empresas, moderar vacantes, administrar usuarios y consultar reportes. |

### Límites

- No crear registro manual de estudiantes, registro público de administradores ni recuperación de contraseña; no están definidos en el contrato de la API.
- No sustituir respuestas reales por datos de demostración ni confiar en el selector visual de rol para autorizar acciones.
- No añadir acciones o filtros sin endpoint documentado.
- La pantalla pública puede mostrar vacantes solo si el gateway devuelve la lista pública documentada.

## 2. Fuentes revisadas y decisiones de precedencia

Fuentes principales:

- `src/app/index.tsx` y `src/views/`: pantallas y navegación móvil por rol.
- `src/services/api.ts`: cliente HTTP, URL base, tipos y operaciones consumidas por la app.
- `src/Api/docs/API_DOCUMENTATION.md` y `src/Api/app/api/v1/`: contrato y rutas implementadas por el gateway.
- `src/services/auth-session.ts`: persistencia local de sesión.

**Precedencia si las fuentes discrepan:** usar primero el contrato REST documentado y las rutas presentes en el gateway; después, las decisiones explícitas de plataforma y marca de esta especificación. Los documentos de Laravel/Blade y las rutas web antiguas no son contratos de la app móvil.

Bloqueo de despliegue conocido: la URL pública configurada debe devolver JSON en `/api/v1` y exponer `/api/v1/jobs`. Un `200` en la raíz del host no demuestra que el gateway esté desplegado.

## 3. Stack y arquitectura que debe preservarse

| Área | Estado actual | Directriz |
|---|---|---|
| App | Expo SDK 58, React Native 0.88, Expo Router | Mantener componentes nativos y navegación optimizada para Android. |
| UI | React Native `StyleSheet` y componentes en `src/components/` y `src/views/` | Evitar incorporar patrones web como Bootstrap, Blade o tablas horizontales. |
| Configuración API | `EXPO_PUBLIC_API_URL` en `.env.local` | El cliente agrega `/api/v1`; reiniciar Metro después de cambiar variables Expo. |
| Gateway | Next.js App Router en `src/Api/` | Publica `/api/v1/*` y reenvía las peticiones a Laravel por `LARAVEL_API_URL`. |
| Autenticación | Google para estudiantes; correo/contraseña para empresas y administradores | Persistir el token con SecureStore y exigir autorización del servidor. |
| Datos | API REST del gateway | Mostrar datos reales; sin fallback a mocks ni acciones de éxito simuladas. |

### Estructura existente relevante

```text
src/app/               Entrada y contenedor de navegación Expo
src/components/        Landing, acceso, registro y elementos compartidos
src/views/             Pantallas de estudiante, empresa y administración
src/services/api.ts    Cliente de la API REST
src/Api/app/api/v1/    Rutas del gateway Next.js
src/Api/lib/           Puente a Laravel
tests/                 Pruebas del cliente de API
```

### Forma de integrar una acción

Toda acción de negocio pasa por `src/services/api.ts` y una ruta documentada del gateway. Enviar el token Bearer cuando corresponda, validar entradas conforme a la API, mostrar errores del servidor y no presentar una acción como exitosa hasta recibir confirmación.

## 4. Dirección visual

### Identidad visual y paleta institucional

Usar los componentes React Native existentes como base; no convertir la landing ni los formularios en una página web dentro de WebView. Mantener jerarquía clara, tarjetas sobrias, controles táctiles y estados accesibles.

| Token | Valor | Uso |
|---|---|---|
| `brand-primary` | `#10235F` | Navegación y cabeceras institucionales. |
| `brand-dark` | `#0D1B4C` | Fondo oscuro y splash de Android. |
| `brand-blue` | `#1A3A8F` | Acciones secundarias y acentos azules. |
| `brand-green` | `#00963F` | CTA principal y acciones positivas. |
| `brand-green-dark` | `#007832` | Texto/énfasis sobre superficies claras. |
| `brand-green-light` | `#E6F7ED` | Selección, éxito y superficies verdes suaves. |
| `brand-accent` | `#34D399`, `#10B981` | Acentos; nunca indicar estado solo por color. |
| `panel` | `#F4F5F7` | Fondo claro de pantallas y paneles. |
| `text-primary` | `#1A1F36` | Texto principal. |
| `text-secondary` | `#6B7280` | Texto secundario y ayuda. |
| `surface` | `#FFFFFF` | Tarjetas y formularios. |

### Tipografía, forma y densidad

- Usar la tipografía del sistema salvo que exista una fuente institucional aprobada y configurada en Expo.
- Mantener espaciado consistente, esquinas moderadas y sombras discretas; evitar gradientes decorativos y bloques densos propios de escritorio.
- Estados de vacante, empresa y postulación llevan texto e indicador visual, no solo color.
- Idioma español; fechas locales y salarios como texto cuando la API no entregue un valor numérico.
- Nombre visible del producto: **UniEmpleo**.

## 5. Navegación y responsividad

### Navegación por contexto

**Visitante:** landing con vacantes públicas que entrega la API, acceso y registro de empresa. El acceso de estudiante inicia Google; no simular registro manual.

**Estudiante:** barra inferior Android con **Vacantes**, **Postulaciones** y **Mi perfil**. Vacantes incluye búsqueda, filtros, detalle y postulación.

**Empresa:** barra inferior con **Vacantes**, **Candidatos** y **Empresa**. Respetar el estado de aprobación del servidor; empresas no aprobadas no pueden publicar.

**Administrador:** revisión de empresas pendientes. No mostrar KPIs, usuarios o reportes que la API consumida por la app no proporcione.

### Reglas responsivas

- Enfoque Android portrait; probar al menos **320, 360 y 390 dp** de ancho.
- Apilar contenido en una columna, usar listas/tarjetas y evitar scroll horizontal.
- Controles principales con área táctil de al menos **44 × 44 dp**.
- Respetar safe areas y dejar espacio para la barra inferior; no tapar CTA, formularios ni teclado.
- Permitir scroll vertical natural; no fijar alturas que corten contenido.
- Expo Web puede usarse para smoke tests, pero el criterio final es el bundle y la interacción Android.

## 6. Autenticación, registro y salida

### Inicio de sesión

Estudiantes usan autenticación Google y empresas/administradores usan correo y contraseña. Llamar a `POST /api/v1/auth/google` o `POST /api/v1/auth/login`; mantener el token en SecureStore y verificar la sesión con `GET /api/v1/auth/me`. Mostrar errores del servidor sin borrar el correo.

### Registro de empresa

Registrar empresas mediante `POST /api/v1/auth/register/company`. Solicitar responsable, correo, contraseña y confirmación, razón social, sector, contacto, teléfono, dirección y descripción; NIT es opcional. Mostrar el estado pendiente y no habilitar publicación hasta que el servidor apruebe la empresa.

### Registro de estudiantes y administración

- **Estudiante:** no existe registro manual; usar Google.
- **Administrador:** no hay registro público; autenticar la cuenta provisionada.
- **Recuperación de contraseña:** no está disponible en el contrato de la API; no ofrecer un flujo falso.

### Cerrar sesión

Enviar `POST /api/v1/auth/logout`, borrar la sesión local y volver a la landing incluso si el servidor no responde. Las acciones protegidas siempre deben validar el token en el servidor.

## 7. Referencia funcional heredada (no es contrato móvil)

> Las rutas y capacidades descritas a continuación pertenecen a una versión Laravel web anterior. Se conservan como contexto de producto, pero no son instrucciones para crear pantallas, endpoints ni acciones en Expo. Para la app móvil, prevalecen las pantallas actuales por rol y el contrato REST de la sección 8.

### 7.1 Público

#### Landing (`GET /`, `home`)

- Mensaje institucional, llamada a buscar vacantes y bloque para empresas.
- Mostrar cifras calculadas por servidor: estudiantes, vacantes activas y empresas aprobadas.
- Mostrar hasta seis vacantes recientes con cargo, empresa, ubicación, modalidad, remuneración disponible y vigencia.
- Sección “Cómo funciona” orientada a estudiante y empresa.
- CTA de registro para empresas y acceso de estudiantes con Google.
- Las vacantes recientes no deben ofrecer “Aplicar” como acción anónima directa si la ruta requiere login: llevar al flujo de autenticación apropiado.
- Corregir el buscador visual para que use solo filtros realmente soportados y los nombres que espera el listado autenticado; mantener o rediseñar el formulario únicamente cuando el destino pueda recibir los criterios. No enviar filtros como `q`, ubicación o salario a OAuth.
- Estados: sin vacantes, carga/error de respuesta y valores estadísticos cero.

#### Política de privacidad

La vista existe, pero falta una ruta detectada. No añadirla al menú ni afirmar que el enlace funciona hasta que el endpoint esté definido por el responsable del backend.

### 7.2 Estudiante

#### Panel (`GET /estudiante/dashboard`, `student.dashboard`)

- Bienvenida con nombre, correo, programa y avatar.
- Aviso/acción para completar perfil si el programa sigue como “Sin especificar”.
- Resumen real: total de postulaciones, entrevistas y aceptadas.
- Últimas postulaciones con empresa, vacante, fecha y estado.
- Vacantes recientes con CTA a detalle.
- Accesos “Ver todas”, vacantes y perfil.
- Mantener contenido institucional/legal existente solo cuando sea recibido por servidor.
- Estados vacíos que expliquen el siguiente paso; no dejar paneles en blanco.

#### Explorar vacantes (`GET /estudiante/vacantes`, `student.jobs`)

- Campo de búsqueda por cargo, descripción o empresa (`search`).
- Filtros soportados: área (`area`), modalidad (`modality`: `onsite`, `remote`, `hybrid`) y tipo de contrato (`contract_type`).
- Resultados paginados de 12, indicadores de modalidad, área, contrato, rango salarial textual y días restantes.
- Favorito alternable mediante `POST /estudiante/vacantes/{jobPosting}/favorito` (`student.jobs.favorite`).
- Marcar visualmente si ya se postuló; ofrecer detalle en lugar de crear una postulación duplicada.
- Botón para limpiar filtros y estado “sin resultados”.
- No incluir filtro de sueldo o ubicación como si tuviera efecto: el controlador no los procesa.

#### Detalle de vacante (`GET /estudiante/vacantes/{jobPosting}`, `student.jobs.show`)

- Empresa, cargo, área, modalidad, contrato, ubicación, remuneración, número de plazas, fecha límite, descripción, responsabilidades, requisitos y programas preferidos cuando existan.
- En celular, convertir el panel lateral de postulación en un bloque al final o un CTA inferior que no oculte el contenido ni el teclado.
- Estado ya postulado: explicar y enlazar a Mis postulaciones.
- Estado no disponible/vencido: no permitir postularse.
- Estado activo: carta de presentación opcional (máx. 2.000 caracteres) y CV PDF; exigir archivo solo si la vacante requiere CV y el perfil no tiene uno.
- Mostrar si se usará la hoja de vida del perfil y permitir adjuntar un PDF alternativo.
- Límite servidor del CV: PDF de hasta **20 MB**. Eliminar el texto actual de “máximo 5 MB”.
- Enviar a `POST /estudiante/vacantes/{jobPosting}/postular` (`student.jobs.apply`). El servidor impide duplicados, valida vigencia y crea estado `pending`.

#### Mis postulaciones (`GET /estudiante/postulaciones`, `student.applications`)

- Lista paginada de 10; en celular, tarjetas legibles en lugar de una tabla horizontal.
- Mostrar empresa, cargo, modalidad, fecha, estado y enlace al detalle de vacante.
- Estados: Pendiente, En revisión, Entrevista programada, Aceptado y No seleccionado.
- Mostrar mensajes complementarios para entrevista/aceptación; no mostrar las notas internas de empresa.
- Estado vacío con CTA a explorar vacantes.

#### Favoritos (`GET /estudiante/favoritos`, `student.jobs.favorites`)

- Reutilizar las tarjetas y filtros de la lista de vacantes.
- Mostrar vacantes guardadas que sigan activas, paginadas.
- Poder quitar de favoritos y navegar al detalle.

#### Perfil y hoja de vida

- Perfil: `GET /estudiante/perfil`, actualizar con `PUT /estudiante/perfil` (`student.profile.update`).
- Campos: programa académico (requerido), semestre, código estudiantil, teléfono, LinkedIn (URL válida), “Sobre mí” y CV.
- Límites actuales: programa requerido hasta 150 caracteres; semestre hasta 20; código hasta 30; teléfono hasta 20; descripción personal hasta 1.000; LinkedIn URL hasta 255.
- Mostrar enlaces a CV PDF y hoja de vida HTML (`GET /estudiante/perfil/hoja-de-vida`, `student.profile.resume`) cuando haya datos.
- El CV del perfil acepta PDF de hasta **20 MB**; el servidor elimina el anterior al guardar uno nuevo.
- Hoja de vida para empresa/administración: `GET /hojas-de-vida/{user}` (`resumes.show`); respetar autorización existente. El estudiante puede ver la propia, admin y empresa con postulaciones relacionadas.

### 7.3 Empresa

#### Panel (`GET /empresa/dashboard`, `company.dashboard`)

- Identidad de empresa, sector, dirección y estado.
- En `pending` o `rejected`, mostrar claramente el estado y que publicar está bloqueado hasta aprobación. No mostrar CTA de publicación habilitado.
- KPI: total vacantes, activas, postulaciones y pendientes de revisión.
- Lista de postulaciones recientes con candidato, programa, vacante, fecha y estado.
- Atajos a vacantes, postulaciones y reportes.

#### Mis vacantes (`GET /empresa/vacantes`, `company.jobs.index`)

- Tarjetas responsivas con título, ubicación, área, contrato, modalidad, fecha límite, plazas, remuneración, conteo de postulaciones y estado.
- Acciones: ver, editar, pausar/reanudar y cerrar. Cerrar requiere confirmación; conserva postulaciones existentes.
- Crear vacante (`GET /empresa/vacantes/create`, `company.jobs.create`) y guardar (`POST /empresa/vacantes`, `company.jobs.store`); ambas funciones disponibles solo si empresa aprobada.
- Editar (`GET /empresa/vacantes/{jobPosting}/edit`, `company.jobs.edit`) y guardar (`PUT /empresa/vacantes/{jobPosting}`, `company.jobs.update`).
- Estado activo/pausado/cerrado con etiquetas y texto; una vacante activa vencida debe presentarse como expirada según el servidor.

#### Formulario crear/editar vacante

Campos del servidor y validación relevante:

| Campo | Regla funcional |
|---|---|
| Título | Obligatorio, máximo 200 caracteres. |
| Descripción | Obligatoria, 20–5.000 caracteres. |
| Requisitos | Obligatorios, máximo 3.000 caracteres. |
| Responsabilidades | Obligatorias, 20–3.000 caracteres. |
| Área y tipo de contrato | Obligatorios, máximo 100 caracteres. |
| Modalidad | Obligatoria: presencial (`onsite`), remota (`remote`) o híbrida (`hybrid`). |
| Ubicación | Obligatoria, máximo 150 caracteres. |
| Salario | Rango textual opcional, máximo 100 caracteres; alternativa “A convenir”. |
| Número de plazas | Entero de 1 a 100; no limitarlo a 50 como la vista actual. |
| Fecha límite | Obligatoria; al crear debe ser posterior a hoy. |
| `requires_cv` | Interruptor/checkbox. |
| Programas preferidos | Texto opcional, máximo 500 caracteres. |
| Estado al editar | Activa, pausada o cerrada. |

Conservar valores previos tras errores; mostrar el asterisco y leyenda “* Campos obligatorios”. No convertir salario a valor numérico: el modelo lo guarda como texto.

#### Detalle de vacante de empresa

- Ver información de la vacante y conteo de postulaciones.
- Lista de candidatos con programa, estado, enlace de CV PDF si existe, hoja de vida HTML y carta de presentación si existe.
- Acciones de estado de vacante.
- Puede cargar hasta 20 postulantes recientes en esta pantalla; enlazar a la bandeja completa.
- Empresa solo puede acceder a vacantes propias.

#### Postulaciones recibidas (`GET /empresa/postulaciones`, `company.applications`)

- Filtros por vacante (`job`) y estado (`status`); limpiar filtros.
- Mostrar estudiante, correo, programa, semestre, fecha, vacante, estado y carta si existe.
- Acciones de CV PDF y hoja de vida HTML si están disponibles.
- Cambiar estado a pendiente, en revisión, entrevista, aceptado o no seleccionado; nota interna opcional (máx. 500 caracteres), nunca mostrarla al estudiante.
- Actualizar con `PUT /empresa/postulaciones/{application}` (`company.applications.update`). Restringir a postulaciones de vacantes de esa empresa.

#### Perfil de empresa

- `GET /empresa/perfil`; `PUT /empresa/perfil` (`company.profile.update`).
- Editar nombre, NIT, sector, contacto, teléfono, sitio web, dirección, descripción y logo.
- Logo: JPG/PNG, máximo 2 MB. Mostrar estado de aprobación y aviso pendiente cuando corresponda.
- Validaciones actuales: nombre, sector y persona de contacto requeridos; teléfono máx. 20; dirección máx. 255; descripción máx. 2.000; sitio web URL máx. 255; NIT opcional, único y con dígitos, puntos o guion.

#### Reportes

- `GET /empresa/reportes` (`company.reports`) y exportación PDF `GET /empresa/reportes/pdf` (`company.reports.pdf`).
- Métricas reales de vacantes, activas, postulaciones, pendientes y aceptadas.
- Postulaciones por estado y desempeño de vacantes.
- En celular, apilar tarjetas/gráficos y mantener etiquetas y valores comprensibles sin depender exclusivamente del color.

### 7.4 Administración

#### Panel (`GET /admin/dashboard`, `admin.dashboard`)

- KPIs: estudiantes, empresas aprobadas/pendientes, vacantes activas y postulaciones totales.
- Empresas recientes con estado/atajo de aprobación.
- Postulaciones recientes.
- Áreas con mayor número de vacantes activas.
- En móvil, apilar tarjetas y barras; conservar navegación a todos los módulos.

#### Gestión de empresas (`GET /admin/empresas`, `admin.companies`)

- Búsqueda por nombre y filtro por pendiente/aprobada/rechazada; paginación de 15.
- Información: nombre, correo, NIT, sector, contacto, fecha y estado.
- Aprobar (`POST /admin/empresas/{company}/aprobar`), rechazar (`POST /admin/empresas/{company}/rechazar`) y eliminar (`DELETE /admin/empresas/{company}`) cuando corresponda.
- Confirmar eliminación antes del envío. La aprobación notifica a la empresa.

#### Gestión de usuarios (`GET /admin/usuarios`, `admin.users`)

- Búsqueda por nombre/correo y filtro por rol; paginación de 20.
- Mostrar rol, fecha de registro, estado activo/inactivo y acción activar/desactivar (`POST /admin/usuarios/{user}/toggle`).
- No ofrecer acción para desactivar una cuenta administradora; el servidor la rechaza.

#### Gestión y detalle de vacantes

- Lista `GET /admin/vacantes`, filtros por búsqueda, área y estado; página de 15.
- Detalle `GET /admin/vacantes/{jobPosting}` con empresa, descripción, metadatos y postulantes.
- Pausar/reanudar con `POST /admin/vacantes/{jobPosting}/toggle`.
- No añadir edición/eliminación administrativa: no hay ruta correspondiente.

#### Reportes y perfil

- Reportes `GET /admin/reportes`, exportación `GET /admin/reportes/pdf`.
- Indicadores de estudiantes, empresas, vacantes, postulaciones; distribución por estado y áreas.
- Perfil `GET /admin/perfil`; actualizar nombre/correo y contraseña confirmada con `PUT /admin/perfil`.

## 8. Contrato REST de referencia

Usar `src/Api/docs/API_DOCUMENTATION.md` y `src/services/api.ts` como fuentes contractuales. El cliente recibe `EXPO_PUBLIC_API_URL` como host base y agrega `/api/v1`. La app no debe llamar directamente a rutas web de Laravel.

| Área | Operaciones consumidas por la app |
|---|---|
| Salud pública | `GET /api/v1` |
| Vacantes públicas | `GET /api/v1/jobs` con `search`, `modalidad`, `ciudad`, `page` y `per_page` |
| Autenticación | `POST /api/v1/auth/google`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout` |
| Registro empresa | `POST /api/v1/auth/register/company` |
| Perfil estudiante | `GET` / `PUT /api/v1/students/profile`; `POST /api/v1/students/upload-cv` |
| Postulaciones estudiante | `GET /api/v1/applications/student`; `POST /api/v1/applications` |
| Empresa | `GET` / `PUT /api/v1/companies/profile`; `GET /api/v1/companies/status`; `GET /api/v1/company/jobs` |
| Vacantes empresa | `POST /api/v1/jobs`; `PUT /api/v1/jobs/{id}` |
| Candidatos | `GET /api/v1/applications/job/{jobId}`; `PUT /api/v1/applications/{id}/status` |
| Administración | `GET /api/v1/admin/companies/pending`; `PUT /api/v1/admin/companies/{id}/approve` |

Enviar `Authorization: Bearer <token>` a operaciones protegidas. Si una ruta responde 404, verificar que el host despliegue el gateway actual y `/api/v1`; un `200` en `/` no basta para validar la API.

## 9. Estados, datos y reglas que la UI debe representar

### Entidades principales

- **Usuario:** nombre, correo, rol (`admin`, `student`, `company`), avatar y estado activo.
- **Perfil estudiante:** programa, semestre, código, teléfono, “Sobre mí”, CV y LinkedIn.
- **Empresa:** nombre, NIT, sector, contacto, teléfono, dirección, descripción, logo, sitio web y estado.
- **Vacante:** título, descripción, requisitos, responsabilidades, área, contrato, modalidad, ubicación, salario textual, negociable, plazas, fecha límite, estado, requisito de CV y programas objetivo.
- **Postulación:** estudiante, vacante, carta, CV utilizado, estado, notas privadas de empresa y fecha de revisión.

### Estados visibles

| Entidad | Valores persistidos | Texto recomendado |
|---|---|---|
| Empresa | `pending`, `approved`, `rejected` | Pendiente de aprobación, Aprobada, Rechazada. |
| Vacante | `active`, `paused`, `closed` | Activa, Pausada, Cerrada. Si su fecha terminó, mostrar Expirada además de respetar su estado persistido. |
| Postulación | `pending`, `reviewed`, `interview`, `accepted`, `rejected` | Pendiente, En revisión, Entrevista programada, Aceptado, No seleccionado. |
| Usuario | `active` boolean | Activo, Inactivo. |

El backend es la autoridad para vigencia, permisos, pertenencia de recursos, validación y duplicidad de postulaciones. La interfaz puede deshabilitar acciones por estado, pero debe mostrar y manejar también el error del servidor.

## 10. Estados de interfaz y accesibilidad

Para cada pantalla que consume o envía datos, diseñar:

- Carga: skeleton discreto para listas/estadísticas o indicador dentro de la acción; evitar doble envío.
- Error: mensaje visible, preservación de datos no sensibles y opción de reintentar cuando sea posible.
- Vacío: explicar por qué no hay resultados y ofrecer una acción contextual.
- Éxito: confirmación accesible después de guardar, postular, aprobar o cambiar estado.
- Sin permiso o sesión vencida: explicar y usar la redirección real del servidor; no renderizar controles que aparenten funcionar.
- Desconectado/lento: no inventar resultado exitoso ni reemplazar datos remotos por mocks.

Requisitos de accesibilidad:

- Cumplir WCAG 2.1 AA como mínimo: contraste 4.5:1 para texto normal y 3:1 para texto grande.
- Inputs con nombre accesible, ayuda y error asociados; indicar campos requeridos también con texto.
- Controles compatibles con TalkBack y VoiceOver; en Expo Web, conservar navegación por teclado y foco visible.
- Botones con nombre accesible aun cuando solo tengan icono; anunciar cambios y errores mediante estados accesibles.
- No usar color como único indicador. Añadir texto, icono o etiqueta de estado.
- Respetar `prefers-reduced-motion`; animaciones cortas y no necesarias para comprender la interfaz.
- Formularios de archivo explican formato y tamaño; controles táctiles accesibles y sin gestos exclusivos.

## 11. Criterios de aceptación

La especificación se considera correctamente implementada cuando:

1. Los tres roles tienen login/redirección y áreas claramente diferenciadas; no existe registro público falso de estudiante o administrador.
2. Registro de empresa contempla todos los campos que el servidor exige y comunica el estado pendiente sin prometer plazos no garantizados.
3. Cada acción visible usa la ruta/método/nombre de campo existente o se documenta como bloqueo que requiere aprobación del backend.
4. Estudiante puede recorrer perfil → búsqueda → detalle → postulación → seguimiento; CV existente no se vuelve a exigir y las duplicidades/vacantes vencidas se reflejan.
5. Empresa pendiente no puede iniciar publicación; empresa aprobada puede administrar vacantes y estados de postulaciones, manteniendo privadas sus notas.
6. Administración puede revisar las empresas pendientes servidas por la API.
7. No hay scroll horizontal ni controles tapados a 320/360/390 dp; listas y formularios son utilizables en Android.
8. Navegación inferior no tapa contenido, formularios ni CTA; el teclado móvil deja completar y enviar formularios.
9. Cada lista/formulario tiene estados de carga, error, vacío, éxito y permiso aplicables; los estados son accesibles por lector de pantalla.
10. La interfaz usa datos reales del servidor y mantiene la identidad visual institucional aprobada.
11. Búsqueda, login, registro, subida de CV, postulación, actualización de estados y cierre de sesión usan el gateway; no se consideran verificados por render o mocks.
12. La URL pública expone `/api/v1` y los endpoints consumidos; una respuesta 404 en el gateway bloquea la validación end-to-end.

### Validación recomendada para la implementación

- Cliente: `node --experimental-strip-types --test tests\api-client.test.mjs tests\api-config.test.mjs`.
- Tipos y lint: `npx tsc --noEmit` y `npm run lint`.
- Bundle Android: `npx expo export --platform android`.
- Prueba en Expo Go con Android, lector de pantalla, teclado virtual y estados de red.

## 12. Límites y pendientes de integración

### Siempre

- Preservar los endpoints, campos y permisos del contrato REST y manejar errores explícitamente.
- Mantener consistencia en estados, idioma, fechas y mensajes.
- Mostrar requisitos reales del servidor; no simular resultados exitosos.
- Probar en Android, incluidos estados vacíos y fallos de red/validación.

### Consultar antes de

- Añadir dependencias, crear endpoints o cambiar autenticación y permisos.
- Agregar registro de estudiantes/admin o recuperación de contraseña.
- Incorporar filtros o acciones que no existan en el gateway.
- Cambiar validaciones, estados, tamaños permitidos o política de archivos.

### Nunca

- Guardar credenciales/secrets en el frontend, el repositorio o datos de ejemplo.
- Usar mocks como resultado final de autenticación, postulación, aprobación o publicación.
- Exponer notas internas, permitir acceso a CV sin la autorización existente o asumir rol solo por selección visual.
- Eliminar/ocultar errores del servidor, desactivar controles de seguridad o declarar como funcional un enlace sin endpoint.

### Pendiente actual

El host Railway compartido responde correctamente en `/`, pero actualmente devuelve 404 en `/api/v1` y `/api/v1/jobs`. Confirmar el despliegue de las rutas Next.js y la configuración `LARAVEL_API_URL` antes de declarar operativa la conexión móvil.

## 13. Archivos de referencia

- [`src/app/index.tsx`](../app/index.tsx)
- [`src/services/api.ts`](../services/api.ts)
- [`src/Api/docs/API_DOCUMENTATION.md`](../../Api/docs/API_DOCUMENTATION.md)
- [`src/Api/lib/laravel-bridge.ts`](../../Api/lib/laravel-bridge.ts)
- [`app.json`](../../app.json)
