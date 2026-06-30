import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

async function LeaderboardList() {
  const contributors = await prisma.user.findMany({
    where: { role: { in: ["CONTRIBUTOR", "ADMIN"] } },
    select: {
      id: true, name: true, image: true, state: true,
      badges: {
        take: 3,
        orderBy: { awardedAt: "desc" },
        select: { badge: { select: { name: true, iconUrl: true } } },
      },
      _count: { select: { payments: true, campaigns: true, votes: true } },
    },
  });

  const sorted = contributors.sort((a, b) => b._count.payments - a._count.payments);

  if (!sorted.length) {
    return (
      <div className="text-center py-16 text-muted-fg">
        <p className="text-4xl mb-3">🌟</p>
        <p>لا يوجد مساهمون موثّقون بعد</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((c, i) => (
        <Link key={c.id} href={`/contributors/${c.id}`}>
          <Card className="flex items-center gap-4 hover:border-amber-700 transition-colors cursor-pointer">
            <span className="text-xl font-bold text-muted-fg w-8 shrink-0 text-center">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
            </span>
            <div className="h-12 w-12 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
              {c.image
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={c.image} alt={c.name ?? ""} className="h-12 w-12 rounded-full object-cover" />
                : (c.name?.[0] ?? "م")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{c.name ?? "مساهم"}</p>
              <p className="text-xs text-muted-fg">{c.state || "غير محدد"}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {c.badges.map((b, bi) => (
                  <span key={bi} className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                    {b.badge.iconUrl ? b.badge.iconUrl : "🏅"} {b.badge.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-sm text-end shrink-0">
              <p><span className="font-semibold text-amber-700">{c._count.payments}</span> دفعة</p>
              <p className="text-muted-fg">{c._count.campaigns} حملة</p>
              <p className="text-muted-fg">{c._count.votes} تصويت</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function ContributorsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">المساهمون الموثّقون</h1>
        <p className="text-sm text-muted-fg mt-1">مرتّبون حسب عدد الدفعات المؤكدة</p>
      </div>
      <Suspense fallback={
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      }>
        <LeaderboardList />
      </Suspense>
    </div>
  );
}
