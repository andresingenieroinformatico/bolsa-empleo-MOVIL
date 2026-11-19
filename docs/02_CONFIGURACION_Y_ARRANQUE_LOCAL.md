# UniEmpleo — Configuración de direcciones y arranque local sin errores

Este documento explica **qué direcciones debe tener cada capa**, cómo configurarlas y el
procedimiento paso a paso que permitió ejecutar el proyecto en local sin errores.
Está escrito para Windows con PowerShell, que es el entorno donde se validó.

---

## 1. Mapa de direcciones (cómo se conectan las tres capas)

La app **nunca llama directamente a Laravel**. Siempre habla con el gateway (Next.js) y
el gateway reenvía la petición a Laravel. Por eso hay tres direcciones que deben coincidir:

```
App (Expo, puerto 8081/8082)
   │  EXPO_PUBLIC_API_URL=http://192.168.80.25:3000/api/v1
   ▼
Gateway (Next.js, puerto 3000)
   │  LARAVEL_API_URL=http://127.0.0.1:8000
   ▼
API Laravel (puerto 8000)
   │  APP_URL=http://192.168.80.25:8000   ← se usa para construir los cv_url
   ▼
SQLite + storage/app/public (PDFs)
```

| Capa | Dirección local usada | Archivo donde se configura |
| --- | --- | --- |
| App móvil/web | `http://192.168.80.25:3000/api/v1` | `UniEmpleo/.env.local` → `EXPO_PUBLIC_API_URL` |
| Gateway → Laravel | `http://127.0.0.1:8000` | `UniEmpleo/src/Api/.env.local` → `LARAVEL_API_URL` |
| Laravel (URL pública) | `http://192.168.80.25:8000` | `bolsa-empleo-unipaz-main/.env` → `APP_URL` |
| Gateway (orígenes permitidos) | puertos 8081, 8082, 19006 e IP local | `UniEmpleo/src/Api/.env.local` → `CORS_ALLOWED_ORIGINS` |
| Base de datos Laravel | `database/database.sqlite` | `bolsa-empleo-unipaz-main/.env` → `DB_CONNECTION`, `DB_DATABASE` |

### Regla importante para elegir la IP

- `127.0.0.1` / `localhost` funciona **solo desde la misma PC**.
- Para probar desde el **teléfono** o desde otra PC de la red, usar la IP LAN de la
  máquina donde corre el servidor (en este caso `192.168.80.25`).

Para obtenerla en PowerShell:

```powershell
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' } |
  Select-Object IPAddress, InterfaceAlias
```

Si la IP cambia (por ejemplo al conectarse a otra red WiFi), hay que actualizar
**tres archivos**: `UniEmpleo/.env.local`, `UniEmpleo/src/Api/.env.local` (en
`CORS_ALLOWED_ORIGINS`) y `bolsa-empleo-unipaz-main/.env` (`APP_URL`).

---

## 2. Archivos de configuración y valores exactos que funcionaron

### 2.1 `UniEmpleo/.env.local` (app Expo)

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.80.25:3000/api/v1
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<client-id-de-google>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<client-id-de-google>
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<client-id-de-google>
```

- El sufijo `/api/v1` es obligatorio: los `fetch` de `src/services/api.ts` concatenan
  rutas como `/auth/login`, `/jobs`, etc.
- Si se prueba solo en navegador de la misma PC, se puede usar
  `http://127.0.0.1:3000/api/v1`. Para móvil, usar la IP LAN.
- Los Client ID de Google son los de `src/Api/.env.example`; si no se va a usar
  "Continuar con Google", pueden dejarse vacíos, pero las variables deben existir.

Después de cambiar este archivo hay que **reiniciar Expo** y, si está abierto,
recargar la página web (Expo no recarga variables de entorno en caliente).

### 2.2 `UniEmpleo/src/Api/.env.local` (gateway Next.js)

```dotenv
DATABASE_URL="mysql://root:@127.0.0.1:3306/bolsa_empleo_unipaz"
LARAVEL_API_URL="http://127.0.0.1:8000"
CORS_ALLOWED_ORIGINS="http://localhost:8081,http://127.0.0.1:8081,http://localhost:8082,http://127.0.0.1:8082,http://localhost:19006,http://127.0.0.1:19006,http://192.168.80.25:8081,http://192.168.80.25:8082"
JWT_SECRET="4OfBJQFSKI5iMDygAxp9oWEGVu6wPLHnk1l0XZC8mdht3cU7"
PORT=3000
ALLOW_DESTRUCTIVE_SEED=false
AUDIT_LOG_ENABLED="false"
```

