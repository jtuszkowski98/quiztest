import LogoutButton from "@/components/LogoutButton";
import MeBar from "@/components/MeBar";

export default function Panel() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-950">Panel użytkownika</h1>
          <MeBar />
        </div>

        <LogoutButton />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-100">Quizy</div>
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-100">Klasy</div>
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-100">Wyniki</div>
      </div>
    </main>
  );
}