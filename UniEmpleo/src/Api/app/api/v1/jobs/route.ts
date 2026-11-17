import { NextRequest, NextResponse } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { mapProgramsTargeted } from "@/lib/job-input";

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
  const body = parsed as Record<string, unknown>;

  const mod = String(body.modality || body.modalidad || "").toLowerCase();
  let modality = "onsite";
  if (mod.includes("remot")) modality = "remote";
  else if (mod.includes("hibrid") || mod.includes("híbrid")) modality = "hybrid";
  const defaultDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const positions = Number.parseInt(String(body.positions || 1), 10);

  const laravelBody = {
    title: body.title || body.titulo || "Vacante sin título",
    description: body.description || body.descripcion || "Descripción detallada de la oferta laboral.",
    requirements: body.requirements || body.requisitos || body.descripcion || "Requisitos mínimos del perfil requerido.",
    responsibilities: body.responsibilities || body.responsabilidades || body.descripcion || "Responsabilidades y funciones del cargo.",
    area: body.area || "Tecnología e informática",
    contract_type: body.contract_type || body.tipo_contrato || "Término fijo",
    modality,
    schedule: body.schedule || body.horario || null,
    location: body.location || body.ubicacion || "Barrancabermeja",
    salary_range: body.salary_range || (body.salario ? String(body.salario) : "$ 2.000.000 COP"),
    salary_negotiable: body.salary_negotiable !== undefined ? Boolean(body.salary_negotiable) : false,
    positions: Number.isNaN(positions) ? 1 : positions,
    deadline: body.deadline || defaultDeadline,
    requires_cv: body.requires_cv !== undefined ? Boolean(body.requires_cv) : true,
    programs_targeted: mapProgramsTargeted(body),
  };

  return forwardToLaravel(request, {
    path: "/api/v1/company/jobs",
    method: "POST",
    body: laravelBody,
  });
}
