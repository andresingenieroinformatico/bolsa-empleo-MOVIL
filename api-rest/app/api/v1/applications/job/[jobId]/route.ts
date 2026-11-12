import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  return forwardToLaravel(request, {
    path: "/api/v1/company/applications",
    queryParams: {
      job_id: params.jobId,
    },
  });
}
