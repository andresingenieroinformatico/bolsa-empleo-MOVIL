# Requisitos — Bolsa de Empleo UNIPAZ (React Native + Next.js)

## 1. Problema y ODS

Los estudiantes del Instituto Universitario de la Paz (UNIPAZ) en Barrancabermeja tienen serias dificultades para encontrar empleo o prácticas compatibles con sus horarios académicos y que les permitan generar ingresos para continuar sus estudios. Actualmente, las oportunidades laborales circulan de forma dispersa e informal en grupos de WhatsApp, publicaciones aisladas de Facebook, contactos personales o carteleras físicas; no hay centralización institucional, muchas ofertas ya están vencidas, no hay certeza de que las empresas sean formales y los estudiantes no reciben constancia ni respuesta alguna sobre el estado de sus postulaciones.

Este problema se enmarca directamente en el **ODS 8: Trabajo decente y crecimiento económico**, en especial:
- **Meta 8.5:** «De aquí a 2030, lograr el empleo pleno y productivo y el trabajo decente para todas las mujeres y los hombres, incluidos los jóvenes y las personas con discapacidad, así como la igualdad de remuneración por trabajo de igual valor».
- **Meta 8.6:** «De aquí a 2020, reducir sustancialmente la proporción de jóvenes que no están empleados y no cursan estudios ni reciben capacitación».
- Vinculación complementaria con el **ODS 4: Educación de calidad** (meta 4.4: competencias técnicas y profesionales para el empleo). Detalle en `vision-y-alcance.md`.

---

## 2. Visión y Objetivo del Producto

**Objetivo del Producto:** «Que cualquier estudiante de UNIPAZ consulte ofertas laborales verificadas en Barrancabermeja, filtre según su disponibilidad horaria y se postule con su hoja de vida en menos de dos minutos desde su teléfono móvil, y que las empresas e institución cuenten con un canal organizado y con trazabilidad».

La declaración de visión completa está en `vision-y-alcance.md`.

---

## 3. Usuarios

### 3.1 Proto-persona · Carlos Andrés Mendoza

**21 años · estudiante de 6.° semestre de Ingeniería de Producción / Sistemas · barrio Galán, Barrancabermeja.**  
Usuario principal: el estudiante de UNIPAZ que aparece en el recorrido de las historias Must. La empresa y el administrador institucional tendrán sus personas formalizadas a medida que se desplieguen HU-07 y HU-08.

| Campo | Contenido |
|---|---|
| **Contexto** | Cursa materias en jornada mixta (algunas mañanas y noches en el campus UNIPAZ). Necesita ingresos para costear transporte diario, fotocopias y matrícula sin tener que abandonar la carrera. Ayuda en el negocio familiar en sus horas libres. |
| **Teléfono y conexión** | Smartphone Android de gama de entrada/media con almacenamiento interno ajustado *(por validar)*. Plan de datos móviles prepago con recargas que no siempre le duran todo el mes *(por validar)*. Aprovecha la red Wi-Fi de la universidad cuando asiste a clases. Usa WhatsApp y aplicaciones académicas a diario. |
| **Quiere lograr** | Encontrar oportunidades de empleo de medio tiempo, fines de semana o trabajo remoto compatibles con sus clases, y postularse en segundos sin tener que imprimir hojas de vida ni gastar en transporte para llevarlas a ciegas. |
| **La frena hoy** | Las ofertas que encuentra piden disponibilidad de tiempo completo inmediato; los salarios o condiciones no son claros; cuando envía su hoja de vida a correos genéricos nunca sabe si la recibieron, si la vacante cerró o si fue descartado *(por validar)*. |
| **Una frase suya** | «Uno manda la hoja de vida por correo o la deja en porterías y nunca le dicen nada a uno. Y si sale algo de tiempo completo, me tocaría congelar el semestre.» *(frase supuesta)* |

