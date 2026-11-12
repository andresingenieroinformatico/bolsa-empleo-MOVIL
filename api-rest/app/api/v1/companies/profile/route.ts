import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return forwardToLaravel(request, {
    path: "/api/v1/company/profile",
  });
}

export async function PUT(request: NextRequest) {
  return forwardToLaravel(request, {
    path: "/api/v1/company/profile",
    method: "PUT",
  });
}
