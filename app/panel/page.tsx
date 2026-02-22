import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/current-user";
import LogoutButton from "../../components/LogoutButton";

export default async function PanelPage() {
  const user = await getCurrentUser();

  // Middleware i tak chroni /panel, ale to jest drugi “pas bezpieczeństwa”
  if (!user) {
    redirect("/login");
  }

  return (
    <section style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Dashboard</h1>
      <p style={{ marginBottom: 16 }}>
        Zalogowany jako: <strong>{user.email}</strong>
      </p>

      <div
        style={{
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Status konta</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Konto aktywne ✅</li>
          <li>Połączenie z bazą: Prisma + Neon ✅</li>
          <li>Sesja: JWT w httpOnly cookie ✅</li>
        </ul>
      </div>

      <LogoutButton />
    </section>
  );
}