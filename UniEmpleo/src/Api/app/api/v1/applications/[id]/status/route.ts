import { NextRequest, NextResponse } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { invalidIdResponse, validationError } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invalidId = invalidIdResponse(id);
  if (invalidId) return invalidId;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "El cuerpo debe contener JSON válido." },
      { status: 400 }
    );
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, message: "El cuerpo debe ser un objeto JSON válido." },
      { status: 400 }
    );
  }

  const input = body as Record<string, unknown>;
  const status = input.status ?? input.estado;
  const errors: Record<string, string[]> = {};
  if (!['pending', 'reviewed', 'interview', 'accepted', 'rejected'].includes(String(status))) {
    errors.status = ["Estado permitido: pending, reviewed, interview, accepted o rejected."];
  }
  for (const field of ["company_notes", "interview_note"] as const) {
    if (input[field] !== undefined && (typeof input[field] !== "string" || input[field].length > 5000)) {
      errors[field] = ["Debe ser texto de hasta 5.000 caracteres."];
    }
  }
  if (Object.keys(errors).length) {
    return validationError("Los datos de la postulación no son válidos.", errors);
  }

  return forwardToLaravel(request, {
    path: `/api/v1/company/applications/${id}/status`,
    method: "PUT",
    body: {
      status,
      ...(input.company_notes !== undefined ? { company_notes: input.company_notes } : {}),
      ...(input.interview_note !== undefined ? { interview_note: input.interview_note } : {}),
    },
  });
}
