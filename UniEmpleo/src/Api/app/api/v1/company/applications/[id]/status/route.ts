import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return forwardToLaravel(request, {
    path: `/api/v1/company/applications/${params.id}/status`,
    method: "PUT",
  });
}
