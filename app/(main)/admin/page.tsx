import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const [pendingVerifs, pendingReports] = await Promise.all([
    prisma.contributorProfile.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  const sections = [
    { href: "/admin/verifications", label: "توثيق المساهمين", count: pendingVerifs, icon: "✅" },
    { href: "/admin/reports", label: "البلاغات", count: pendingReports, icon: "🚩" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">لوحة الإدارة</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(s => (
          <Link key={s.href} href={s.href}
            className="rounded-xl border border-border bg-background p-6 hover:border-amber-700 hover:shadow-md transition-all flex flex-col gap-3">
            <span className="text-3xl">{s.icon}</span>
            <p className="font-semibold text-lg">{s.label}</p>
            {s.count > 0
              ? <p className="text-amber-700 font-medium">{s.count} معلّق</p>
              : <p className="text-muted-fg text-sm">لا يوجد معلّق</p>
            }
          </Link>
        ))}
      </div>
    </div>
  );
}
