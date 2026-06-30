import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/verifications/[id] — قبول/رفض طلب توثيق
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "أدمن فقط" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json() as { action: "approve" | "reject" };

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "إجراء غير صحيح" }, { status: 400 });
  }

  const profile = await prisma.contributorProfile.findUnique({
    where: { id },
    select: { userId: true, status: true },
  });

  if (!profile || profile.status !== "PENDING") {
    return NextResponse.json({ error: "غير موجود أو تمت مراجعته" }, { status: 404 });
  }

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

  await prisma.$transaction([
    prisma.contributorProfile.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        // حذف صورة الهوية بعد المراجعة (privacy by design)
        idImageUrl: action === "approve" ? undefined : null,
        idImageDeletedAt: action === "approve" ? new Date() : undefined,
      },
    }),
    // ترقية المستخدم لـ CONTRIBUTOR عند القبول
    ...(action === "approve"
      ? [prisma.user.update({ where: { id: profile.userId }, data: { role: "CONTRIBUTOR" } })]
      : []),
    prisma.notification.create({
      data: {
        userId: profile.userId,
        type: "VERIFY_RESULT",
        message: action === "approve"
          ? "تهانينا! تم قبول طلب توثيقك كمساهم ✅"
          : "عذراً، لم يتم قبول طلب توثيقك. يمكنك التقديم مجدداً.",
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
