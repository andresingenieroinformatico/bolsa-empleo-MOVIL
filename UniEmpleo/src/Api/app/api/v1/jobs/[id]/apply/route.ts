import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { invalidIdResponse } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const invalidId = invalidIdResponse(params.id);
  if (invalidId) return invalidId;
  return forwardToLaravel(request, {
    path: `/api/v1/jobs/${params.id}/apply`,
    method: "POST",
  });
}
