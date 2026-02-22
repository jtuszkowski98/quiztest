import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE_NAME } from "./auth";
import { prisma } from "./prisma";

export type CurrentUser = {
  id: string;
  email: string;
  createdAt: Date;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, createdAt: true },
  });

  // Jeśli user istnieje, createdAt zawsze będzie Date (Prisma), więc typujemy to twardo
  return user ?? null;
}