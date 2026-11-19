import { NextRequest, NextResponse } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { mapJobPayload } from "@/lib/job-input";
import { invalidIdResponse, validationError } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invalidId = invalidIdResponse(id);
  if (invalidId) return invalidId;
  return forwardToLaravel(request, {
    path: `/api/v1/jobs/${id}`,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invalidId = invalidIdResponse(id);
  if (invalidId) return invalidId;
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
  const mapped = mapJobPayload(parsed as Record<string, unknown>, true);
  if (!mapped.success) {
    return validationError("Los datos de la vacante no son válidos.", mapped.errors);
  }

  return forwardToLaravel(request, {
    path: `/api/v1/company/jobs/${id}`,
    method: "PUT",
    body: mapped.data,
  });
}
