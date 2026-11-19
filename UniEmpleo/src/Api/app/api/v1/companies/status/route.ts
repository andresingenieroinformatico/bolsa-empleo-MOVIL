import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export async function GET(request: NextRequest) {
  return forwardToLaravel(request, {
    path: "/api/v1/company/profile",
    transformResponse: (response: unknown) => {
      if (!isRecord(response) || !isRecord(response.data)) return response;

      const company = response.data;
      const isApproved =
        company.status === "approved" ||
        company.is_approved === true ||
        company.aprobada === true;
      const companyName = typeof company.company_name === "string"
        ? company.company_name
        : company.nombre_empresa;

      return {
        success: true,
        message: "Estado de la empresa obtenido",
        data: {
          empresa_id: company.id,
          nombre_empresa: companyName,
          aprobada: isApproved,
          status: typeof company.status === "string"
            ? company.status
            : isApproved ? "approved" : "pending",
          mensaje: isApproved
            ? "La empresa está aprobada para publicar ofertas laborales."
            : "La empresa está en espera de validación y aprobación por parte del administrador.",
        },
      };
    },
  });
}
