import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "مفتوحة", FULFILLED: "مكتملة", CLOSED: "مغلقة",
};
const STATUS_COLORS: Record<string, string> = {
  OPEN: "text-green-600", FULFILLED: "text-blue-600", CLOSED: "text-muted-fg",
};

export default async function MyNeedsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const needs = await prisma.need.findMany({
    where: { posterId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, type: true, status: true, isUrgent: true, isAnonymous: true,
      targetAmount: true, collectedAmount: true, createdAt: true, state: true,
      _count: { select: { payments: true, votes: true } },
    },
  });

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">حوجاتي ({needs.length})</h1>
        <Link href="/needs/new" className="text-sm text-amber-700 font-medium hover:underline">+ حوجة جديدة</Link>
      </div>

      {needs.length === 0 ? (
        <div className="text-center py-16 text-muted-fg">
          <p className="text-4xl mb-3">📋</p>
          <p>لم تنشر أي حوجة بعد</p>
          <Link href="/needs/new" className="mt-3 inline-block text-amber-700 font-medium hover:underline">
            انشر أول حوجة
          </Link>
        </div>
      ) : (
        needs.map(n => (
          <Link key={n.id} href={`/needs/${n.id}`}>
            <Card className="flex flex-col gap-3 hover:border-amber-700 transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug">{n.title}</h3>
                <span className={`text-xs font-medium shrink-0 ${STATUS_COLORS[n.status]}`}>
                  {STATUS_LABELS[n.status]}
                </span>
              </div>
              <ProgressBar collected={n.collectedAmount} target={n.targetAmount} />
              <div className="flex gap-3 text-xs text-muted-fg">
                {n.isUrgent && <span className="text-red-600 font-medium">🔴 عاجل</span>}
                {n.isAnonymous && <span>🕶 مجهول</span>}
                <span>💳 {n._count.payments} دفعة</span>
                <span>👍 {n._count.votes} تصويت</span>
                <span className="ms-auto">{new Date(n.createdAt).toLocaleDateString("ar-SD")}</span>
              </div>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
