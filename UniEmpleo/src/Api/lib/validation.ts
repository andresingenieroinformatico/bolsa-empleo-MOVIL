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

/**
 * Laravel notification IDs are UUIDs, not integers, so the shared numeric id
 * guard cannot be reused for routes that address a notification.
 */
export function invalidNotificationIdResponse(id: string) {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) {
    return NextResponse.json(
      { success: false, message: "El identificador de la notificación no es válido." },
      { status: 400 }
    );
  }
  return null;
}
