import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Link from "next/link";

type PageProps = { params: Promise<{ id: string }> };

export default async function ContributorProfilePage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id, role: { in: ["CONTRIBUTOR", "ADMIN"] } },
    select: {
      id: true, name: true, image: true, state: true, city: true, createdAt: true,
      badges: {
        orderBy: { awardedAt: "desc" },
        select: { awardedAt: true, badge: { select: { name: true, description: true, iconUrl: true, season: true } } },
      },
      campaigns: {
        where: { status: "ACTIVE" },
        take: 5,
        orderBy: { startedAt: "desc" },
        select: { id: true, title: true, goalAmount: true, raisedAmount: true, status: true },
      },
      _count: { select: { payments: true, campaigns: true, votes: true } },
    },
  });

  if (!user) notFound();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Card>
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-amber-700 text-white flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden">
            {user.image
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={user.image} alt={user.name ?? ""} className="w-full h-full object-cover" />
              : (user.name?.[0] ?? "م")}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-fg">{user.state} {user.city ? `/ ${user.city}` : ""}</p>
            <p className="text-xs text-muted-fg mt-1">مساهم منذ {new Date(user.createdAt).toLocaleDateString("ar-SD")}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 text-center text-sm">
          {[
            { value: user._count.payments, label: "دفعة مؤكدة" },
            { value: user._count.campaigns, label: "حملة" },
            { value: user._count.votes, label: "تصويت إلحاح" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-lg bg-muted p-3">
              <p className="font-bold text-xl text-amber-700">{value}</p>
              <p className="text-muted-fg text-xs">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {user.badges.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">الشارات ({user.badges.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {user.badges.map((ub, i) => (
              <div key={i} className="rounded-xl border border-border p-4 flex flex-col items-center gap-2 text-center">
                <span className="text-3xl">{ub.badge.iconUrl ?? "🏅"}</span>
                <p className="font-semibold text-sm">{ub.badge.name}</p>
                <p className="text-xs text-muted-fg">{ub.badge.description}</p>
                <p className="text-xs text-amber-700">{ub.badge.season}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {user.campaigns.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">الحملات النشطة</h2>
          <div className="flex flex-col gap-3">
            {user.campaigns.map(c => (
              <Link key={c.id} href={`/campaigns/${c.id}`}>
                <Card className="hover:border-amber-700 transition-colors cursor-pointer">
                  <p className="font-medium mb-3">{c.title}</p>
                  <ProgressBar collected={c.raisedAmount} target={c.goalAmount} />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
