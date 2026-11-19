import { NextResponse } from "next/server";
import { resolveLaravelApiBaseUrl } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function GET() {
  let laravelOnline = false;
  let healthMessage = "El gateway está disponible, pero no pudo alcanzar una ruta válida del backend Laravel.";
  try {
    const laravelBaseUrl = resolveLaravelApiBaseUrl(process.env.LARAVEL_API_URL);
    const laravelUrl = new URL("/api/v1/jobs", laravelBaseUrl);
    const res = await fetch(laravelUrl, { signal: AbortSignal.timeout(3000) });
    laravelOnline = res.ok;
  } catch (error: unknown) {
    console.error("[Health] No fue posible verificar el backend Laravel.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    if (error instanceof Error && error.message.startsWith("LARAVEL_API_URL")) {
      healthMessage = error.message;
    }
  }

  return NextResponse.json({
    success: laravelOnline,
    message: laravelOnline
      ? "Gateway y backend de empleos disponibles."
      : healthMessage,
    data: {
      version: "1.0.0",
      status: laravelOnline ? "online" : "degraded",
      server_time: new Date().toISOString(),
      architecture: {
        gateway: "Next.js 14 (App Router / Node.js) en puerto 3000",
        backend_core: "Laravel 12 / PHP en puerto 8000",
        orm: "Prisma ORM (Auditoría y Cache) + Eloquent (Core)",
        database: "MySQL bolsa_empleo_unipaz & bolsa_empleo",
        laravel_connected: laravelOnline,
      },
      modules: [
        "/api/v1/auth",
        "/api/v1/students",
        "/api/v1/companies",
        "/api/v1/jobs",
        "/api/v1/applications",
        "/api/v1/notifications",
        "/api/v1/admin",
      ],
    },
  }, { status: laravelOnline ? 200 : 503 });
}
