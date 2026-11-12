import { NextRequest, NextResponse } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { mapProgramsTargeted } from "@/lib/job-input";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return forwardToLaravel(request, {
    path: `/api/v1/jobs/${params.id}`,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "El cuerpo de la vacante debe ser un objeto JSON válido." },
      { status: 400 },
    );
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return NextResponse.json(
      { success: false, message: "El cuerpo de la vacante debe ser un objeto JSON válido." },
      { status: 400 },
    );
  }
  const body = parsed as Record<string, unknown>;

  let status = body.status;
  if (body.estado === "activa") status = "active";
  else if (body.estado === "pausada") status = "paused";
  else if (body.estado === "cerrada") status = "closed";
  const mappedBody = {
    ...body,
    status,
    title: body.title || body.titulo,
    description: body.description || body.descripcion,
    location: body.location || body.ubicacion,
    salary_range: body.salary_range || (body.salario ? String(body.salario) : undefined),
    programs_targeted: mapProgramsTargeted(body),
  };

  return forwardToLaravel(request, {
    path: `/api/v1/company/jobs/${params.id}`,
    method: "PUT",
    body: mappedBody,
  });
}
