import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

export const SESSION_COOKIE_NAME = "qt_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dni

const ISSUER = "QuizTest";
const AUDIENCE = "quiztest-web";

const encoder = new TextEncoder();
const secretKey = encoder.encode(env.JWT_SECRET);

export type SessionPayload = {
  sub: string; // userId
  email: string;
};

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/" as const,
  };
}

export async function signSession(payload: SessionPayload, ttlSeconds = SESSION_TTL_SECONDS) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setSubject(payload.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + ttlSeconds)
    .sign(secretKey);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    const sub = payload.sub;
    const email = payload.email;

    if (typeof sub !== "string") return null;
    if (typeof email !== "string") return null;

    return { sub, email };
  } catch {
    return null;
  }
}