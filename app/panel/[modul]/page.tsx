import Link from "next/link";

type Props = {
  params: { modul: string };
};

const titles: Record<string, string> = {
  quizy: "Quizy",
  fiszki: "Fiszki",
  klasy: "Klasy",
  wyniki: "Wyniki",
  biblioteka: "Biblioteka",
  ustawienia: "Ustawienia",
};

export default function ModulPage({ params }: Props) {
  const title = titles[params.modul] ?? "Moduł";

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold text-blue-950">{title}</h1>
      <p className="text-blue-950/70 mt-3">
        Ten moduł jest w przygotowaniu. Dashboard jest już gotowy pod cały projekt — teraz będziemy
        wdrażać funkcjonalności krok po kroku.
      </p>

      <div className="mt-6">
        <Link
          href="/panel"
          className="inline-flex px-5 py-3 rounded-2xl border-2 border-blue-500 text-blue-950 font-semibold hover:bg-blue-900 hover:text-white transition"
        >
          ← Wróć do dashboardu
        </Link>
      </div>
    </main>
  );
}