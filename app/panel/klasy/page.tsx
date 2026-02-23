import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/current-user";
import { prisma } from "../../../lib/prisma";

export default async function KlasyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/logowanie");

  const groups = await prisma.group.findMany({
    where: { members: { some: { userId: user.id } } },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-950">Klasy</h1>
          <p className="text-blue-950/70 mt-2">
            Twórz klasy i udostępniaj quizy wybranej grupie użytkowników.
          </p>
        </div>

        <Link
          href="/panel/klasy/nowa"
          className="px-5 py-3 rounded-2xl bg-blue-950 text-white font-semibold hover:opacity-90 transition"
        >
          + Nowa klasa
        </Link>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <Link
            key={g.id}
            href={`/panel/klasy/${g.id}`}
            className="group bg-white rounded-3xl border border-blue-100 p-7 shadow-xl hover:shadow-2xl transition"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold text-blue-950 group-hover:underline">
                {g.name}
              </h2>
              <span className="text-blue-950/50 group-hover:text-blue-950 transition">
                →
              </span>
            </div>

            <p className="text-blue-950/70 mt-2">
              Liczba członków: <span className="font-semibold">{g._count.members}</span>
            </p>

            <p className="text-blue-950/60 text-sm mt-2">
              Utworzono: {new Date(g.createdAt).toLocaleString("pl-PL")}
            </p>

            <div className="mt-5">
              <span className="text-xs px-3 py-1 rounded-full border border-green-200 bg-green-50 text-green-800">
                Otwórz szczegóły
              </span>
            </div>
          </Link>
        ))}

        {groups.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-3xl border border-blue-100 p-8 shadow-xl">
            <h2 className="text-xl font-bold text-blue-950">Brak klas</h2>
            <p className="text-blue-950/70 mt-2">
              Utwórz pierwszą klasę, aby móc udostępniać quizy danej grupie.
            </p>
            <div className="mt-5">
              <Link
                href="/panel/klasy/nowa"
                className="inline-flex px-6 py-3 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
              >
                Utwórz klasę
              </Link>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}