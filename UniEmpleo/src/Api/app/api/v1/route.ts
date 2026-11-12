import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const laravelUrl = process.env.LARAVEL_API_URL || "http://127.0.0.1:8000";

  let laravelOnline = false;
  try {
    const res = await fetch(`${laravelUrl}/api/v1/jobs`, { signal: AbortSignal.timeout(3000) });
    laravelOnline = res.ok;
  } catch {
    laravelOnline = false;
  }

  return NextResponse.json({
    success: true,
    message: "Bolsa de Empleo UNIPAZ - API REST Bridge (Next.js Node.js -> Laravel 12)",
    data: {
      version: "1.0.0",
      status: "online",
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
  });
}
