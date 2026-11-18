import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { invalidIdResponse } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const invalidId = invalidIdResponse(params.id);
  if (invalidId) return invalidId;
  return forwardToLaravel(request, {
    path: `/api/v1/company/applications/${params.id}/status`,
    method: "PUT",
  });
}
