import Link from "next/link";
import { auth } from "@/auth";
import { NavbarClient } from "./NavbarClient";

const guestLinks = [
  { href: "/#المنصة-أكبر", label: "المنصة" },
  { href: "/#كيف-تعمل", label: "كيف تعمل؟" },
  { href: "/#الحوجات-العاجلة", label: "الحوجات العاجلة" },
  { href: "/#أسئلة-شائعة", label: "أسئلة شائعة" },
];

const authLinks = [
  { href: "/needs", label: "الحوجات" },
  { href: "/campaigns", label: "الحملات" },
  { href: "/lost", label: "المفقودات" },
  { href: "/missing", label: "المفقودون" },
  { href: "/contributors", label: "المساهمون" },
];

export async function Navbar() {
  const session = await auth();
  const navLinks = session?.user ? authLinks : guestLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
        {/* شعار */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-primary shrink-0 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">🚛</span>
          <span>القافلة</span>
        </Link>

        {/* روابط رئيسية — desktop */}
        <nav className="hidden md:flex items-center gap-1" aria-label="التنقل الرئيسي">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-fg hover:text-foreground hover:bg-muted transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* الجزء الأيسر */}
        <NavbarClient user={session?.user ?? null} navLinks={navLinks} />
      </div>
    </header>
  );
}
