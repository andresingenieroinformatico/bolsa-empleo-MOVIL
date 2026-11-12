import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return forwardToLaravel(request, {
    path: "/api/v1/company/profile",
    transformResponse: (response: any) => {
      if (response && response.data) {
        const company = response.data;
        const isApproved = company.status === "approved" || company.is_approved === true;
        return {
          success: true,
          message: "Estado de la empresa obtenido",
          data: {
            empresa_id: company.id,
            nombre_empresa: company.company_name || company.nombre_empresa,
            aprobada: isApproved,
            status: company.status || (isApproved ? "approved" : "pending"),
            mensaje: isApproved
              ? "La empresa está aprobada para publicar ofertas laborales."
              : "La empresa está en espera de validación y aprobación por parte del administrador.",
          },
        };
      }
      return response;
    },
  });
}
