import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "معلّقة", CONFIRMED: "مؤكدة", REJECTED: "مرفوضة",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600", CONFIRMED: "text-green-600", REJECTED: "text-red-600",
};

export default async function MySupportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [payments, badges] = await Promise.all([
    prisma.payment.findMany({
      where: { supporterId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true, amount: true, method: true, status: true, createdAt: true,
        need: { select: { id: true, title: true } },
        campaign: { select: { id: true, title: true } },
      },
    }),
    prisma.userBadge.findMany({
      where: { userId: session.user.id },
      orderBy: { awardedAt: "desc" },
      select: {
        awardedAt: true,
        badge: { select: { name: true, description: true, iconUrl: true, season: true } },
      },
    }),
  ]);

  const totalConfirmed = payments
    .filter(p => p.status === "CONFIRMED")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold">دعمي وشاراتي</h1>

      {/* إجمالي الدعم */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
        <p className="text-3xl font-bold text-amber-700">{totalConfirmed.toLocaleString("ar-SD")} ج</p>
        <p className="text-sm text-muted-fg mt-1">إجمالي الدعم المؤكد</p>
      </div>

      {/* الشارات */}
      {badges.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">الشارات ({badges.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((ub, i) => (
              <div key={i} className="rounded-xl border border-border p-4 flex flex-col items-center gap-1 text-center">
                <span className="text-3xl">{ub.badge.iconUrl ?? "🏅"}</span>
                <p className="font-semibold text-sm">{ub.badge.name}</p>
                <p className="text-xs text-muted-fg">{ub.badge.season}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* سجل الدفعات */}
      <div>
        <h2 className="text-lg font-semibold mb-3">سجل الدفعات ({payments.length})</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-fg">لم تدعم أي حوجة أو حملة بعد</p>
        ) : (
          <div className="flex flex-col gap-3">
            {payments.map(p => (
              <Link key={p.id} href={p.need ? `/needs/${p.need.id}` : `/campaigns/${p.campaign?.id}`}>
                <Card className="flex items-center justify-between gap-3 hover:border-amber-700 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {p.need?.title ?? p.campaign?.title ?? "—"}
                    </p>
                    <p className="text-xs text-muted-fg mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString("ar-SD")} · {p.method}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="font-semibold text-amber-700">{p.amount.toLocaleString("ar-SD")} ج</p>
                    <p className={`text-xs ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
