import { NextRequest, NextResponse } from "next/server";
import { forwardToLaravel } from "@/lib/laravel-bridge";
import { invalidIdResponse } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invalidId = invalidIdResponse(id);
  if (invalidId) return invalidId;

  try {
    const body = await request.json();

    const password =
      typeof body.password === "string" && body.password.length > 0
        ? body.password
        : null;
    const passwordConfirmation =
      typeof body.password_confirmation === "string"
        ? body.password_confirmation
        : typeof body.passwordConfirmation === "string"
          ? body.passwordConfirmation
          : null;

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, message: "La contraseña debe tener al menos 8 caracteres." },
          { status: 422 }
        );
      }
      if (password !== passwordConfirmation) {
        return NextResponse.json(
          { success: false, message: "La confirmación de la contraseña no coincide." },
          { status: 422 }
        );
      }
    }

    const mappedBody = {
      name: body.name,
      email: body.email,
      program: body.program,
      semester:
        body.semester !== undefined && body.semester !== null && body.semester !== ""
          ? String(body.semester)
          : null,
      phone: body.phone ?? null,
      student_code: body.student_code ?? body.studentCode ?? null,
      ...(password
        ? { password, password_confirmation: passwordConfirmation }
        : {}),
    };

    return forwardToLaravel(request, {
      path: `/api/v1/admin/users/${id}`,
      method: "PUT",
      body: mappedBody,
    });
  } catch {
    return forwardToLaravel(request, {
      path: `/api/v1/admin/users/${id}`,
      method: "PUT",
    });
  }
}
