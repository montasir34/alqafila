import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ItemCard } from "@/components/lost/ItemCard";
import { Button } from "@/components/ui/Button";
import { auth } from "@/auth";

type PageProps = { searchParams: Promise<Record<string, string>> };

async function LostList({ sp }: { sp: Record<string, string> }) {
  const kind = sp.kind ?? "item";
  const state = sp.state ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 12;
  const skip = (page - 1) * limit;
  const where = { status: "ACTIVE" as const, ...(state && { state }) };

  if (kind === "car") {
    const [items, total] = await Promise.all([
      prisma.lostCar.findMany({
        where, orderBy: { createdAt: "desc" }, skip, take: limit,
        select: { id: true, make: true, model: true, color: true, plateNumber: true, imageUrl: true, state: true, city: true, status: true, createdAt: true },
      }),
      prisma.lostCar.count({ where }),
    ]);
    if (!items.length) return <Empty />;
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-fg">{total} سيارة</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <ItemCard key={c.id} id={c.id} kind="lost-car"
              title={`${c.make} ${c.model} — ${c.color}`}
              description={`لوحة: ${c.plateNumber}`}
              imageUrl={c.imageUrl} state={c.state} city={c.city}
              status={c.status} createdAt={c.createdAt.toISOString()} />
          ))}
        </div>
      </div>
    );
  }

  const [items, total] = await Promise.all([
    prisma.lostItem.findMany({
      where, orderBy: { createdAt: "desc" }, skip, take: limit,
      select: { id: true, title: true, description: true, imageUrl: true, lastSeenAt: true, state: true, city: true, status: true, createdAt: true },
    }),
    prisma.lostItem.count({ where }),
  ]);
  if (!items.length) return <Empty />;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-fg">{total} منشور</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((i) => (
          <ItemCard key={i.id} id={i.id} kind="lost-item"
            title={i.title} description={i.description}
            imageUrl={i.imageUrl} state={i.state} city={i.city}
            status={i.status} createdAt={i.createdAt.toISOString()} />
        ))}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="text-center py-16 text-muted-fg">
      <p className="text-4xl mb-3">🔍</p>
      <p>لا توجد منشورات حالياً</p>
    </div>
  );
}

export default async function LostPage({ searchParams }: PageProps) {
  const [session, sp] = await Promise.all([auth(), searchParams]);
  const kind = sp.kind ?? "item";

  const tabBase = (k: string) =>
    [
      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
      kind === k ? "bg-amber-700 text-white" : "bg-muted text-foreground hover:bg-stone-200 dark:hover:bg-stone-700",
    ].join(" ");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">المفقودات</h1>
        {session?.user && (
          <div className="flex gap-2">
            <Link href="/lost/new/item"><Button size="sm" variant="secondary">+ إبلاغ عن مفقود</Button></Link>
            <Link href="/lost/new/car"><Button size="sm">+ إبلاغ عن سيارة</Button></Link>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Link href="/lost?kind=item" className={tabBase("item")}>أشياء</Link>
        <Link href="/lost?kind=car" className={tabBase("car")}>سيارات</Link>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><div key={i} className="h-48 rounded-xl bg-muted animate-pulse"/>)}</div>}>
        <LostList sp={sp} />
      </Suspense>
    </div>
  );
}
