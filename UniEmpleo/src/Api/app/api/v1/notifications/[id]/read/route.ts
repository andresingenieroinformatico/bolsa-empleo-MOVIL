import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (params.id === "all") {
    return forwardToLaravel(request, {
      path: "/api/v1/notifications/mark-all-read",
      method: "POST",
    });
  }

  return forwardToLaravel(request, {
    path: `/api/v1/notifications/${params.id}/read`,
    method: "PATCH",
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}
