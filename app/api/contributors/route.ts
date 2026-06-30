import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/contributors — قائمة المساهمين الموثّقين للوحة المتصدّرين
export async function GET(_req: NextRequest) {
  const contributors = await prisma.user.findMany({
    where: { role: { in: ["CONTRIBUTOR", "ADMIN"] } },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: {
      id: true,
      name: true,
      image: true,
      state: true,
      badges: {
        take: 3,
        orderBy: { awardedAt: "desc" },
        select: {
          badge: { select: { name: true, iconUrl: true } },
        },
      },
      _count: {
        select: {
          payments: true,
          campaigns: true,
          votes: true,
        },
      },
    },
  });

  // ترتيب حسب عدد الدفعات (الأكثر دعماً أولاً)
  const sorted = contributors.sort((a, b) => b._count.payments - a._count.payments);

  return NextResponse.json({ contributors: sorted });
}
