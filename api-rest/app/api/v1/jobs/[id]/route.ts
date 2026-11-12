import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

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
  try {
    const body = await request.json();

    let status = body.status;
    if (body.estado) {
      if (body.estado === "activa") status = "active";
      else if (body.estado === "pausada") status = "paused";
      else if (body.estado === "cerrada") status = "closed";
    }

    const mappedBody: any = {
      ...body,
      status: status || body.status,
      title: body.title || body.titulo,
      description: body.description || body.descripcion,
      location: body.location || body.ubicacion,
      salary_range: body.salary_range || (body.salario ? String(body.salario) : undefined),
    };

    return forwardToLaravel(request, {
      path: `/api/v1/company/jobs/${params.id}`,
      method: "PUT",
      body: mappedBody,
    });
  } catch {
    return forwardToLaravel(request, {
      path: `/api/v1/company/jobs/${params.id}`,
      method: "PUT",
    });
  }
}
