import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return forwardToLaravel(request, {
    path: `/api/v1/jobs/${params.id}/apply`,
    method: "POST",
  });
}
