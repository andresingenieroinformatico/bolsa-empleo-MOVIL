import { NextRequest, NextResponse } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { invalidIdResponse } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invalidId = invalidIdResponse(id);
  if (invalidId) return invalidId;
  let body: Record<string, unknown> = {};
  if (request.headers.get("content-type")?.includes("json")) {
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json(
          { success: false, message: "El cuerpo debe ser un objeto JSON válido." },
          { status: 400 }
        );
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, message: "El cuerpo debe contener JSON válido." },
        { status: 400 }
      );
    }
  }

  if (body.reason !== undefined && (typeof body.reason !== "string" || body.reason.length > 1000)) {
    return NextResponse.json(
      { success: false, message: "El motivo debe ser texto de hasta 1.000 caracteres." },
      { status: 422 }
    );
  }
  if (body.aprobada !== undefined && typeof body.aprobada !== "boolean") {
    return NextResponse.json(
      { success: false, message: "El campo aprobada debe ser verdadero o falso." },
      { status: 422 }
    );
  }
  if (body.action !== undefined && body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json(
      { success: false, message: "La acción debe ser approve o reject." },
      { status: 422 }
    );
  }

  if (body.aprobada === false || body.action === "reject") {
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (reason.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Indica con al menos 10 caracteres la información que la empresa debe corregir.",
        },
        { status: 422 }
      );
    }

    return forwardToLaravel(request, {
      path: `/api/v1/admin/companies/${id}/reject`,
      method: "POST",
      body: { reason },
    });
  }

  return forwardToLaravel(request, {
    path: `/api/v1/admin/companies/${id}/approve`,
    method: "POST",
    // The body was already read above, so forward an explicit payload instead of
    // letting the bridge read the consumed request stream again.
    body: { action: "approve" },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invalidId = invalidIdResponse(id);
  if (invalidId) return invalidId;
  return PUT(request, { params });
}
