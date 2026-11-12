# Especificación del frontend móvil y responsivo — Emplea UNIPAZ

> **Propósito:** servir como referencia de producto, diseño y comportamiento para la IA o el equipo que implemente el frontend. Describe la aplicación que existe, el flujo visual deseado y los límites del backend actual. No es autorización para cambiar rutas, reglas de negocio o esquema de base de datos.
>
> **Estado:** especificación inicial basada en el repositorio y el bundle Figma disponibles.

## 1. Objetivo y alcance

Adaptar la Bolsa de Empleo UNIPAZ a una experiencia **mobile-first, responsiva y usable en celular**, sin perder las funciones actuales para escritorio. Debe conectar a estudiantes, empresas y administración, con pantallas y navegación diferentes por rol.

La prioridad visual para el acceso es el prototipo del folder `Inicio de sesión Bolsa de empleo`. El resto de las pantallas se deriva de las vistas, controladores, modelos y rutas Laravel existentes; el bundle Figma no contiene diseños de dashboards, vacantes ni registros completos.

### Supuesto de plataforma

El proyecto inspeccionado es una aplicación web Laravel con Blade y Bootstrap. Por tanto, esta especificación plantea una **aplicación web responsiva para celular**, no una app nativa Android/iOS ni una SPA nueva. No sustituir Laravel/Blade por React ni añadir modo PWA sin confirmación y un cambio de alcance explícito.

### Perfiles

| Rol | Acceso actual | Necesidad principal |
|---|---|---|
| Estudiante | Google OAuth con correo `@unipaz.edu.co` | Completar perfil, descubrir vacantes, postularse y consultar el proceso. |
| Empresa | Correo y contraseña; registro sujeto a aprobación | Publicar oportunidades y administrar postulantes. |
| Administrador | Correo y contraseña; no hay registro público | Validar empresas, moderar vacantes, administrar usuarios y consultar reportes. |

### Fuera del alcance sin aprobación

- Implementar una app nativa, una API nueva o cambiar el mecanismo de autenticación.
- Crear registro con contraseña para estudiantes, registro de administradores o recuperación de contraseña: el backend actual no ofrece esos flujos.
- Permitir consultar la lista completa de vacantes sin iniciar sesión: las rutas de vacantes están protegidas por `auth`.
- Inventar datos, filtros o acciones que no existan en las rutas actuales.
- Hacer cambios de esquema, rutas o reglas del backend para que una pantalla parezca funcional.

## 2. Fuentes revisadas y decisiones de precedencia

Fuentes principales:

- `routes/web.php`: rutas reales, nombres y middleware.
- `app/Http/Controllers/`: validaciones, permisos, redirecciones y datos por pantalla.
- `app/Models/` y `database/migrations/`: entidades y estados persistidos.
- `resources/views/` y `resources/css/`: interfaz web actual, campos y estilos.
- `Inicio de sesión Bolsa de empleo/src/app/App.tsx` y `src/styles/`: referencia visual de acceso Figma.
- `unipaz_emplea_redesign.html`, `mejoras_qa_dev.md` y documentación técnica/funcional del proyecto.

**Precedencia si las fuentes discrepan:** rutas, validaciones de controladores y esquema de migraciones son el contrato funcional. Las vistas, el prototipo Figma y documentos antiguos son referencias de presentación, no autorizan funcionalidades inexistentes.

Hallazgos que la implementación debe tener presentes:

1. `Inicio de sesión Bolsa de empleo` es un proyecto Figma Make separado (React/Vite) y actualmente es un prototipo de acceso; no está conectado a Laravel. El formulario simula una espera con `setTimeout`, y sus botones de registro y contraseña olvidada no tienen flujo real.
2. `README.md` contiene marcadores de conflicto Git; no usarlo como única fuente de requisitos.
3. Existe una copia anidada `Bolsa-empleo-unipaz-main/`; los archivos clave comparados (`routes/web.php`, `package.json`, landing y controlador de vacantes) coinciden con la raíz. **Tomar como raíz de trabajo la carpeta que contiene este documento y el folder Figma**, no editar ambas copias.
4. El buscador de la landing no coincide con la búsqueda implementada: envía `q`, ubicación y salario a `/auth/google`; el listado estudiantil espera `search`, `area`, `modality` y `contract_type`. No hay filtro de sueldo ni ubicación en el controlador actual.
5. El formulario de registro presenta dirección y descripción sin marca de obligatorio, pero el controlador las exige. La interfaz debe mostrar la obligatoriedad real y errores del servidor.
6. La interfaz indica máximo de 5 MB para el CV y el formulario de vacante limita posiciones a 50; los controladores permiten hasta 20 MB para PDF y hasta 100 posiciones. Para no inducir errores, mostrar los límites del backend actual.
7. El registro de empresa promete revisión en menos de 24 horas, pero ese SLA no está implementado como garantía. No prometer un plazo fijo sin confirmación institucional.
8. La vista `resources/views/privacy.blade.php` existe, pero no se encontró una ruta para mostrarla en `routes/web.php`. Confirmar antes de enlazarla en navegación.

