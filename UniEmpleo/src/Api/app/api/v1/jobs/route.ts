import { NextRequest, NextResponse } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { mapJobPayload } from "@/lib/job-input";
import { validationError } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  const modalidad = url.searchParams.get("modalidad");
  const ciudad = url.searchParams.get("ciudad") || url.searchParams.get("ubicacion");

  const queryParams: Record<string, string> = {};
  if (search) queryParams.search = search;
  if (ciudad) queryParams.location = ciudad;
  if (modalidad) {
    const modLower = modalidad.toLowerCase();
    if (modLower.includes("remot")) queryParams.modality = "remote";
    else if (modLower.includes("hibrid") || modLower.includes("híbrid")) queryParams.modality = "hybrid";
    else if (modLower.includes("presenc")) queryParams.modality = "onsite";
    else queryParams.modality = modalidad;
  }

  return forwardToLaravel(request, {
    path: "/api/v1/jobs",
    queryParams,
  });
}

export async function POST(request: NextRequest) {
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
  const mapped = mapJobPayload(parsed as Record<string, unknown>);
  if (!mapped.success) {
    return validationError("Los datos de la vacante no son válidos.", mapped.errors);
  }

  return forwardToLaravel(request, {
    path: "/api/v1/company/jobs",
    method: "POST",
    body: mapped.data,
  });
}
