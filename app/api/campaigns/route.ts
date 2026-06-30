import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCampaignSchema } from "@/lib/validations/campaign";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 9;
  const skip = (page - 1) * limit;

  const where = { status: "ACTIVE" as const };

  const [campaigns, total] = await Promise.all([
    prisma.liveCampaign.findMany({
      where, orderBy: { startedAt: "desc" }, skip, take: limit,
      select: {
        id: true, title: true, description: true,
        goalAmount: true, raisedAmount: true, status: true, startedAt: true,
        contributor: { select: { id: true, name: true, image: true } },
        _count: { select: { payments: true } },
      },
    }),
    prisma.liveCampaign.count({ where }),
  ]);

  return NextResponse.json({ campaigns, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }
  if (session.user.role !== "CONTRIBUTOR" && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "فتح الحملات للمساهمين الموثّقين فقط" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = createCampaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const campaign = await prisma.liveCampaign.create({
    data: { ...parsed.data, contributorId: session.user.id },
    select: { id: true },
  });
  return NextResponse.json({ id: campaign.id }, { status: 201 });
}
