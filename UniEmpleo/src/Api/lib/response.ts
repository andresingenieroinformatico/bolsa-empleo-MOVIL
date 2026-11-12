import { NextResponse } from "next/server";

export function successResponse<T = any>(
  message: string = "Operación realizada correctamente",
  data: T = {} as T,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string = "Error en la operación",
  errors: Record<string, any> = {},
  status: number = 400
) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}
