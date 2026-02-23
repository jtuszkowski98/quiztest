import Link from "next/link";
import CreateGroupForm from "../../../../components/CreateGroupForm";

export default function NowaKlasaPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-blue-950">Nowa klasa</h1>
        <Link href="/panel/klasy" className="text-blue-950/80 hover:text-blue-950 underline">
          ← Wróć do klas
        </Link>
      </div>

      <section className="mt-8 bg-white rounded-3xl border border-blue-100 p-8 shadow-xl">
        <CreateGroupForm />
      </section>
    </main>
  );
}