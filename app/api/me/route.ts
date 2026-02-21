import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCookieName, verifySession } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json(
    { user: { id: session.sub, email: session.email } },
    { status: 200 }
  );
}