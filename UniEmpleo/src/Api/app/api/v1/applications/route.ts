import { NextRequest, NextResponse } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { invalidIdResponse } from "@/lib/validation";
import { validateMultipartSize, validatePdfFile } from "@/lib/upload-validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const sizeError = validateMultipartSize(request);
      if (sizeError) return sizeError;
      const formData = await request.formData();
      const jobId = formData.get("job_offer_id") || formData.get("job_id");

      if (!jobId) {
        return NextResponse.json(
          { success: false, message: "El ID de la vacante es obligatorio (job_offer_id)", errors: {} },
          { status: 400 }
        );
      }
      const invalidId = invalidIdResponse(String(jobId));
      if (invalidId) return invalidId;
      const file = formData.get("cv");
      if (file !== null) {
        const fileError = await validatePdfFile(file);
        if (fileError) return fileError;
      }

      return forwardToLaravel(request, {
        path: `/api/v1/jobs/${jobId}/apply`,
        method: "POST",
        body: formData,
      });
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "El cuerpo de la postulación debe ser un objeto JSON válido." },
        { status: 400 }
      );
    }
    const payload = body as Record<string, unknown>;
    const jobId = payload.job_offer_id || payload.job_id || payload.jobPostingId || payload.id;

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "El ID de la vacante es obligatorio (job_offer_id)", errors: {} },
        { status: 400 }
      );
    }
    const invalidId = invalidIdResponse(String(jobId));
    if (invalidId) return invalidId;

    const coverLetter = payload.cover_letter;
    if (coverLetter !== undefined && (typeof coverLetter !== "string" || coverLetter.length > 2000)) {
      return NextResponse.json(
        { success: false, message: "La carta de presentación debe ser texto de hasta 2.000 caracteres." },
        { status: 422 }
      );
    }

    const laravelFormData = new FormData();
    if (typeof coverLetter === "string" && coverLetter.trim()) {
      laravelFormData.append("cover_letter", coverLetter.trim());
    }

    return forwardToLaravel(request, {
      path: `/api/v1/jobs/${jobId}/apply`,
      method: "POST",
      body: laravelFormData,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "No fue posible procesar la postulación." },
      { status: 400 }
    );
  }
}
