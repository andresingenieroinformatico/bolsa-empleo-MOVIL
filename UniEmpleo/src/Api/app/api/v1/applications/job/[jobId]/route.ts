import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { invalidIdResponse } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const invalidId = invalidIdResponse(jobId);
  if (invalidId) return invalidId;
  return forwardToLaravel(request, {
    path: "/api/v1/company/applications",
    queryParams: {
      job: jobId,
    },
  });
}
