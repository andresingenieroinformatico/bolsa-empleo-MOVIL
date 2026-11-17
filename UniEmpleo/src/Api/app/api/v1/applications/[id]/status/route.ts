import { NextRequest } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const mappedBody: any = {
      status: body.status || body.estado,
      company_notes: body.company_notes,
      interview_note: body.interview_note,
    };

    return forwardToLaravel(request, {
      path: `/api/v1/company/applications/${params.id}/status`,
      method: "PUT",
      body: mappedBody,
    });
  } catch {
    return forwardToLaravel(request, {
      path: `/api/v1/company/applications/${params.id}/status`,
      method: "PUT",
    });
  }
}
