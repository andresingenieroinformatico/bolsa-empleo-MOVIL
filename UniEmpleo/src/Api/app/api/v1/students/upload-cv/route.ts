import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const incomingFormData = await request.formData();
    const file = (incomingFormData.get("cv") || incomingFormData.get("file")) as File | null;

    if (!file) {
      return forwardToLaravel(request, {
        path: "/api/v1/student/profile/cv",
      });
    }

    const laravelFormData = new FormData();
    laravelFormData.append("cv", file, file.name || "hoja_de_vida.pdf");

    return forwardToLaravel(request, {
      path: "/api/v1/student/profile/cv",
      method: "POST",
      body: laravelFormData,
    });
  } catch (err: any) {
    return forwardToLaravel(request, {
      path: "/api/v1/student/profile/cv",
    });
  }
}