- `LARAVEL_API_URL` es la dirección **interna** del gateway a Laravel. Se deja en
  `127.0.0.1` aunque la app use la IP LAN, porque ambos servidores corren en la
  misma máquina.
- `CORS_ALLOWED_ORIGINS` debe incluir el puerto exacto desde el que se abre Expo.
  Si la web se abre en `8082` y ese origen no está en la lista, el navegador
  bloquea las peticiones. `middleware.ts` es quien aplica estos headers.
- `AUDIT_LOG_ENABLED="false"` desactiva Prisma/MySQL. Es necesario porque el MySQL
  local está detenido y no hay privilegios de administrador para iniciarlo. Si se
  dejara en `true`, el gateway intentaría registrar auditoría y fallaría.
- `DATABASE_URL` puede permanecer aunque Prisma esté desactivado; no se usa.
- `JWT_SECRET` es un valor de ejemplo; en producción debe ser una cadena larga
  y aleatoria.

Plantilla de referencia: `UniEmpleo/src/Api/.env.example`.

### 2.3 `bolsa-empleo-unipaz-main/.env` (Laravel)

Valores que deben estar presentes:

```dotenv
APP_NAME="Bolsa de Empleo UNIPAZ"
APP_ENV=local
APP_KEY=base64:kVAWznusTAeSdsm5Tk91Ns7jE8O5WjyHJj5EIHnEjd4=
APP_DEBUG=true
APP_URL=http://192.168.80.25:8000

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local

MAIL_MAILER=log
MAIL_FROM_ADDRESS="bolsaempleo@unipaz.edu.co"
MAIL_FROM_NAME="${APP_NAME}"

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

- `APP_URL` **debe ser la IP LAN**, no `localhost`. Laravel genera `cv_url` a partir
  de esta variable. Si queda `http://localhost:8000/storage/cvs/...`, el teléfono
  intentará descargar el PDF de sí mismo y fallará.
- La base de datos activa es SQLite. La opción MySQL del archivo está comentada;
  no descomentarla mientras el servicio MySQL esté detenido.
- `MAIL_MAILER=log`: los correos de notificación se escriben en
  `storage/logs/laravel.log` en lugar de enviarse por SMTP.
- `APP_KEY` se genera con `php artisan key:generate`. **No cambiarlo después de
  haber creado la sesión**, porque invalidaría las sesiones existentes.
- `FILESYSTEM_DISK=local` + `storage:link` permiten servir los PDFs en `/storage/...`.

---

## 3. Paso a paso para que funcione en local sin errores

### Paso 0 — Requisitos

- PHP 8.4 con extensiones `pdo_sqlite`, `mbstring`, `openssl`.
- Composer.
- Node.js 20+ y npm.
- Expo CLI (se usa mediante `npx expo`, no hace falta instalarla global).

### Paso 1 — Backend Laravel

Ubicación: `C:\Users\DARWIN GARCIA\Documents\UNIVERSIDAD\Vsc\bolsa-empleo-unipaz-main`

```powershell
# 1. Dependencias (solo la primera vez)
composer install

# 2. Copiar el archivo de entorno y generar la clave
Copy-Item .env.example .env
php artisan key:generate

# 3. Ajustar .env según la sección 2.3 (APP_URL con la IP LAN, SQLite)

# 4. Crear el archivo SQLite si no existe
if (!(Test-Path database\database.sqlite)) { New-Item database\database.sqlite -ItemType File }

# 5. Migraciones y datos semilla
php artisan migrate --force
php artisan db:seed --force

# 6. Enlace simbólico para servir los PDFs
php artisan storage:link

# 7. Limpiar y recachear la configuración (para que APP_URL tome efecto)
php artisan config:clear
php artisan config:cache
```

### Paso 2 — Arrancar Laravel con los límites de subida correctos

`php artisan serve` no funcionó en este entorno. Se usa el servidor de
desarrollo de PHP desde la carpeta `public`, con banderas explícitas para
permitir PDFs de 20 MB:

