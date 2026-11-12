import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return forwardToLaravel(request, {
    path: "/api/v1/student/profile",
  });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const mappedBody: any = {
      name: body.name,
      program: body.program || body.carrera || "Ingeniería de Sistemas",
      semester: body.semester !== undefined ? String(body.semester) : (body.semestre !== undefined ? String(body.semestre) : undefined),
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
  } catch {
    return forwardToLaravel(request, {
      path: "/api/v1/student/profile",
      method: "PUT",
    });
  }
}