## 3. Stack y arquitectura que debe preservarse

| Área | Estado actual | Directriz |
|---|---|---|
| Servidor y plantillas | Laravel 12, PHP 8.2, Blade | Usar las vistas y rutas nombradas existentes. |
| Estilos/componentes | Bootstrap 5, CSS institucional y Bootstrap Icons | Reutilizar el sistema actual; crear componentes Blade/CSS compartidos para evitar estilos duplicados. |
| Assets | Vite; `resources/css`, `resources/js` | Integrar los cambios al pipeline de Laravel. |
| Autenticación | Sesión Laravel; Socialite/Google para estudiantes | Mantener formularios POST, CSRF, respuestas y redirecciones del servidor. |
| Datos | Eloquent; perfiles, empresas, vacantes, postulaciones | Renderizar datos reales enviados por controladores; no sustituirlos por datos de muestra. |
| Prototipo Figma | React/Vite independiente | Consultarlo como guía visual; no copiarlo como aplicación productiva ni conectarlo con datos simulados. |

### Estructura existente relevante

```text
resources/views/       Vistas Blade por rol y componentes
resources/css/         app.css y unipaz-premium.css
resources/js/          app.js y bootstrap.js
routes/web.php         Rutas web y middleware
app/Http/Controllers/  Flujos, validaciones y datos de las pantallas
app/Models/            Entidades y relaciones
database/migrations/   Esquema y estados válidos
tests/                 Pruebas existentes
Inicio de sesión Bolsa de empleo/
                       Referencia visual Figma (proyecto independiente)
```

### Forma de integrar una acción

Una acción de negocio debe seguir utilizando su ruta y método HTTP Laravel; no reemplazarla por un botón decorativo ni por una respuesta simulada.

```blade
<form method="POST" action="{{ route('login') }}">
    @csrf
    <label for="email">Correo electrónico</label>
    <input id="email" name="email" type="email" autocomplete="email" required>
    <button type="submit">Ingresar</button>
</form>
```

Conservar `@csrf`, nombres de rutas, métodos HTTP y nombres de campos existentes. Si el backend retorna errores, mostrarlos junto al campo y conservar los valores no sensibles; nunca volver a mostrar una contraseña enviada.

## 4. Dirección visual

### Referencia de acceso Figma

Tomar del archivo `Inicio de sesión Bolsa de empleo/src/app/App.tsx`:

- Composición vertical centrada, cabecera de marca sobre una tarjeta clara.
- Selector segmentado de rol **Estudiante / Empresa**.
- Panel de estudiante con explicación del acceso institucional y CTA de Google.
- Panel de empresa con correo, contraseña, mostrar/ocultar contraseña, recordar sesión e ingreso.
- Jerarquía legible, campos amplios, estados de selección claros y elementos de identidad con maletín/graduación.
- En celular, conservar la sensación de “pantalla de app”, pero permitir scroll si el teclado o la altura disponible lo requieren.

No copiar la barra de estado dibujada como `9:41` ni los indicadores de señal/batería: son adornos del mockup, no UI web real. El botón “Regístrate” del panel de estudiante debe llevar al acceso Google, no prometer alta manual. La recuperación de contraseña no debe mostrarse como funcional mientras no exista ruta backend.

### Paleta propuesta

Unificar la experiencia alrededor de la paleta Figma para la nueva interfaz móvil y reservar los colores de estado para sus significados. No mezclar en una misma pantalla los distintos azules heredados sin tokens.

