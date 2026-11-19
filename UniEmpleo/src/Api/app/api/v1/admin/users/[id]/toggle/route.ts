import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { invalidIdResponse } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invalidId = invalidIdResponse(id);
  if (invalidId) return invalidId;

  return forwardToLaravel(request, {
    path: `/api/v1/admin/users/${id}/toggle`,
    method: "PATCH",
  });
}
