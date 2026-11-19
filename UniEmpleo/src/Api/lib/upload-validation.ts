import { NextRequest, NextResponse } from "next/server";

const MAX_PDF_MB = 20;
const MAX_PDF_SIZE = MAX_PDF_MB * 1024 * 1024;
// Multipart boundaries and headers add a few KB; keep a small margin so a
// 20 MB PDF is never rejected because of the envelope.
const MAX_MULTIPART_SIZE = MAX_PDF_SIZE + 1024 * 1024;

export function validateMultipartSize(request: NextRequest) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_MULTIPART_SIZE) {
    return NextResponse.json(
      { success: false, message: `El archivo supera el límite de ${MAX_PDF_MB} MB.` },
      { status: 413 }
    );
  }
  return null;
}

export async function validatePdfFile(file: FormDataEntryValue | null) {
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "Debes adjuntar un archivo PDF en el campo cv." },
      { status: 422 }
    );
  }
  if (file.size < 5 || file.size > MAX_PDF_SIZE) {
    return NextResponse.json(
      { success: false, message: `El PDF debe pesar entre 5 bytes y ${MAX_PDF_MB} MB.` },
      { status: file.size > MAX_PDF_SIZE ? 413 : 422 }
    );
  }
  const signature = await file.slice(0, 5).text();
  if (signature !== "%PDF-") {
    return NextResponse.json(
      { success: false, message: "El archivo adjunto no tiene un formato PDF válido." },
      { status: 422 }
    );
  }
  return null;
}
