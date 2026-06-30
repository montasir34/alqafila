"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

type NavLink = { href: string; label: string };

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
} | null;

interface NavbarClientProps {
  user: User;
  navLinks: NavLink[];
}

export function NavbarClient({ user, navLinks }: NavbarClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* زر القائمة — موبايل */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-muted-fg hover:bg-muted hover:text-foreground transition-colors"
        aria-label="القائمة"
        aria-expanded={mobileOpen}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          {mobileOpen ? (
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            <>
              <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {/* حساب المستخدم / أزرار الدخول */}
      {!user ? (
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">دخول</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">تسجيل مجاني</Button>
          </Link>
        </div>
      ) : (
        <div className="relative hidden md:block">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors"
            aria-expanded={menuOpen}
          >
            <span className="h-7 w-7 rounded-full bg-primary text-primary-fg flex items-center justify-center text-xs font-bold overflow-hidden">
              {user.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={user.image} alt="" className="h-full w-full object-cover" />
                : (user.name?.[0] ?? "م")}
            </span>
            <span className="hidden sm:block text-sm font-medium max-w-30 truncate">
              {user.name}
            </span>
            <svg className="h-3.5 w-3.5 text-muted-fg" fill="none" viewBox="0 0 16 16">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute inset-e-0 top-11 z-20 w-52 rounded-2xl border border-border bg-surface shadow-lg shadow-black/8 py-1.5 overflow-hidden">
                {[
                  { href: "/profile", label: "ملفي الشخصي" },
                  { href: "/profile/my-needs", label: "حوجاتي" },
                  { href: "/profile/my-support", label: "دعمي وشاراتي" },
                  { href: "/profile/notifications", label: "الإشعارات" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-foreground hover:bg-surface-alt transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-primary font-medium hover:bg-primary-soft transition-colors"
                  >
                    ⚙️ لوحة الإدارة
                  </Link>
                )}
                <hr className="my-1 border-border" />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-start px-4 py-2 text-sm text-urgent hover:bg-urgent-soft transition-colors"
                >
                  تسجيل الخروج
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* قائمة موبايل منسدلة */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-14 inset-x-0 z-50 bg-surface border-b border-border shadow-lg md:hidden">
            <nav className="flex flex-col p-3 gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <hr className="border-border my-1" />
              {!user ? (
                <div className="flex gap-2 p-1">
                  <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">دخول</Button>
                  </Link>
                  <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full">تسجيل</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {[
                    { href: "/profile", label: "ملفي الشخصي" },
                    { href: "/profile/my-needs", label: "حوجاتي" },
                    { href: "/profile/notifications", label: "الإشعارات" },
                  ].map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="text-start px-4 py-2.5 rounded-xl text-sm text-urgent hover:bg-urgent-soft transition-colors"
                  >
                    تسجيل الخروج
                  </button>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