| Token | Valor de referencia | Uso |
|---|---|---|
| `brand-primary` | `#0A3D8F` | Navegación, botones primarios, enlaces importantes. |
| `brand-primary-strong` | `#0D1B4C` | Fondo oscuro de acceso y cabeceras institucionales. |
| `brand-accent` | `#2D9B4E` | CTA positivo y detalles de marca; no usar como único indicador de éxito. |
| `brand-accent-light` | `#7DD89A` | Acento sobre fondos oscuros. |
| `page-background` | `#EEF3FB` | Fondo de superficies secundarias. |
| `surface` | `#FFFFFF` | Formularios, tarjetas y hojas de navegación. |
| `text-primary` | `#1C2B4A` | Texto principal. |
| `text-muted` | `#5A6A8A` | Texto secundario, manteniendo contraste suficiente. |
| `input-background` | `#F5F8FF` | Campos de entrada. |

La aplicación actual también usa azul `#10235F`/`#273475` y verde `#00963F`; si se exige fidelidad exacta al manual institucional, validar estos tokens con el responsable de marca antes de reemplazarlos. Reutilizar los logotipos disponibles en `public/images/`; no dibujar un logo institucional nuevo.

### Tipografía, forma y densidad

- El prototipo usa Nunito/Nunito Sans; la web actual carga Prompt. Preferir la tipografía indicada por el diseño aprobado y aplicar una jerarquía tipográfica consistente en todas las pantallas.
- Usar fondo claro y superficies blancas en áreas de trabajo; reservar fondos oscuros/degradados sutiles para acceso y cabeceras.
- Reutilizar una escala de espaciado coherente y radios moderados. Evitar exceso de sombras, gradientes, tarjetas redundantes y animaciones que distraigan.
- Estados de vacante, empresa y postulación siempre llevan **texto más señal visual** (no solo color).
- Idioma de interfaz: español. Fechas visibles en formato local `dd/mm/aaaa`; moneda en pesos colombianos cuando el dato permita calcularlo. `salary_range` es texto libre, no inferir salario numérico.
- Nombre visible del producto: conservar **Emplea-UNIPAZ** como en la aplicación actual; el texto “UNIEmpleo” del prototipo es una variante de diseño a validar, no un cambio de marca automático.

## 5. Navegación y responsividad

### Navegación por contexto

**Visitante**

- Cabecera compacta con marca, acceso y registro de empresa.
- Landing con propósito institucional, cifras reales, pasos del proceso y vacantes recientes disponibles desde el controlador.
- CTA de estudiante conduce a autenticación Google; CTA de empresa conduce al registro/inicio de sesión.
- No prometer acceso anónimo al listado completo: actualmente `/estudiante/vacantes` requiere autenticación.

**Estudiante**

- Navegación móvil inferior sugerida: **Inicio**, **Vacantes**, **Postulaciones**, **Perfil**. Favoritos accesibles desde Vacantes o desde un menú “Más”, sin perder su ruta.
- En pantallas amplias, barra lateral actual o navegación superior secundaria.
- Acciones de cuenta: perfil, notificaciones y cerrar sesión.

**Empresa**

- Navegación móvil inferior sugerida: **Panel**, **Vacantes**, **Postulantes**, **Perfil**; Reportes en menú secundario.
- En escritorio, barra lateral con Panel, Mis vacantes, Perfil y Reportes. Postulaciones también debe quedar disponible desde panel y navegación secundaria porque su ruta ya existe.
- Si la empresa no está aprobada, mantener el aviso de estado; bloquear visualmente la creación de vacantes y explicar que requiere aprobación.

**Administrador**

- Navegación móvil con accesos principales a **Panel**, **Empresas**, **Usuarios** y **Vacantes**; Reportes y Perfil en menú “Más” o drawer.
- En escritorio, mantener la barra lateral entre pantallas, con indicador del número de empresas pendientes cuando esté disponible.
- Acciones administrativas destructivas/revocatorias requieren confirmación explícita.

### Reglas responsivas

