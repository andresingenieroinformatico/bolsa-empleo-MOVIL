import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { invalidIdResponse } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const invalidId = invalidIdResponse(params.jobId);
  if (invalidId) return invalidId;
  return forwardToLaravel(request, {
    path: "/api/v1/company/applications",
    queryParams: {
      job: params.jobId,
    },
  });
}
