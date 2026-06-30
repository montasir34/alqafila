import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET /api/badges — قائمة الشارات مع من حصل عليها
export async function GET(_req: NextRequest) {
  const badges = await prisma.badge.findMany({
    orderBy: { season: "asc" },
    include: {
      users: {
        take: 5,
        orderBy: { awardedAt: "asc" },
        select: {
          awardedAt: true,
          user: { select: { name: true, image: true } },
        },
      },
      _count: { select: { users: true } },
    },
  });

  return NextResponse.json({ badges });
}

// POST /api/badges — منح شارة (أدمن فقط)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "أدمن فقط" }, { status: 403 });
  }

  try {
    const { userId, badgeId } = await req.json();
    if (!userId || !badgeId) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const award = await prisma.userBadge.create({
      data: { userId, badgeId },
    });

    await prisma.notification.create({
      data: {
        userId,
        type: "VERIFY_RESULT",
        message: "تهانينا! حصلت على شارة جديدة 🏅",
        relatedId: badgeId,
      },
    });

    return NextResponse.json(award, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
