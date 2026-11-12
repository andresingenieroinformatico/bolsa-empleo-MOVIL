# El tablero de Bolsa de Empleo UNIPAZ en GitHub Projects

> **Sprint 0 · Paso 5.** Lo configura el Scrum Master (*Juan Jose Figueroa Ayala*). Si se clona este repositorio para practicar, hay que crear el proyecto propio: un proyecto de GitHub no viaja con el repositorio.

---

## 1. Crear el proyecto y enlazarlo

1. Perfil (u organización del equipo en GitHub) → **Projects** → **New project** → seleccionar plantilla en blanco **Board**.
2. **Nombre:** `Bolsa de Empleo UNIPAZ`.  
   **Descripción:** el Objetivo del Producto de `docs/vision-y-alcance.md`:  
   *«Lograr que los estudiantes de UNIPAZ puedan encontrar y postularse a ofertas laborales compatibles con su disponibilidad académica desde una aplicación móvil, facilitando la conexión con empleadores de Barrancabermeja»*.
3. En el repositorio: pestaña **Projects** → **Link a project** → seleccionar `Bolsa de Empleo UNIPAZ`.
4. Proyecto → **⋯ → Settings → Manage access**: asignar rol **Write** a cada integrante del equipo (Andres Ferney Garcia, Juan Jose Figueroa, Darwin Garcia, Cristian Santiago Moncada) y rol **Read** al docente/evaluador.

---

## 2. Columnas, límites y campos

**Status** (columnas del tablero, en este orden):  
`Backlog` · `Listo` · `En desarrollo` · `En revisión` · `En dispositivo` · `Hecho`.

**Límites WIP** (menú de cada columna → *Set column limit*, disponible en vistas Board):  
`Listo: 5` · `En desarrollo: 4` · `En revisión: 2` · `En dispositivo: 2`.

**Campos personalizados** (desde la vista de tabla → **+** → *New field*):

| Campo | Tipo | Valores |
|---|---|---|
| **Tipo** | Single select | `Historia` · `Técnica` · `Documentación` |
| **Prioridad** | Single select | `Must` · `Should` · `Could` |
| **Épica** | Single select | `Autenticación` · `Empresas` · `Vacantes` · `Postulaciones` · `Administración` · `Perfil` |
| **Puntos** | Number | `1` · `2` · `3` · `5` · `8` |
| **Sprint** | Iteration | 1 semana, empezando el día de la Sesión B de la semana 3 |

---

## 3. Cargar el backlog

Con GitHub CLI (`gh`), desde la carpeta raíz del repositorio:

```powershell
gh auth refresh -s project              # una sola vez para otorgar permisos sobre proyectos
.\scripts\crear-backlog.ps1 -Proyecto "Bolsa de Empleo UNIPAZ"
```

El script crea las etiquetas del repositorio (`historia`, `tecnica`, `defecto`, `investigacion`, `bloqueada`) y genera un issue por cada elemento de `docs/backlog.md`, ya vinculado al proyecto.

Posteriormente, en la vista de tabla del proyecto, se rellenan **Tipo, Prioridad, Épica, Puntos y Sprint** de cada fila (se puede copiar y pegar un valor en varias celdas simultáneamente).

---

## 4. Vistas

| Vista | Layout | Configuración |
|---|---|---|
| **Backlog** | Table | Filtro `-status:Hecho`, orden manual del PO, *View → Field sum → Puntos* |
| **Sprint actual** | Board | Columnas por Status con límites WIP, filtro `sprint:@current`. Es la que se proyecta en el Daily |
| **Por épica** | Table | *View → Group by → Épica*. Filtro `-status:Hecho`. Sirve para el seguimiento de entregables del Hito |

---

## 5. Flujos automáticos

En el menú del proyecto **⋯ → Workflows**, activar:
- *Item added to project* → Status **Backlog**.
- *Item closed* → mover automáticamente a **Hecho**.
- *Pull request merged* → mover a **Hecho**.

El Pull Request que contenga en su descripción `Closes #N` cierra el issue automáticamente al fusionarse en `main`, y la tarjeta llega sola a **Hecho**.  
*Nota:* Antes de fusionar, la tarjeta debe haber pasado y validado sus criterios en **«En dispositivo»**.

---

## Errores frecuentes

| Síntoma | Qué hacer |
|---|---|
| No aparece *Set column limit* | La vista está en Table o Roadmap: cámbiala a **Board**. |
| `gh` responde «missing required scopes» | Ejecutar en terminal: `gh auth refresh -s project`. |
| Un compañero no puede mover tarjetas | Proyecto → Settings → Manage access → otorgar rol **Write**. |
| La plantilla de issue no sale | Debe estar ubicada en `.github/ISSUE_TEMPLATE/`, terminar en `.yml` y estar fusionada en la rama `main`. |