```powershell
cd "C:\Users\DARWIN GARCIA\Documents\UNIVERSIDAD\Vsc\bolsa-empleo-unipaz-main\public"
php -d upload_max_filesize=20M -d post_max_size=24M -d memory_limit=256M `
    -S 0.0.0.0:8000 -t . "..\vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php"
```

- El `0.0.0.0` es necesario para que el teléfono pueda conectarse. Si solo se
  prueba en la PC, `127.0.0.1` también funciona.
- Sin las banderas `-d`, PHP usa `upload_max_filesize=2M` y `post_max_size=8M`,
  y un PDF de 20 MB devuelve **413 Content Too Large**.
- Verificación rápida:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/v1/jobs' -UseBasicParsing
Invoke-WebRequest -Uri 'http://192.168.80.25:8000/api/v1/jobs' -UseBasicParsing
```

Ambas deben devolver HTTP 200.

### Paso 3 — Gateway Next.js

Ubicación: `C:\Users\DARWIN GARCIA\Documents\UNIVERSIDAD\Vsc\bolsa-empleo-MOVIL-main\UniEmpleo\src\Api`

```powershell
npm install
npm run dev
```

El script `dev` es `next dev -H 0.0.0.0 -p 3000`, así que queda disponible en
`http://127.0.0.1:3000` y `http://192.168.80.25:3000`.

