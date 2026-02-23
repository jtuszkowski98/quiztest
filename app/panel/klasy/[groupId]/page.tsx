import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../../lib/current-user";
import { prisma } from "../../../../lib/prisma";
import CreateInviteForm from "../../../../components/CreateInviteForm";

export default async function KlasaDetailsPage({ params }: { params: { groupId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");

  const group = await prisma.group.findUnique({
    where: { id: params.groupId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      createdAt: true,
      members: {
        select: {
          id: true,
          role: true,
          createdAt: true,
          user: { select: { id: true, email: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!group) {
    redirect("/panel/klasy");
  }

  // czy user jest członkiem?
  const isMember = group.members.some((m) => m.user.id === user.id);
  if (!isMember) redirect("/panel/klasy");

  const myRole = group.members.find((m) => m.user.id === user.id)?.role;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-950">{group.name}</h1>
          <p className="text-blue-950/70 mt-2">
            Zarządzanie klasą i członkami.
          </p>
        </div>

        <Link href="/panel/klasy" className="text-blue-950/80 hover:text-blue-950 underline">
          ← Wróć do klas
        </Link>
      </div>

      {(myRole === "OWNER" || myRole === "TEACHER") ? (
        <section className="mt-8 bg-white rounded-3xl border border-blue-100 p-8 shadow-xl">
          <h2 className="text-xl font-bold text-blue-950">Zaproszenie do klasy</h2>
          <p className="text-blue-950/70 mt-2">
            Wygeneruj link zaproszenia. Możesz ustawić rolę i limit użyć.
          </p>
          <div className="mt-6">
            <CreateInviteForm groupId={group.id} />
          </div>
        </section>
      ) : null}

      <section className="mt-8 bg-white rounded-3xl border border-blue-100 p-8 shadow-xl">
        <h2 className="text-xl font-bold text-blue-950">Członkowie</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-blue-950/60 border-b">
                <th className="py-2">Użytkownik</th>
                <th className="py-2">Rola</th>
                <th className="py-2">Dołączył</th>
              </tr>
            </thead>
            <tbody>
              {group.members.map((m) => (
                <tr key={m.id} className="border-b last:border-b-0">
                  <td className="py-3">
                    <div className="font-semibold text-blue-950">{m.user.name ?? "—"}</div>
                    <div className="text-sm text-blue-950/70">{m.user.email}</div>
                  </td>
                  <td className="py-3 font-semibold text-blue-950">{m.role}</td>
                  <td className="py-3 text-blue-950/70">
                    {new Date(m.createdAt).toLocaleString("pl-PL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}