- Enfoque mobile-first; probar anchuras **320, 360, 390, 768, 1024 y 1440 px**.
- `320–767 px`: una columna; navegación compacta e inferior para sesiones autenticadas; filtros en panel desplegable o formulario apilado; tarjetas en vez de tablas.
- `768–991 px`: priorizar una o dos columnas según densidad; menú lateral colapsable.
- `992 px o más`: conservar sidebar y paneles multicolumna donde ayuden a comparar información.
- Evitar desbordamiento horizontal de la página. Las tablas densas deben convertirse a tarjetas/filas expandibles en celular; no depender de una tabla que obligue a desplazamiento lateral para completar una tarea.
- Área táctil recomendada: mínimo **44 × 44 CSS px** para controles importantes. Inputs, botones y acciones primarias de ancho cómodo en móvil.
- Respetar `safe-area-inset-bottom` en la navegación fija inferior y dejar espacio al final del contenido para que esta no tape formularios.
- El teclado móvil no debe tapar el campo activo, errores, botón de guardar ni CTA de postulación.
- No fijar altura de pantalla que corte contenido; permitir scroll vertical natural y zoom del navegador.

## 6. Autenticación, registro y salida

### Inicio de sesión

**Pantalla:** `GET /login` (`login`), envío `POST /login`.

1. La pantalla inicia con la opción Estudiante seleccionada como en Figma.
2. Estudiante: botón “Continuar con Google” a `GET /auth/google` (`auth.google`); mostrar que se requiere correo `@unipaz.edu.co`.
3. Empresa y administrador: correo, contraseña, recordar sesión y botón Ingresar. Administrador usa el mismo formulario tradicional, sin selector de rol administrativo.
4. Error de credenciales, cuenta inactiva, acceso no permitido y error de Google deben mostrarse de forma comprensible sin borrar el correo.
5. Tras login, el backend redirige por rol: estudiante a `student.dashboard`, empresa a `company.dashboard`, administrador a `admin.dashboard`.
6. El login tradicional tiene límite actual de **5 intentos por minuto**. No ocultar los errores HTTP devueltos por el servidor.
7. Proteger contraseña con `autocomplete="current-password"` y control accesible para mostrar/ocultar.

El callback de Google valida el dominio, crea el perfil inicial si es un estudiante nuevo y rechaza cuentas desactivadas o usuarios no estudiantes. La autorización y el alta ocurren en servidor; el frontend no debe simular un usuario autenticado.

### Registro de empresa

**Pantalla:** `GET /register/empresa` (`company.register`), envío `POST /register/empresa` (`company.register.store`).

Formulario de una sola página, organizado en secciones que se puedan recorrer con scroll en móvil:

1. **Datos de acceso:** nombre del responsable, correo, contraseña y confirmación.
2. **Datos de empresa:** nombre, NIT, sector, teléfono, persona de contacto, dirección y descripción.
3. Explicar antes del envío que la empresa queda **pendiente** y necesita aprobación administrativa para publicar vacantes.

Reglas confirmadas por servidor:

| Campo | Regla de validación actual |
|---|---|
| `name` | Obligatorio, texto, máximo 255 caracteres. |
| `email` | Obligatorio, formato correo, único en usuarios. |
| `password` | Obligatoria, mínimo 8 caracteres y confirmación idéntica. |
| `company_name` | Obligatorio, texto, máximo 255 caracteres. |
| `nit` | Opcional, único; solo dígitos, puntos y guion. |
| `sector` | Obligatorio, texto, máximo 100 caracteres. |
| `contact_person` | Obligatorio, texto, máximo 255 caracteres. |
| `phone` | Obligatorio, texto, máximo 20 caracteres. |
| `address` | Obligatoria en servidor, texto, máximo 255 caracteres. |
| `description` | Obligatoria en servidor, texto, 10–1.000 caracteres. |

El servidor acepta sectores como texto, no como una enumeración fija. Las listas de sectores de registro y edición existentes difieren; mantener valores ingresados y no asumir que la lista visual equivale a una regla backend.

Al completar el registro no iniciar sesión automáticamente: el servidor vuelve a login con mensaje de registro pendiente.

### Registro de estudiantes y administración

- **Estudiante:** no existe formulario manual. La creación ocurre mediante Google OAuth al ingresar por primera vez y se crea un perfil académico inicial por completar.
- **Administrador:** no hay registro público. El acceso es con cuenta ya provisionada y correo/contraseña.
- **Olvidé mi contraseña:** la migración tiene una tabla de tokens, pero `routes/web.php` no expone rutas/controlador de recuperación. No presentar el enlace del prototipo como funcional; ocultarlo o mostrarlo deshabilitado solo si el equipo decide conservar esa invitación.

