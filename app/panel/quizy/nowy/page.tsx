import Link from "next/link";

export default function NowyQuizPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold text-blue-950">Nowy quiz</h1>
      <p className="text-blue-950/70 mt-3">
        Formularz tworzenia quizu dodamy w kolejnym kroku.
      </p>

      <div className="mt-6">
        <Link href="/panel" className="underline text-blue-950/80 hover:text-blue-950">
          ← Wróć do dashboardu
        </Link>
      </div>
    </main>
  );
}