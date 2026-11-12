import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    if (body.aprobada === false || body.action === "reject") {
      return forwardToLaravel(request, {
        path: `/api/v1/admin/companies/${params.id}/reject`,
        method: "POST",
      });
    }

    return forwardToLaravel(request, {
      path: `/api/v1/admin/companies/${params.id}/approve`,
      method: "POST",
    });
  } catch {
    return forwardToLaravel(request, {
      path: `/api/v1/admin/companies/${params.id}/approve`,
      method: "POST",
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}