### Cerrar sesión

Enviar `POST /logout` con CSRF. Después del cierre, volver a la landing y descartar el estado visual autenticado. No conservar botones de postulación accesibles por una sesión anterior ni confiar únicamente en esconder pantallas en el cliente.

## 7. Pantallas funcionales por rol

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

## 8. Contrato de rutas de referencia

Los nombres entre paréntesis son los nombres actuales de Laravel. Utilizar `route('...')` en Blade en vez de duplicar URLs como texto en múltiples vistas.

| Área | Método y ruta | Nombre / acción |
|---|---|---|
| Pública | `GET /` | `home` |
| Login | `GET /login`, `POST /login` | `login` |
| Registro empresa | `GET /register/empresa`, `POST /register/empresa` | `company.register`, `company.register.store` |
| Google | `GET /auth/google`, `GET /auth/google/callback` | `auth.google`, `auth.google.callback` |
| Sesión | `POST /logout` | `logout` |
| Notificaciones | `GET /notifications/{id}/read` | `notifications.read` |
| CV HTML | `GET /hojas-de-vida/{user}` | `resumes.show` |
| Estudiante | `GET /estudiante/dashboard`, `/perfil`, `/perfil/hoja-de-vida`, `/postulaciones`, `/favoritos`, `/vacantes`, `/vacantes/{jobPosting}` | `student.dashboard`, `student.profile`, `student.profile.resume`, `student.applications`, `student.jobs.favorites`, `student.jobs`, `student.jobs.show` |
| Favorito/postulación | `POST /estudiante/vacantes/{jobPosting}/favorito`, `POST /estudiante/vacantes/{jobPosting}/postular` | `student.jobs.favorite`, `student.jobs.apply` |
| Empresa | `GET /empresa/dashboard`, `/perfil`, `/postulaciones`, `/reportes` | `company.dashboard`, `company.profile`, `company.applications`, `company.reports` |
| Empresa — vacantes | Recurso `/empresa/vacantes` (index/create/store/show/edit/update/destroy) y `POST /empresa/vacantes/{jobPosting}/toggle` | `company.jobs.*`, `company.jobs.toggle` |
| Empresa — postulaciones | `PUT /empresa/postulaciones/{application}` | `company.applications.update` |
| Administración | `GET /admin/dashboard`, `/perfil`, `/empresas`, `/usuarios`, `/vacantes`, `/vacantes/{jobPosting}`, `/reportes` | `admin.dashboard`, `admin.profile`, `admin.companies`, `admin.users`, `admin.vacancies`, `admin.vacancies.show`, `admin.reports` |
| Administración — acciones | `PUT /admin/perfil`; `POST /admin/empresas/{company}/aprobar|rechazar`; `DELETE /admin/empresas/{company}`; `POST /admin/usuarios/{user}/toggle`; `POST /admin/vacantes/{jobPosting}/toggle` | Rutas `admin.*` correspondientes en `routes/web.php` |
| Reportes PDF | `GET /empresa/reportes/pdf`, `GET /admin/reportes/pdf` | `company.reports.pdf`, `admin.reports.pdf` |

Las rutas no enumeradas aquí se deben verificar en `routes/web.php` antes de diseñar una acción. Las rutas administrativas y por rol requieren autenticación y middleware de rol; las vacantes de empresa también requieren aprobación.

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
- Inputs con `<label>` asociado; ayuda y error enlazados al campo; indicar campos requeridos también con texto/leyenda.
- Navegación completa por teclado, foco visible, orden lógico y foco gestionado al abrir/cerrar diálogos.
- Botones con nombre accesible aun cuando solo tengan icono; informar cambios y errores mediante regiones de estado accesibles.
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
6. Administración puede revisar empresas, usuarios, vacantes y reportes sin perder la navegación entre módulos.
7. No hay scroll horizontal de página ni controles tapados a 320/360/390/768/1024/1440 px; tablas se adaptan para lectura y acción en móvil.
8. Navegación inferior no tapa contenido, formularios ni CTA; el teclado móvil deja completar y enviar formularios.
9. Cada lista/formulario tiene estados de carga, error, vacío, éxito y permiso aplicables; los estados son accesibles por teclado/lector.
10. La interfaz usa datos reales del servidor y mantiene la identidad visual institucional aprobada.
11. Búsqueda, login, registro, subida de CV, favoritos, postulación, cambio de estados, exportación y cierre de sesión se verifican en el navegador contra el backend; no se consideran verificados por render o mocks.

