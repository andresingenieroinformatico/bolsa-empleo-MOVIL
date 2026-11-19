import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";

export interface BridgeOptions {
  path?: string;
  method?: string;
  body?: unknown;
  transformResponse?: (data: unknown) => unknown;
  queryParams?: Record<string, string | number | boolean | undefined | null>;
  /** Query params that must not be forwarded upstream (e.g. download tokens). */
  dropQuery?: string[];
  /** Explicit bearer token, used by download routes that receive the token as a query param. */
  authorization?: string;
}

export function resolveLaravelApiBaseUrl(configuredUrl: string | undefined): URL {
  const value = configuredUrl?.trim();
  if (!value) {
    throw new Error("Falta configurar LARAVEL_API_URL con la URL base del backend Laravel.");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("LARAVEL_API_URL debe ser una URL absoluta válida.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("LARAVEL_API_URL debe usar HTTP o HTTPS.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("LARAVEL_API_URL no debe contener credenciales, consulta ni fragmento.");
  }

  url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  return url;
}

export function addMobileDeviceName(payload: Record<string, unknown>): Record<string, unknown> {
  return { ...payload, device_name: "UniEmpleo" };
}

export function normalizeLaravelResponse(status: number, data: unknown): unknown {
  if (status < 200 || status >= 300) return data;
  if (isRecord(data) && typeof data.success === "boolean") return data;

  const message = isRecord(data) && typeof data.message === "string"
    ? { message: data.message }
    : {};

  if (
    isRecord(data) &&
    Array.isArray(data.data) &&
    ("current_page" in data || "per_page" in data || "total" in data)
  ) {
    return { success: true, ...message, data };
  }

  if (isRecord(data) && "data" in data) {
    return { success: true, ...message, data: data.data };
  }

  if (isRecord(data) && "message" in data) {
    return { success: true, ...message, data: null };
  }

  return { success: true, data };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export async function forwardMobileAuth(request: NextRequest, path: string): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "El cuerpo debe contener JSON válido." },
      { status: 400 }
    );
  }

  if (!isRecord(payload)) {
    return NextResponse.json(
      { success: false, message: "El cuerpo debe ser un objeto JSON válido." },
      { status: 400 }
    );
  }

  return forwardToLaravel(request, {
    path,
    method: "POST",
    body: addMobileDeviceName(payload),
  });
}

// La auditoría es opcional: si la base de datos de Prisma no está disponible,
// se desactiva con AUDIT_LOG_ENABLED=false para no bloquear ni llenar el log.
const auditEnabled = process.env.AUDIT_LOG_ENABLED !== "false";

function audit(endpoint: string, method: string, statusCode: number, duration: number) {
  if (!auditEnabled) return;
  prisma.apiAuditLog.create({
    data: {
      endpoint,
      method,
      status_code: statusCode,
      duration_ms: duration,
      // Do not persist personal data or trust client supplied proxy headers.
      user_email: null,
      ip_address: null,
    },
  }).catch((error: unknown) => {
    console.error("[Bridge audit] No fue posible registrar la solicitud.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
  });
}

export async function forwardToLaravel(
  request: NextRequest,
  options: BridgeOptions = {}
): Promise<NextResponse> {
  const startedAt = Date.now();
  const requestUrl = new URL(request.url);
  const pathname = requestUrl.pathname;
  const apiIndex = pathname.indexOf("/api/");
  let targetPath = options.path ?? (apiIndex >= 0 ? pathname.substring(apiIndex) : `/api/v1${pathname}`);

  if (!targetPath.startsWith("/api/")) {
    targetPath = targetPath.startsWith("/") ? `/api/v1${targetPath}` : `/api/v1/${targetPath}`;
  }

  let laravelBaseUrl: URL;
  try {
    laravelBaseUrl = resolveLaravelApiBaseUrl(process.env.LARAVEL_API_URL);
  } catch (error: unknown) {
    console.error("[Bridge] La URL del backend Laravel no está configurada correctamente.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Configuración del backend inválida." },
      { status: 503 }
    );
  }

  const laravelUrl = new URL(targetPath, laravelBaseUrl);
  requestUrl.searchParams.forEach((value, key) => {
    if (options.dropQuery?.includes(key)) return;
    laravelUrl.searchParams.set(key, value);
  });
  for (const [key, value] of Object.entries(options.queryParams ?? {})) {
    if (value !== undefined && value !== null) laravelUrl.searchParams.set(key, String(value));
  }

  const method = (options.method ?? request.method).toUpperCase();
  const headers: Record<string, string> = { Accept: "application/json" };
  const incomingAuth = options.authorization ?? request.headers.get("authorization");
  if (incomingAuth) headers.Authorization = incomingAuth;

  let body: BodyInit | undefined;
  const contentType = request.headers.get("content-type") ?? "";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (options.body instanceof FormData) {
      body = options.body;
    } else if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    } else if (contentType.includes("multipart/form-data")) {
      try {
        body = await request.formData();
      } catch {
        return NextResponse.json(
          { success: false, message: "El formulario enviado no tiene un formato válido." },
          { status: 400 }
        );
      }
    } else if (contentType.includes("json")) {
      try {
        headers["Content-Type"] = contentType;
        body = JSON.stringify(await request.json());
      } catch {
        return NextResponse.json(
          { success: false, message: "El cuerpo debe contener JSON válido." },
          { status: 400 }
        );
      }
    }
  }

  try {
    const upstream = await fetch(laravelUrl, {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(15000),
      // Every proxied response is private to the bearer token, so Next must
      // never reuse a cached GET across users or across reads.
      cache: 'no-store',
    });
    const duration = Date.now() - startedAt;
    audit(targetPath, method, upstream.status, duration);

    if ([204, 205, 304].includes(upstream.status)) {
      return new NextResponse(null, { status: upstream.status });
    }

    const responseContentType = upstream.headers.get("content-type") ?? "";
    if (responseContentType.includes("application/pdf")) {
      return new NextResponse(await upstream.blob(), {
        status: upstream.status,
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "no-store",
          "Content-Disposition": upstream.headers.get("content-disposition") ?? "attachment",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    let responseData: unknown;
    if (responseContentType.includes("json")) {
      try {
        responseData = await upstream.json();
      } catch {
        return NextResponse.json(
          { success: false, message: "El servicio de empleos devolvió una respuesta inválida." },
          { status: 502 }
        );
      }
    } else {
      await upstream.body?.cancel();
      responseData = upstream.ok
        ? { success: true, message: "Operación realizada correctamente", data: null }
        : { success: false, message: "El servicio de empleos no pudo procesar la solicitud." };
    }

    responseData = normalizeLaravelResponse(upstream.status, responseData);
    if (options.transformResponse && responseData) {
      responseData = options.transformResponse(responseData);
    }
    return NextResponse.json(responseData, {
      status: upstream.status,
      // Responses depend on the caller's bearer token; never let a shared
      // cache replay one account's data to another.
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    audit(targetPath, method, 502, Date.now() - startedAt);
    console.error("[Bridge] Falló la comunicación con el backend de empleos.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { success: false, message: "No fue posible conectar con el servicio de empleos. Intenta de nuevo más tarde." },
      { status: 502 }
    );
  }
}
