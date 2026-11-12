import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return forwardToLaravel(request, {
    path: "/api/v1/auth/login",
  });
}