### Validación recomendada para la implementación

- Compilar assets Laravel: `npm run build`.
- Suite backend existente: `php artisan test`.
- Revisar rutas disponibles: `php artisan route:list`.
- Prueba visual/manual en viewport y navegador móvil a los tamaños indicados y con teclado, lector/teclado y zoom.
- Si la implementación cambia el mecanismo de formularios, auth o rutas, añadir pruebas funcionales enfocadas para esos flujos antes de integrarla.

## 12. Límites y decisiones pendientes

### Siempre

- Preservar rutas nombradas, sesión Laravel, protección CSRF, validaciones y control de permisos.
- Reutilizar datos y componentes de las vistas existentes; mantener consistencia en estados, idioma, fechas y mensajes.
- Mostrar en UI los límites y requisitos reales del servidor y manejar errores explícitamente.
- Probar en móviles y escritorios, incluidos estados vacíos y fallos de red/validación.

### Consultar antes de

- Convertir el sitio responsivo en aplicación nativa o PWA.
- Añadir dependencias, cambiar Blade/Bootstrap por React o crear una API.
- Cambiar colores/tipografías oficiales, agregar registro de estudiantes/admin o recuperación de contraseña.
- Habilitar listado público, filtros de ubicación/salario, edición de listas de áreas/carreras o nuevas acciones administrativas.
- Cambiar rutas, validaciones, estados, tamaños permitidos, política de archivos o comportamiento de sesión.

### Nunca

- Guardar credenciales/secrets en el frontend, el repositorio o datos de ejemplo.
- Usar mocks como resultado final de autenticación, postulación, aprobación o publicación.
- Exponer notas internas, permitir acceso a CV sin la autorización existente o asumir rol solo por selección visual.
- Eliminar/ocultar errores del servidor, desactivar controles de seguridad o declarar como funcional un enlace sin endpoint.

### Preguntas abiertas para una siguiente fase

1. ¿La entrega final se mantiene como web responsiva Laravel o se requiere empaquetado PWA/app nativa?
2. ¿Se autorizará que visitantes vean y filtren vacantes antes de iniciar sesión?
3. ¿Se desean filtros de ubicación/salario y recuperación de contraseña? Requieren contrato/backend.
4. ¿Debe existir registro manual de estudiante, o se conserva el alta exclusivamente mediante Google OAuth institucional?
5. ¿Cuál es la paleta/tipografía definitiva entre Figma y el tema institucional ya desplegado?
6. ¿Se confirma un plazo de aprobación empresarial que pueda prometerse al usuario?

## 13. Archivos de referencia

- [`routes/web.php`](routes/web.php)
- [`app/Http/Controllers/Auth/GoogleController.php`](app/Http/Controllers/Auth/GoogleController.php)
- [`app/Http/Controllers/Auth/CompanyAuthController.php`](app/Http/Controllers/Auth/CompanyAuthController.php)
- [`app/Http/Controllers/Student/JobController.php`](app/Http/Controllers/Student/JobController.php)
- [`app/Http/Controllers/Company/JobPostingController.php`](app/Http/Controllers/Company/JobPostingController.php)
- [`app/Http/Controllers/Admin/DashboardController.php`](app/Http/Controllers/Admin/DashboardController.php)
- [`resources/views/layouts/app.blade.php`](resources/views/layouts/app.blade.php)
- [`resources/views/home.blade.php`](resources/views/home.blade.php)
- [`resources/views/auth/login.blade.php`](resources/views/auth/login.blade.php)
- [`resources/views/auth/company-register.blade.php`](resources/views/auth/company-register.blade.php)
- [`Inicio de sesión Bolsa de empleo/src/app/App.tsx`](Inicio%20de%20sesi%C3%B3n%20Bolsa%20de%20empleo/src/app/App.tsx)
- [`Inicio de sesión Bolsa de empleo/src/styles/theme.css`](Inicio%20de%20sesi%C3%B3n%20Bolsa%20de%20empleo/src/styles/theme.css)
- [`mejoras_qa_dev.md`](mejoras_qa_dev.md)
