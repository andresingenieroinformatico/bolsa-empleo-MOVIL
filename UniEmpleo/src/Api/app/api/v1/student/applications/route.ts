import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { hideCompanyNotes } from "@/lib/privacy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return forwardToLaravel(request, {
    path: "/api/v1/student/applications",
    transformResponse: hideCompanyNotes,
  });
}
