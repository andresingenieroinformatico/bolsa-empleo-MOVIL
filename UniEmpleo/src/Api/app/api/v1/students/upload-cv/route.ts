import { NextRequest, NextResponse } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { validateMultipartSize, validatePdfFile } from "@/lib/upload-validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const sizeError = validateMultipartSize(request);
  if (sizeError) return sizeError;
  try {
    const incomingFormData = await request.formData();
    const file = (incomingFormData.get("cv") || incomingFormData.get("file")) as File | null;

    const fileError = await validatePdfFile(file);
    if (fileError) return fileError;

    const laravelFormData = new FormData();
    laravelFormData.append("cv", file as File, (file as File).name || "hoja_de_vida.pdf");

    return forwardToLaravel(request, {
      path: "/api/v1/student/profile/cv",
      method: "POST",
      body: laravelFormData,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "No fue posible procesar el archivo enviado." },
      { status: 400 }
    );
  }
}
