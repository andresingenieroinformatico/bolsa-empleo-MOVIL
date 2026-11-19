import { NextRequest, NextResponse } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return forwardToLaravel(request, {
    path: "/api/v1/student/profile",
  });
}

export async function PUT(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json(
        { success: false, message: "El cuerpo del perfil debe ser un objeto JSON válido." },
        { status: 400 },
      );
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, message: "El cuerpo del perfil debe contener JSON válido." },
      { status: 400 },
    );
  }

  const mappedBody: Record<string, unknown> = {
    name: body.name,
    program: body.program || body.carrera || "Ingeniería de Sistemas",
    semester: body.semester !== undefined
      ? String(body.semester)
      : body.semestre !== undefined ? String(body.semestre) : undefined,
    phone: body.phone || body.telefono,
    about: body.about || body.descripcion,
    student_code: body.student_code || body.documento,
    availability: body.availability,
    linkedin: body.linkedin,
  };

  return forwardToLaravel(request, {
    path: "/api/v1/student/profile",
    method: "PUT",
    body: mappedBody,
  });
}
