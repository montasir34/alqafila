import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NeedDetailClient } from "@/components/needs/NeedDetailClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function NeedDetailPage({ params }: PageProps) {
  const [{ id }, session] = await Promise.all([params, auth()]);

  const need = await prisma.need.findUnique({
    where: { id },
    include: {
      poster: { select: { id: true, name: true, image: true } },
      _count: { select: { votes: true, payments: true } },
      payments: {
        where: { status: "CONFIRMED" },
        orderBy: { confirmedAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          method: true,
          confirmedAt: true,
          supporter: { select: { name: true, image: true } },
        },
      },
    },
  });

  if (!need) notFound();

  const serialized = {
    ...need,
    poster: need.isAnonymous ? null : need.poster,
    createdAt: need.createdAt.toISOString(),
    payments: need.payments.map((p) => ({
      ...p,
      confirmedAt: p.confirmedAt?.toISOString() ?? null,
    })),
  };

  return (
    <NeedDetailClient
      initialData={serialized}
      currentUserId={session?.user?.id}
      currentUserRole={session?.user?.role}
    />
  );
}
