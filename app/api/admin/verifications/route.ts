import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/verifications — طلبات توثيق المساهمين المعلّقة
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "أدمن فقط" }, { status: 403 });
  }

  const pending = await prisma.contributorProfile.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, status: true, idImageUrl: true,
      selfieUrl: true, createdAt: true,
      user: { select: { id: true, name: true, email: true, state: true, city: true } },
    },
  });

  return NextResponse.json({ pending });
}
