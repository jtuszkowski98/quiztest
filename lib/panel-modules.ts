export type PanelModule = {
  slug: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  status?: "Gotowe" | "Wkrótce";
};

export const modules: PanelModule[] = [
  {
    slug: "quizy",
    title: "Quizy",
    description: "Twórz quizy i testy, zarządzaj pytaniami oraz publikuj.",
    href: "/panel/quizy",
    icon: "🧠",
    status: "Wkrótce",
  },
  {
    slug: "fiszki",
    title: "Fiszki",
    description: "Zestawy fiszek do nauki i szybkie powtórki materiału.",
    href: "/panel/fiszki",
    icon: "🃏",
    status: "Wkrótce",
  },
  {
    slug: "klasy",
    title: "Klasy",
    description: "Zarządzaj grupami, uczniami i przypisuj materiały.",
    href: "/panel/klasy",
    icon: "🏫",
    status: "Wkrótce",
  },
  {
    slug: "wyniki",
    title: "Wyniki",
    description: "Analizuj postępy, statystyki i raporty z testów.",
    href: "/panel/wyniki",
    icon: "📈",
    status: "Wkrótce",
  },
  {
    slug: "biblioteka",
    title: "Biblioteka",
    description: "Twoje zasoby: pytania, kategorie, tagi, import/eksport.",
    href: "/panel/biblioteka",
    icon: "📚",
    status: "Wkrótce",
  },
  {
    slug: "ustawienia",
    title: "Ustawienia",
    description: "Preferencje aplikacji, powiadomienia i konfiguracje.",
    href: "/panel/ustawienia",
    icon: "⚙️",
    status: "Wkrótce",
  },
];