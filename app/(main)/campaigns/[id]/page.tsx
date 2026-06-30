import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CampaignDetailClient } from "@/components/campaigns/CampaignDetailClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function CampaignDetailPage({ params }: PageProps) {
  const [{ id }, session] = await Promise.all([params, auth()]);

  const campaign = await prisma.liveCampaign.findUnique({
    where: { id },
    include: {
      contributor: { select: { id: true, name: true, image: true } },
      payments: {
        where: { status: "CONFIRMED" },
        orderBy: { confirmedAt: "desc" }, take: 20,
        select: { id: true, amount: true, method: true, confirmedAt: true, supporter: { select: { name: true } } },
      },
      disbursements: {
        orderBy: { spentAt: "desc" },
        select: { id: true, amount: true, recipient: true, proofUrl: true, spentAt: true },
      },
      _count: { select: { payments: true } },
    },
  });

  if (!campaign) notFound();

  const serialized = {
    ...campaign,
    startedAt: campaign.startedAt.toISOString(),
    endedAt: campaign.endedAt?.toISOString() ?? null,
    payments: campaign.payments.map(p => ({ ...p, confirmedAt: p.confirmedAt?.toISOString() ?? null })),
    disbursements: campaign.disbursements.map(d => ({ ...d, spentAt: d.spentAt.toISOString() })),
  };

  return (
    <CampaignDetailClient
      initialData={serialized}
      currentUserId={session?.user?.id}
      currentUserRole={session?.user?.role}
    />
  );
}
