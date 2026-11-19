import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { invalidNotificationIdResponse } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (id === "all") {
    return forwardToLaravel(request, {
      path: "/api/v1/notifications/mark-all-read",
      method: "POST",
    });
  }

  const invalidId = invalidNotificationIdResponse(id);
  if (invalidId) return invalidId;

  return forwardToLaravel(request, {
    path: `/api/v1/notifications/${id}/read`,
    method: "PATCH",
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}
