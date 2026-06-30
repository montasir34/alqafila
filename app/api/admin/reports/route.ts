import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/reports — البلاغات المعلّقة
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "أدمن فقط" }, { status: 403 });
  }

  const reports = await prisma.report.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: {
      id: true, targetType: true, targetId: true,
      reason: true, status: true, createdAt: true,
      reporter: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ reports });
}
