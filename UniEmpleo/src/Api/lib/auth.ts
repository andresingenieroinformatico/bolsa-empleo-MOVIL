import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import prisma from "./prisma";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET debe configurarse con al menos 32 caracteres.");
  }
  return secret;
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: "admin" | "company" | "student";
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(
  payload: TokenPayload,
  expiresIn: jwt.SignOptions["expiresIn"] = "7d"
): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn, algorithm: "HS256" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const payload: unknown = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    if (!payload || typeof payload !== "object") return null;
    const candidate = payload as Record<string, unknown>;
    if (
      !Number.isSafeInteger(candidate.userId) || Number(candidate.userId) < 1 ||
      typeof candidate.email !== "string" ||
      (candidate.role !== "admin" && candidate.role !== "company" && candidate.role !== "student")
    ) return null;
    return candidate as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const match = authHeader?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return null;
  }

  const token = match[1];
  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      student_profile: true,
      company_profile: true,
    },
  });

  if (!user) {
    return null;
  }

  const { password: _password, ...safeUser } = user;
  return safeUser;
}
