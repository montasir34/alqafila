import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { CampaignDetailClient } from "@/components/campaigns/CampaignDetailClient";

type PageProps = { params: Promise<{ id: string }> };

type RawPayment = {
  id: string;
  amount: number;
  method: string;
  confirmedAt: Date | null;
  supporter: { name: string | null };
};

type RawDisbursement = {
  id: string;
  amount: number;
  recipient: string;
  proofUrl: string | null;
  spentAt: Date;
};

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
    payments: (campaign.payments as RawPayment[]).map((p) => ({
      id: p.id,
      amount: p.amount,
      method: p.method,
      confirmedAt: p.confirmedAt?.toISOString() ?? null,
      supporter: p.supporter,
    })),
    disbursements: (campaign.disbursements as RawDisbursement[]).map((d) => ({
      id: d.id,
      amount: d.amount,
      recipient: d.recipient,
      proofUrl: d.proofUrl,
      spentAt: d.spentAt.toISOString(),
    })),
  };

  return (
    <CampaignDetailClient
      initialData={serialized}
      currentUserId={session?.user?.id}
      currentUserRole={session?.user?.role}
    />
  );
}
