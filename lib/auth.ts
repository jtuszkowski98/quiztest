import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "qt_session";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in .env");
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string; // userId
  email: string;
};

export function getCookieName() {
  return COOKIE_NAME;
}

export async function signSession(payload: SessionPayload) {
  const secret = getSecret();

  // 7 dni
  const token = await new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);

    const sub = payload.sub;
    const email = payload.email;

    if (typeof sub !== "string") return null;
    if (typeof email !== "string") return null;

    return { sub, email };
  } catch {
    return null;
  }
}