Verificación:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:3000/api/v1/jobs' -UseBasicParsing
```

Debe devolver HTTP 200 reenviando a Laravel.

### Paso 4 — App Expo

Ubicación: `C:\Users\DARWIN GARCIA\Documents\UNIVERSIDAD\Vsc\bolsa-empleo-MOVIL-main\UniEmpleo`

```powershell
npm install
npx expo start --web --port 8082
```

Para dispositivo físico, `npx expo start` y abrir con Expo Go usando la IP LAN.
Si se usa el emulador web en otro puerto, agregarlo a `CORS_ALLOWED_ORIGINS`.

### Paso 5 — Verificación de extremo a extremo

Login de prueba (en PowerShell usar `Invoke-RestMethod`; `curl.exe -d` con JSON
corrompe los acentos):

```powershell
$body = @{ email='Carlos.lopez@unipaz.edu.co'; password='EstudianteUNIPAZ2024*' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/v1/auth/login' `
  -Method Post -ContentType 'application/json' -Body $body
$token = $login.data.token

$h = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/v1/students/profile' -Headers $h
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/v1/notifications' -Headers $h
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/v1/notifications/unread-count' -Headers $h
```

Para enviar archivos multipart (CV), `curl.exe` sí funciona correctamente:

```powershell
curl.exe -s -S -X POST -H "Authorization: Bearer $token" `
  -F "cv=@C:\ruta\hoja-de-vida.pdf;type=application/pdf" `
  'http://127.0.0.1:3000/api/v1/students/upload-cv'
```

Un PDF de exactamente 20 971 520 bytes debe devolver `"success": true` y un
`cv_url` con la IP LAN. Ese mismo `cv_url` debe descargarse con HTTP 200.

### Credenciales de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@unipaz.edu.co` | `AdminUNIPAZ2024*` |
| Empresa | `info@tecnosoluciones.edu.co` | `EmpresaUNIPAZ2024*` |
| Empresa 2 | `contacto@distribuidoraregional.edu.co` | `EmpresaUNIPAZ2024*` |
| Estudiante | `Carlos.lopez@unipaz.edu.co` | `EstudianteUNIPAZ2024*` |

---

## 4. Errores comunes y solución

| Síntoma | Causa | Solución |
| --- | --- | --- |
| `413 Content Too Large`, "POST Content-Length ... exceeds the limit of 8388608 bytes" | Servidor PHP iniciado sin las banderas `-d` | Reiniciar PHP con `upload_max_filesize=20M`, `post_max_size=24M`, `memory_limit=256M` |
| `cv_url` con `http://localhost:8000` y el PDF no abre en el móvil | `APP_URL=localhost` en Laravel | Poner `APP_URL=http://<IP-LAN>:8000` y ejecutar `config:clear` + `config:cache` |
| Error de CORS en el navegador | Falta el puerto de Expo en `CORS_ALLOWED_ORIGINS` | Agregar `http://<IP-LAN>:8082` (o el puerto usado) y reiniciar el gateway |
| "No fue posible conectar con la API..." | `EXPO_PUBLIC_API_URL` incorrecto o servidor caído | Revisar la URL y que el gateway esté en `3000`; reiniciar Expo tras cambiar `.env.local` |
| `/api/v1/*` devuelve 404 en Railway | El despliegue remoto solo sirve la web Laravel, no las rutas API | Requiere redesplegar con credenciales; en local usar los tres servidores anteriores |
| Gateway falla por Prisma/MySQL | `AUDIT_LOG_ENABLED=true` sin MySQL activo | Poner `AUDIT_LOG_ENABLED="false"` en `src/Api/.env.local` |
| JSON mal formado al probar con `curl.exe -d` | PowerShell corrompe los caracteres | Usar `Invoke-RestMethod` con `ConvertTo-Json`, o `--data-binary "@archivo.json"` |
| Árbol de accesibilidad vacío / "Bundling..." en el navegador | Expo está recompilando tras un cambio | Esperar a que termine el bundle; verificar con `document.body.innerText` |
| App nativa crashea al enfocar | Listeners `window.addEventListener` en móvil | Los guards deben ser por `Platform.OS === 'web'` y verificar que la función exista (ya corregido) |
| Los horarios se pierden al recargar | Backend no guardaba `availability` | Aplicar migración `2026_11_19_000001...` y reiniciar Laravel; ya implementado guardado automático |

---

## 5. Checklist de "direcciones que faltan por configurar"

Usar esta lista al clonar el proyecto en otra máquina:

- [ ] Obtener la IP LAN de la nueva máquina (`Get-NetIPAddress`).
- [ ] `UniEmpleo/.env.local` → `EXPO_PUBLIC_API_URL=http://<IP>:3000/api/v1`.
- [ ] `UniEmpleo/src/Api/.env.local` → `LARAVEL_API_URL=http://127.0.0.1:8000`.
- [ ] `UniEmpleo/src/Api/.env.local` → `CORS_ALLOWED_ORIGINS` con `http://<IP>:8082`.
- [ ] `UniEmpleo/src/Api/.env.local` → `AUDIT_LOG_ENABLED="false"` si no hay MySQL.
- [ ] `bolsa-empleo-unipaz-main/.env` → `APP_URL=http://<IP>:8000`.
- [ ] `bolsa-empleo-unipaz-main/.env` → `DB_CONNECTION=sqlite` y archivo `database.sqlite` creado.
- [ ] `php artisan key:generate` si `.env` es nuevo.
- [ ] `php artisan migrate --force` (incluye la migración de `availability`).
- [ ] `php artisan db:seed --force`.
- [ ] `php artisan storage:link`.
- [ ] `php artisan config:clear && php artisan config:cache`.
- [ ] Laravel iniciado con las banderas `-d` desde `public`.
- [ ] Gateway iniciado con `npm run dev` en `src/Api`.
- [ ] Expo iniciado con `npx expo start --web --port 8082`.
- [ ] Probar login, perfil con `cv_size_bytes`, notificaciones y subida de PDF de 20 MB.

---

## 6. Notas sobre el despliegue

- El dominio `https://bolsa-empleo-unipaz-production.up.railway.app` sirve la
  interfaz web Laravel, pero `/api/v1/*` responde 404. No hay credenciales para
  redesplegar, por lo que **la verificación completa solo está garantizada en local**.
- Para producción se necesita: configurar `APP_URL` con el dominio real, habilitar
  HTTPS, definir `CORS_ALLOWED_ORIGINS` con el dominio de la app y ajustar
  `upload_max_filesize`/`post_max_size` en el servidor PHP de Railway.
- Los PDFs se guardan en `bolsa-empleo-unipaz-main/storage/app/public/cvs` y se
  sirven por `/storage/cvs/...` gracias al enlace simbólico `public/storage`.

---

## 7. Relación con el otro documento

- `Docs/01_HISTORIAL_DE_CAMBIOS.md`: describe **qué se hizo** (rediseño, roles,
  notificaciones, PDF de 20 MB, horarios, etc.).
- `Docs/02_CONFIGURACION_Y_ARRANQUE_LOCAL.md` (este archivo): describe **cómo
  configurar y ejecutar** el proyecto.
