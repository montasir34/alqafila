import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/reports/[id] — مراجعة بلاغ
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "أدمن فقط" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json() as { action: "reviewed" | "actioned" | "dismissed" };

  const statusMap = {
    reviewed: "REVIEWED",
    actioned: "ACTIONED",
    dismissed: "DISMISSED",
  } as const;

  if (!statusMap[action]) {
    return NextResponse.json({ error: "إجراء غير صحيح" }, { status: 400 });
  }

  await prisma.report.update({
    where: { id },
    data: { status: statusMap[action] },
  });

  return NextResponse.json({ ok: true });
}
