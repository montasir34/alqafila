import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { auth } from "@/auth";

type PageProps = { searchParams: Promise<Record<string, string>> };

async function MissingList({ sp }: { sp: Record<string, string> }) {
  const state = sp.state ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 12;
  const where = { status: "ACTIVE" as const, ...(state && { state }) };

  const [persons, total] = await Promise.all([
    prisma.missingPerson.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
      select: { id: true, name: true, age: true, gender: true, photoUrl: true, lastSeenAt: true, state: true, city: true, status: true, createdAt: true },
    }),
    prisma.missingPerson.count({ where }),
  ]);

  if (!persons.length) {
    return <div className="text-center py-16 text-muted-fg"><p className="text-4xl mb-3">👤</p><p>لا توجد بلاغات حالياً</p></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-fg">{total} بلاغ</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {persons.map(p => (
          <Link key={p.id} href={`/missing/${p.id}`} className="block group">
            <article className="rounded-xl border border-border bg-background overflow-hidden hover:border-amber-700 hover:shadow-md transition-all">
              {p.photoUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={p.photoUrl} alt={p.name} className="w-full h-40 object-cover object-top" />
                : <div className="w-full h-40 bg-muted flex items-center justify-center text-4xl">👤</div>
              }
              <div className="p-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold group-hover:text-amber-700 transition-colors">{p.name}</h3>
                  {p.age && <span className="text-xs text-muted-fg">{p.age} سنة</span>}
                </div>
                {p.gender && <span className="text-xs text-muted-fg">{p.gender}</span>}
                {p.lastSeenAt && <p className="text-xs text-muted-fg truncate">📍 {p.lastSeenAt}</p>}
                <p className="text-xs text-muted-fg">{p.state} — {p.city}</p>
                <span className="mt-1 text-xs text-amber-700 font-medium">التواصل عبر المنصة فقط</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function MissingPage({ searchParams }: PageProps) {
  const [session, sp] = await Promise.all([auth(), searchParams]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">المفقودون</h1>
        {session?.user && <Link href="/missing/new"><Button size="sm">+ إبلاغ عن مفقود</Button></Link>}
      </div>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200">
        <p className="font-semibold mb-1">خصوصية وأمان</p>
        <p>لا تُكشف أرقام الهواتف أو العناوين الدقيقة. التواصل يتم عبر المنصة فقط لحماية الخصوصية.</p>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><div key={i} className="h-60 rounded-xl bg-muted animate-pulse"/>)}</div>}>
        <MissingList sp={sp} />
      </Suspense>
    </div>
  );
}
