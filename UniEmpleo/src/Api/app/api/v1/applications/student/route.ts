import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return forwardToLaravel(request, {
    path: "/api/v1/student/applications",
    transformResponse: (response: any) => {
      // Garantizar que nunca se exponga company_notes a un estudiante
      if (response && response.data) {
        const apps = Array.isArray(response.data) ? response.data : (response.data.data || []);
        apps.forEach((app: any) => {
          delete app.company_notes;
        });
      }
      return response;
    },
  });
}
