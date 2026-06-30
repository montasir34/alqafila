import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true, email: true, image: true,
      state: true, city: true, role: true, createdAt: true,
      contributor: { select: { status: true } },
      _count: { select: { needs: true, payments: true, badges: true } },
    },
  });

  if (!user) redirect("/login");

  const navLinks = [
    { href: "/profile/my-needs", label: "حوجاتي", icon: "📋", count: user._count.needs },
    { href: "/profile/my-support", label: "دعمي وشاراتي", icon: "💛", count: user._count.badges },
    { href: "/profile/notifications", label: "الإشعارات", icon: "🔔" },
    ...(user.role === "CONTRIBUTOR" || user.role === "ADMIN"
      ? [{ href: "/campaigns/new", label: "فتح حملة جديدة", icon: "📢" }]
      : []),
    ...(user.role === "ADMIN"
      ? [{ href: "/admin", label: "لوحة الإدارة", icon: "⚙️" }]
      : []),
    ...(user.role === "USER" && !user.contributor
      ? [{ href: "/register/contributor", label: "التقديم كمساهم موثّق", icon: "✅" }]
      : []),
  ];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <Card>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-amber-700 text-white flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden">
            {user.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
              : (user.name?.[0] ?? "م")}
          </div>
          <div>
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-sm text-muted-fg">{user.email}</p>
            <p className="text-sm text-muted-fg">{user.state} {user.city ? `/ ${user.city}` : ""}</p>
            <span className="text-xs mt-1 inline-block bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
              {user.role === "ADMIN" ? "أدمن" : user.role === "CONTRIBUTOR" ? "مساهم موثّق" : "مستخدم"}
            </span>
            {user.contributor && user.contributor.status === "PENDING" && (
              <span className="text-xs ms-1 inline-block bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">
                طلب توثيق قيد المراجعة
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 text-center text-sm">
          <div className="rounded-lg bg-muted p-3">
            <p className="font-bold text-xl text-amber-700">{user._count.needs}</p>
            <p className="text-muted-fg text-xs">حوجة</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="font-bold text-xl text-amber-700">{user._count.payments}</p>
            <p className="text-muted-fg text-xs">دفعة</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="font-bold text-xl text-amber-700">{user._count.badges}</p>
            <p className="text-muted-fg text-xs">شارة</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {navLinks.map(l => (
          <Link key={l.href} href={l.href}
            className="rounded-xl border border-border bg-background p-4 hover:border-amber-700 hover:shadow-md transition-all flex items-center gap-3">
            <span className="text-2xl">{l.icon}</span>
            <div>
              <p className="font-medium">{l.label}</p>
              {l.count !== undefined && (
                <p className="text-xs text-muted-fg">{l.count} عنصر</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
