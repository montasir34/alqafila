import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ItemCard } from "@/components/lost/ItemCard";
import { Button } from "@/components/ui/Button";
import { auth } from "@/auth";

type PageProps = { searchParams: Promise<Record<string, string>> };

async function FoundList({ sp }: { sp: Record<string, string> }) {
  const isCar = sp.isCar === "1";
  const state = sp.state ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 12;
  const where = { status: "ACTIVE" as const, isCar, ...(state && { state }) };

  const [items, total] = await Promise.all([
    prisma.foundItem.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      select: { id: true, isCar: true, title: true, description: true, imageUrl: true, plateNumber: true, state: true, city: true, status: true, createdAt: true },
    }),
    prisma.foundItem.count({ where }),
  ]);

  if (!items.length) return <div className="text-center py-16 text-muted-fg"><p className="text-4xl mb-3">🔍</p><p>لا توجد منشورات</p></div>;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-fg">{total} منشور</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(i => (
          <ItemCard key={i.id} id={i.id} kind="found" title={i.title}
            description={i.isCar && i.plateNumber ? `لوحة: ${i.plateNumber}` : i.description}
            imageUrl={i.imageUrl} state={i.state} city={i.city} status={i.status} createdAt={i.createdAt.toISOString()} />
        ))}
      </div>
    </div>
  );
}

export default async function FoundPage({ searchParams }: PageProps) {
  const [session, sp] = await Promise.all([auth(), searchParams]);
  const isCar = sp.isCar === "1";
  const tabCls = (active: boolean) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-amber-700 text-white" : "bg-muted hover:bg-stone-200 dark:hover:bg-stone-700"}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">المعثور عليه</h1>
        {session?.user && <Link href="/found/new"><Button size="sm">+ أبلغ عن معثور عليه</Button></Link>}
      </div>
      <div className="flex gap-2">
        <Link href="/found" className={tabCls(!isCar)}>أشياء</Link>
        <Link href="/found?isCar=1" className={tabCls(isCar)}>سيارات</Link>
      </div>
      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><div key={i} className="h-48 rounded-xl bg-muted animate-pulse"/>)}</div>}>
        <FoundList sp={sp} />
      </Suspense>
    </div>
  );
}
