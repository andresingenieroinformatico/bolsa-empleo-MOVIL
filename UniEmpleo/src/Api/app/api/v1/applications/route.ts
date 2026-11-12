import { NextRequest, NextResponse } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const jobId = formData.get("job_offer_id") || formData.get("job_id");

      if (!jobId) {
        return NextResponse.json(
          { success: false, message: "El ID de la vacante es obligatorio (job_offer_id)", errors: {} },
          { status: 400 }
        );
      }

      return forwardToLaravel(request, {
        path: `/api/v1/jobs/${jobId}/apply`,
        method: "POST",
        body: formData,
      });
    }

    const body = await request.json();
    const jobId = body.job_offer_id || body.job_id || body.jobPostingId || body.id;

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "El ID de la vacante es obligatorio (job_offer_id)", errors: {} },
        { status: 400 }
      );
    }

    const laravelFormData = new FormData();
    if (body.cover_letter) {
      laravelFormData.append("cover_letter", body.cover_letter);
    }

    return forwardToLaravel(request, {
      path: `/api/v1/jobs/${jobId}/apply`,
      method: "POST",
      body: laravelFormData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "Error al procesar la solicitud de postulación", errors: { error: err.message } },
      { status: 400 }
    );
  }
}
