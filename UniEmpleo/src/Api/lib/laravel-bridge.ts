import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || "http://127.0.0.1:8000";

export interface BridgeOptions {
  path?: string;
  method?: string;
  body?: any;
  transformResponse?: (data: any) => any;
  queryParams?: Record<string, string | number | boolean | undefined | null>;
}

function audit(endpoint: string, method: string, statusCode: number, duration: number) {
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

  const laravelUrl = new URL(targetPath, LARAVEL_API_URL);
  requestUrl.searchParams.forEach((value, key) => laravelUrl.searchParams.set(key, value));
  for (const [key, value] of Object.entries(options.queryParams ?? {})) {
    if (value !== undefined && value !== null) laravelUrl.searchParams.set(key, String(value));
  }

  const method = (options.method ?? request.method).toUpperCase();
  const headers: Record<string, string> = { Accept: "application/json" };
  const incomingAuth = request.headers.get("authorization");
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

    if (options.transformResponse && responseData) {
      responseData = options.transformResponse(responseData);
    }
    return NextResponse.json(responseData, { status: upstream.status });
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
