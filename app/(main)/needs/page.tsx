import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NeedCard } from "@/components/needs/NeedCard";
import { NeedsFilters } from "@/components/needs/NeedsFilters";
import { Button } from "@/components/ui/Button";
import { auth } from "@/auth";

type PageProps = {
  searchParams: Promise<Record<string, string>>;
};

async function NeedsList({ searchParams }: { searchParams: Record<string, string> }) {
  const state = searchParams.state ?? "";
  const type = searchParams.type ?? "";
  const urgent = searchParams.urgent === "1";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    status: "OPEN" as const,
    ...(state && { state }),
    ...(type && { type: type as never }),
    ...(urgent && { isUrgent: true }),
  };

  const [needs, total] = await Promise.all([
    prisma.need.findMany({
      where,
      orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      select: {
        id: true, type: true, title: true, description: true,
        targetAmount: true, collectedAmount: true, isUrgent: true,
        isAnonymous: true, state: true, city: true, createdAt: true,
        poster: { select: { id: true, name: true, image: true } },
        _count: { select: { votes: true, payments: true } },
      },
    }),
    prisma.need.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  if (needs.length === 0) {
    return (
      <div className="text-center py-16 text-muted-fg">
        <p className="text-4xl mb-3">🔍</p>
        <p>لا توجد حوجات تطابق الفلاتر المحددة</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-fg">{total} حوجة</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {needs.map((n) => (
          <NeedCard
            key={n.id}
            need={{ ...n, poster: n.isAnonymous ? null : n.poster, createdAt: n.createdAt.toISOString() }}
          />
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/needs?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
              className={[
                "h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium border transition-colors",
                p === page
                  ? "bg-amber-700 text-white border-amber-700"
                  : "border-border hover:border-amber-700 hover:text-amber-700",
              ].join(" ")}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function NeedsPage({ searchParams }: PageProps) {
  const [session, sp] = await Promise.all([auth(), searchParams]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">الحوجات</h1>
        {session?.user && (
          <Link href="/needs/new">
            <Button size="sm">+ انشر حوجتك</Button>
          </Link>
        )}
      </div>

      <Suspense fallback={null}>
        <NeedsFilters />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl border border-border bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <NeedsList searchParams={sp} />
      </Suspense>
    </div>
  );
}
