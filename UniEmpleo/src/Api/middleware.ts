import { NextRequest, NextResponse } from "next/server";

const DEVELOPMENT_ORIGINS = [
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:19006",
  "http://127.0.0.1:19006",
];

function allowedOrigins(): Set<string> {
  const configured = process.env.CORS_ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured?.length) {
    return new Set(configured.filter((origin) => {
      if (origin === "*") return false;
      try {
        const parsed = new URL(origin);
        return (parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.origin === origin;
      } catch {
        return false;
      }
    }));
  }
  return process.env.NODE_ENV === "production"
    ? new Set()
    : new Set(DEVELOPMENT_ORIGINS);
}

function applySecurityHeaders(response: NextResponse, origin: string | null) {
  const origins = allowedOrigins();
  if (origin && origins.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Accept, Content-Type, Authorization, X-Requested-With");
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  return response;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") {
    const permitted = !origin || allowedOrigins().has(origin);
    return applySecurityHeaders(
      new NextResponse(null, { status: permitted ? 204 : 403 }),
      permitted ? origin : null,
    );
  }

  return applySecurityHeaders(NextResponse.next(), origin);
}

export const config = {
  matcher: "/api/:path*",
};