**Cada dato cambia una decisión:**
- El almacenamiento ajustado obliga a comprimir y limitar las hojas de vida en PDF a máximo 5 MB (RC-04), avisando si el archivo supera el límite (HU-09).
- Los datos prepago hacen indispensable un consumo mínimo de datos en la API (JSON optimizados) y que las ofertas consultadas queden en caché local (HU-04).
- La jornada universitaria fragmentada convierte el **filtro de disponibilidad horaria** en una historia central Must (HU-04 y HU-09).
- La incertidumbre de los procesos tradicionales hace que las **notificaciones push ante cambios de estado** (HU-06) sean el canal directo para cerrar el ciclo de ansiedad del estudiante.

---

### 3.2 Mapa de experiencia · la situación de hoy, sin la app

**Escenario:** Carlos necesita ingresos para el semestre y busca un empleo de medio tiempo en Barrancabermeja compatible con sus horarios de clase en UNIPAZ.

| | 1 · Necesita ingresos | 2 · Busca opciones | 3 · Postula | 4 · Espera | 5 · No sabe qué pasó |
|---|---|---|---|---|---|
| **Hace** | Revisa sus gastos de matrícula y pasajes; decide buscar trabajo | Pregunta en grupos de WhatsApp, mira publicaciones en Facebook y carteleras | Envía su hoja de vida por correo a una empresa o la entrega impresa | Revisa el correo y su teléfono todos los días | Deja de insistir tras semanas de silencio |
| **Piensa** | «Los horarios de clase me limitan mucho.» | «Casi todo pide tiempo completo o experiencia.» | «Ojalá vean que tengo disponibilidad en las tardes.» | «¿Habrán revisado mi correo?» | «Perdí el tiempo, no sé si contrataron a alguien.» |
| **Siente** | Preocupado | Abrumado | Esperanzado ↓ | Ansioso | Frustrado y resignado ↓↓ |
| **Dolor** | Falta de dinero y tiempo | Ofertas dispersas, dudosas o sin horarios definidos | Proceso lento, costo en impresiones y transporte | Cero trazabilidad de la postulación | Falta total de respuesta y retroalimentación |
| **Oportunidad** | Conectar con empleadores que busquen talento UNIPAZ | Un único canal móvil con ofertas verificadas y filtros por horario | Postulación en dos toques con el CV del perfil en PDF | Confirmación inmediata de recepción en el sistema | Notificaciones automáticas de cambio de estado |
| **Historia** | HU-01 · HU-09 | HU-04 · HU-09 | HU-05 | HU-05 · HU-06 | HU-06 · HU-07 |

**Lo que el mapa enseñó:**
1. La fase 5 (la incertidumbre que lleva al desánimo del estudiante) carecía de trazabilidad en los procesos convencionales. Se resolvió en el MVP priorizando **HU-06 (Seguimiento de estado con notificaciones push)**.
2. En la fase 2 y 3 se detectó que el estudiante pierde tiempo postulándose a vacantes cuyos horarios no coinciden con sus clases. De allí nació como requisito Must **HU-09 (Registro de disponibilidad horaria y programa académico)**.

---

## 4. Alcance

### 4.1 Mapa de historias y línea del MVP

| | 1 · Identificarse y Perfil | 2 · Publicar y Gestionar Vacantes | 3 · Buscar Ofertas | 4 · Postularse y Seguimiento |
|---|---|---|---|---|
| *Fases del mapa* | *Fase 1 y 2* | *Fase 2* | *Fase 2* | *Fase 3, 4 y 5* |
| **MVP · Hito 1 (Sprint 1)** | HU-01 · Iniciar sesión con Google (3) | HU-03 · Publicar vacante por empresa (3) | HU-04 · Búsqueda y filtros de vacantes (3) | HU-05 · Postularse con CV en PDF (3) |
| | HU-02 · Registro de empresa (3) | HU-07 · Ver candidatos y actualizar estado (3) | | HU-06 · Estado de postulación y alertas (2) |
| | HU-09 · Perfil y disponibilidad (3) | | | |
| **Después del MVP · Hito 2** | — | HU-08 · Panel de administración y KPIs (3) | HU-10 · Guardar ofertas favoritas (2) | HU-11 · Notificaciones por correo adicionales (2) |
| | | HU-12 · Edición avanzada de empresas (2) | | |
| **Si sobra tiempo** | — | — | HU-13 · Compartir vacante por WhatsApp (2) | HU-14 · Exportación de reportes a Excel (3) |

