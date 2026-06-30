import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { auth } from "@/auth";

async function CampaignsList() {
  const campaigns = await prisma.liveCampaign.findMany({
    where: { status: "ACTIVE" },
    orderBy: { startedAt: "desc" },
    take: 18,
    select: {
      id: true, title: true, description: true,
      goalAmount: true, raisedAmount: true, startedAt: true,
      contributor: { select: { name: true, image: true } },
      _count: { select: { payments: true } },
    },
  });

  if (!campaigns.length) {
    return <div className="text-center py-16 text-muted-fg"><p className="text-4xl mb-3">📢</p><p>لا توجد حملات نشطة حالياً</p></div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {campaigns.map(c => (
        <Link key={c.id} href={`/campaigns/${c.id}`} className="block group">
          <article className="rounded-xl border border-border bg-background p-5 hover:border-amber-700 hover:shadow-md transition-all h-full flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-amber-700 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {c.contributor.name?.[0] ?? "م"}
              </span>
              <span className="text-sm font-medium truncate">{c.contributor.name}</span>
            </div>
            <h3 className="font-semibold leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">{c.title}</h3>
            <p className="text-sm text-muted-fg line-clamp-2 flex-1">{c.description}</p>
            <ProgressBar collected={c.raisedAmount} target={c.goalAmount} />
            <p className="text-xs text-muted-fg">💳 {c._count.payments} داعم</p>
          </article>
        </Link>
      ))}
    </div>
  );
}

export default async function CampaignsPage() {
  const session = await auth();
  const isContributor = session?.user?.role === "CONTRIBUTOR" || session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">الحملات اللايف</h1>
        {isContributor && (
          <Link href="/campaigns/new"><Button size="sm">+ افتح حملة</Button></Link>
        )}
      </div>
      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{Array.from({length:6}).map((_,i)=><div key={i} className="h-52 rounded-xl bg-muted animate-pulse"/>)}</div>}>
        <CampaignsList />
      </Suspense>
    </div>
  );
}
