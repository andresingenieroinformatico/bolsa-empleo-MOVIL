import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { validateMultipartSize } from "@/lib/upload-validation";
import { invalidIdResponse } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invalidId = invalidIdResponse(id);
  if (invalidId) return invalidId;
  // Reject oversized attachments before buffering the whole multipart body.
  const sizeError = validateMultipartSize(request);
  if (sizeError) return sizeError;
  return forwardToLaravel(request, {
    path: `/api/v1/jobs/${id}/apply`,
    method: "POST",
  });
}