Sostienen todo el mapa sin colgarse de una sola actividad funcional: **TEC-01** (Configuración base React Native / Expo, 2 pts) y **TEC-02** (API Next.js + Prisma ORM + JWT, 3 pts) en el MVP; **TEC-03** (Worker de notificaciones y emails, 2 pts) después.

| Comprobación | Resultado |
|---|---|
| Cada actividad del mapa tiene al menos una historia sobre la línea | 4 de 4 |
| Nada sobre la línea se puede quitar sin romper el Objetivo del Producto | Sí |
| Elementos en el MVP (historias + 2 técnicas) | 7 historias + 2 técnicas = 9 |
| Puntos sobre la línea del MVP | 25 de 46 = **54.3 %** (tope recomendado: 60 %) |
| Revisión técnica contra arquitectura | React Native / Expo en cliente; Next.js API Routes + Prisma MySQL en backend |

### 4.2 MoSCoW actualizado y fuera del alcance

En `vision-y-alcance.md`, con la tabla de cambios y alcance detallado.

**Fuera del alcance para esta versión (Won't Have):**
- Chat interno en tiempo real entre estudiante y empleador.
- Videollamadas o salas de entrevista virtuales integradas.
- Contratación laboral directa o firma electrónica de contratos desde la app.
- Módulos de nómina, dispersión salarial o prestaciones sociales.
- Selección o descarte automatizado de candidatos mediante inteligencia artificial.
- Intermediación laboral como bolsa de empleo tercerizada externa.

---

## 5. Historias de usuario y criterios de aceptación

Vista **«Por épica»** del backlog. Criterios de aceptación detallados en formato Gherkin en `docs/criterios/*.feature`.

| ID | Historia | Prioridad | Pts | Escenarios | Feliz · error · móvil |
|---|---|---|---|---|---|
| **HU-01** | Autenticación de estudiante con Google OAuth institucional | Must | 3 | 4 | Login exitoso · dominio no UNIPAZ · cancelación de permisos en pantalla móvil |
| **HU-02** | Registro y verificación de empresa | Must | 3 | 6 | Empresa pendiente · correo duplicado · NIT inválido · aprobación/rechazo con auditoría · cuenta inactiva |
| **HU-03** | Publicación de vacantes por empresa aprobada | Must | 3 | 9 | Vacante activa · empresa no aprobada · selector de fecha límite · pausa · reactivación · cierre |
| **HU-04** | Búsqueda y consulta de vacantes con filtros | Must | 3 | 7 | Listado paginado · filtros por horario/área/modalidad/programa · sin resultados · detalle |
| **HU-05** | Postulación a vacantes adjuntando hoja de vida | Must | 3 | 5 | Postulación exitosa · duplicada rechazada · reutilizar CV del perfil · llamada entrante a mitad del envío |
| **HU-06** | Seguimiento del estado de postulación | Must | 2 | 7 | Ver historial · cambios de estado y avisos push · permisos denegados · notas de empresa ocultas |
| **HU-07** | Gestión de candidatos por parte de la empresa | Must | 3 | 7 | Ver aspirantes · descarga de CV seguro · actualización de estado · error 403 en vacante ajena |
| **HU-08** | Indicadores principales de administración | Should | 3 | 2 | KPIs principales · acceso restringido por rol |
| **HU-09** | Perfil del estudiante y disponibilidad horaria | Must | 3 | 6 | Perfil académico · disponibilidad · subir/reemplazar PDF · validar formato y límite de 5 MB |
| **HU-15** | Consulta del listado de usuarios | Should | 2 | 4 | Búsqueda · filtro por rol · paginación · estado vacío |
| **HU-16** | Gráfico mensual de postulaciones | Could | 3 | 3 | Año en curso · meses sin datos · exclusión de otros años |
| **HU-17** | Activación y desactivación de cuentas | Should | 2 | 4 | Desactivar · reactivar · proteger cuentas admin · acceso restringido |
| **HU-18** | Historial de acciones administrativas | Should | 2 | 4 | Consultar cambios · registrar actor y acción · proteger información sensible · acceso restringido |

*Nota sobre HU-06 y HU-07:* Los cambios de estado ejecutados en HU-07 disparan automáticamente las alertas y eventos evaluados en HU-06, compartiendo el mismo modelo relacional (`Application`).

Las funciones administrativas de HU-02 y HU-03 también generan registros de auditoría según HU-18. La aprobación empresarial y la moderación de vacantes permanecen en sus historias originales para evitar duplicar alcance.

---

## 6. Requisitos de calidad y restricciones

Según la norma internacional **ISO/IEC 25010:2023** (Calidad de producto de software).

| ID | Característica | Requisito medible | Dónde vive |
|---|---|---|---|
| **RC-01** | Capacidad de interacción (Facilidad de uso) | Un estudiante que abre la app por primera vez completa su inicio de sesión con Google y se postula a su primera vacante en menos de dos minutos y sin requerir soporte externo. | Objetivo del Producto; medido en pruebas de usabilidad del Sprint 1 |
| **RC-02** | Accesibilidad táctil y visual | Toda área táctil (botones, chips de filtro, inputs) mide al menos 48 × 48 dp y el texto respeta un contraste de mínimo 4.5:1 respecto al fondo. | Definición de Terminado (DoD) y componentes UI |
| **RC-03** | Eficiencia de desempeño | La pantalla de vacantes renderiza en menos de 1 segundo con 50 registros cacheados localmente en un smartphone Android de gama de entrada. | Criterio de HU-04; pruebas de rendimiento móvil |
| **RC-04** | Uso de recursos (Archivos) | Cada hoja de vida adjunta en formato PDF ocupa un máximo de 5 MB y el selector valida el tipo MIME antes de enviar la petición. | Criterio de HU-05 y HU-09 |
| **RC-05** | Fiabilidad y persistencia | Ningún formulario de postulación o datos del perfil se pierden si entra una llamada telefónica, la app pasa a segundo plano o se produce un corte breve de conectividad. | Criterios de HU-05 y HU-09 |
| **RC-06** | Seguridad y privacidad | Las hojas de vida se almacenan en almacenamiento protegido (no expuestas por URL pública directa). El campo `company_notes` jamás se expone al estudiante. Se cumple con la Ley 1581 de 2012 de protección de datos personales de Colombia. | Arquitectura de API en Next.js y endpoints de descarga |
| **RC-07** | Compatibilidad | La app funciona en Android 8.0 (API 26) o superior y en pantallas desde 360 dp de ancho. | Definición de Terminado y configuración en `app.json` |

### Restricciones tecnológicas del proyecto
- **Frontend Móvil:** React Native con Expo SDK 51+, TypeScript, React Navigation y NativeWind / Tailwind CSS.
- **Backend API:** Next.js 14/15 con App Router y Route Handlers (`/api/...`), Node.js y esquemas de validación Zod.
- **Base de Datos y ORM:** MySQL 8.0 / MariaDB administrado mediante Prisma ORM con migraciones estructuradas.
- **Autenticación:** Google OAuth 2.0 (restringido a correos `@unipaz.edu.co`) y tokens JWT almacenados en `Expo SecureStore`.
- **Notificaciones:** Expo Push Notifications (`expo-server-sdk`) y correos transaccionales vía Nodemailer (SMTP).

---

## 7. Hallazgos heurísticos

Inspección de las historias Must realizada bajo las **diez heurísticas de usabilidad de Jakob Nielsen**, previo a la codificación final de pantallas.

| Heurística | Historia | Hallazgo | Sev. (0-4) | Destino |
|---|---|---|---|---|
| **H5 · Prevención de errores** | HU-05 / HU-09 | Si el estudiante selecciona un archivo que no es PDF o que pesa más de 5 MB, la app fallaba silenciosamente sin explicar el motivo. | 4 | Validación inmediata en el cliente con mensaje explicativo antes de iniciar la subida. |
| **H3 · Control y libertad** | HU-05 | Si entra una llamada a mitad de redactar la carta de presentación o adjuntar el CV, el formulario se reiniciaba. | 3 | Estado persistido en memoria local/hook de formulario para conservar la información. |
| **H10 · Ayuda y retroalimentación** | HU-05 | El estudiante no sabía qué ocurría con su postulación tras presionar "Postularme" ni cuándo tendría noticias. | 3 | Modal de confirmación indicando: «Postulación enviada. La empresa revisará tu perfil y recibirás una notificación push con las novedades». |
| **H1 · Visibilidad del estado** | HU-04 / HU-05 | En el listado de vacantes, el estudiante no distinguía a simple vista cuáles vacantes ya tenían una postulación activa suya. | 2 | Etiqueta / badge visible «Ya postulado» en la tarjeta de la vacante, inhabilitando el botón repetido. |
| **H2 · Coincidencia con el mundo real** | HU-09 | Los campos del perfil académico deben coincidir con la nomenclatura institucional de UNIPAZ («Código estudiantil», «Semestre», «Programa académico»). | 2 | Estandarización de textos y selectores en los componentes de perfil. |

---

## 8. Validación con usuarios

**Estado: En preparación para trabajo de campo.**  
Se ejecutará la actividad **INV-02**, consistente en 5 entrevistas estructuradas de 20 minutos (3 a estudiantes de UNIPAZ de diferentes programas y jornadas, y 2 a representantes de empresas locales en Barrancabermeja) antes del cierre del Sprint 1.

Los instrumentos oficiales se encuentran documentados en:
- Guion de entrevista: `docs/validacion/guion-entrevista.md`
- Ficha de validación y registro: `docs/validacion/ficha-validacion.md`

Las fichas diligenciadas se registrarán como evidencias del proyecto, permitiendo validar las hipótesis de conectividad y ajustar las historias de usuario de ser necesario.

---

## 9. Preguntas abiertas

| Pregunta | A quién |
|---|---|
| ¿Qué franjas de disponibilidad horaria son las más viables para las empresas locales (mañanas, tardes, fines de semana)? | Representantes de empresas (entrevista INV-02) |
| ¿Los estudiantes suelen tener su hoja de vida actualizada en formato PDF en el almacenamiento de su teléfono? | Estudiantes UNIPAZ (entrevista INV-02) |
| ¿Qué porcentaje de estudiantes cuenta con plan de datos continuo versus dependencia exclusiva de la red Wi-Fi universitaria? | Estudiantes UNIPAZ (entrevista INV-02) |
| ¿Cuál es la versión mínima de Android presente entre los estudiantes encuestados para ajustar el `minSdkVersion`? | Estudiantes UNIPAZ (entrevista INV-02) |
| ¿Qué validación formal de personería jurídica exige UNIPAZ para autorizar a una empresa externa a ofertar vacantes (solo NIT o RUT/Cámara de Comercio)? | Coordinación de Prácticas y Egresados de UNIPAZ |
| ¿Requiere la universidad un reporte mensual consolidado de estudiantes vinculados laboralmente a través de la app? | Dirección Académica / Administrador institucional |
