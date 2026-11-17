import { NextRequest, NextResponse } from "next/server";
import prisma from "./prisma";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || "http://127.0.0.1:8000";

export interface BridgeOptions {
  path?: string; // Ruta destino en Laravel (por defecto '/api/v1' + path relativo)
  method?: string;
  body?: any;
  transformResponse?: (data: any) => any;
  queryParams?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * Cliente HTTP Centralizado que actúa como puente (Bridge) entre la app móvil (o web)
 * en Next.js y el backend oficial de Laravel 12 de Darwin García.
 */
export async function forwardToLaravel(
  request: NextRequest,
  options: BridgeOptions = {}
): Promise<NextResponse> {
  const startTime = Date.now();
  const incomingAuth = request.headers.get("authorization");
  const requestUrl = new URL(request.url);

  // 1. Determinar la ruta relativa en Laravel
  let targetPath = options.path;
  if (!targetPath) {
    // Si la petición a Next.js es /api/v1/auth/login, mapear a /api/v1/auth/login en Laravel
    const pathname = requestUrl.pathname;
    const apiIndex = pathname.indexOf("/api/");
    targetPath = apiIndex !== -1 ? pathname.substring(apiIndex) : `/api/v1${pathname}`;
  }

  // Asegurar prefijo /api/v1 si no viene incluido
  if (!targetPath.startsWith("/api/")) {
    targetPath = targetPath.startsWith("/") ? `/api/v1${targetPath}` : `/api/v1/${targetPath}`;
  }

  // 2. Construir la URL completa hacia Laravel
  const laravelUrl = new URL(targetPath, LARAVEL_API_URL);

  // Copiar query params de la petición original
  requestUrl.searchParams.forEach((value, key) => {
    laravelUrl.searchParams.set(key, value);
  });

  // Agregar query params adicionales si se especificaron
  if (options.queryParams) {
    Object.entries(options.queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        laravelUrl.searchParams.set(key, String(value));
      }
    });
  }

  // 3. Preparar Headers
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (incomingAuth) {
    headers["Authorization"] = incomingAuth;
  }

  // 4. Preparar Body
  const method = (options.method || request.method).toUpperCase();
  let fetchBody: any = undefined;
  const contentType = request.headers.get("content-type") || "";

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (options.body !== undefined) {
      if (options.body instanceof FormData) {
        fetchBody = options.body;
      } else {
        headers["Content-Type"] = "application/json";
        fetchBody = JSON.stringify(options.body);
      }
    } else if (contentType.includes("multipart/form-data")) {
      try {
        const formData = await request.formData();
        fetchBody = formData;
        // No fijar Content-Type manual para que fetch genere el boundary de multipart
      } catch (err) {
        console.warn("[Bridge] Error extrayendo multipart formData:", err);
      }
    } else {
      try {
        const rawJson = await request.json();
        headers["Content-Type"] = "application/json";
        fetchBody = JSON.stringify(rawJson);
      } catch {
        // No hay body JSON o viene vacío
      }
    }
  }

  let statusCode = 500;
  let responseData: any = null;

  try {
    const laravelResponse = await fetch(laravelUrl.toString(), {
      method,
      headers,
      body: fetchBody,
      signal: AbortSignal.timeout(15000),
    });

    statusCode = laravelResponse.status;

    if (statusCode === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // Verificar si la respuesta es JSON
    const responseContentType = laravelResponse.headers.get("content-type") || "";
    if (responseContentType.includes("application/json")) {
      responseData = await laravelResponse.json();
    } else if (responseContentType.includes("application/pdf")) {
      // Reenvío directo de archivos PDF (hojas de vida)
      const blob = await laravelResponse.blob();
      return new NextResponse(blob, {
        status: statusCode,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": laravelResponse.headers.get("content-disposition") || "inline",
        },
      });
    } else {
      const text = await laravelResponse.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = {
          success: laravelResponse.ok,
          message: text || "Respuesta sin contenido JSON desde Laravel",
          data: null,
        };
      }
    }

    // Permitir transformación personalizada si se definió
    if (options.transformResponse && responseData) {
      responseData = options.transformResponse(responseData);
    }

    // 5. Registro de Auditoría en Prisma ORM (Demuestra cumplimiento del stack tecnológico)
    const duration = Date.now() - startTime;
    prisma.apiAuditLog.create({
      data: {
        endpoint: targetPath,
        method,
        status_code: statusCode,
        duration_ms: duration,
        user_email: responseData?.data?.user?.email || null,
        ip_address: request.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    }).catch((logErr) => {
      // No bloquear la respuesta en caso de error de logging
      console.error("[Bridge Prisma Log Error]:", logErr.message);
    });

    return NextResponse.json(responseData, { status: statusCode });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[Bridge Error] Falló conexión con Laravel (${laravelUrl.toString()}):`, error.message);

    // Registrar fallo en auditoría de Prisma
    prisma.apiAuditLog.create({
      data: {
        endpoint: targetPath,
        method,
        status_code: 502,
        duration_ms: duration,
        ip_address: request.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    }).catch(() => {});

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible conectar con el servicio de empleos. Intenta de nuevo más tarde.",
      },
      { status: 502 }
    );
  }
}
