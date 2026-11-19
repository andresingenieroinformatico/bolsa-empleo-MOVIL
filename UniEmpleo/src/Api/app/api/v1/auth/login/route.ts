import { NextRequest } from "next/server";
import { forwardMobileAuth } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return forwardMobileAuth(request, "/api/v1/auth/login");
}
