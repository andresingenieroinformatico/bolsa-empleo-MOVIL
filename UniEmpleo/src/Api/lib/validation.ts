import { NextResponse } from "next/server";

export function invalidIdResponse(id: string) {
  if (!/^\d{1,10}$/.test(id) || Number(id) < 1) {
    return NextResponse.json(
      { success: false, message: "El identificador debe ser un entero positivo." },
      { status: 400 }
    );
  }
  return null;
}

export function validationError(message: string, errors: Record<string, string[]>) {
  return NextResponse.json(
    { success: false, message, errors },
    { status: 422 }
  );
}
