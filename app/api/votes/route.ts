import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  // التصويت للمساهمين الموثّقين فقط
  if (session.user.role !== "CONTRIBUTOR" && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "التصويت للمساهمين الموثّقين فقط" },
      { status: 403 }
    );
  }

  const { needId } = await req.json() as { needId: string };
  if (!needId) {
    return NextResponse.json({ error: "needId مطلوب" }, { status: 400 });
  }

  const need = await prisma.need.findUnique({
    where: { id: needId },
    select: { status: true, posterId: true },
  });

  if (!need || need.status !== "OPEN") {
    return NextResponse.json({ error: "الحوجة غير متاحة" }, { status: 400 });
  }

  if (need.posterId === session.user.id) {
    return NextResponse.json(
      { error: "لا يمكنك التصويت على حوجتك" },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: { needId, voterId: session.user.id },
      });
      // عند الوصول لـ 3 أصوات تصبح الحوجة عاجلة
      const count = await tx.vote.count({ where: { needId } });
      if (count >= 3) {
        await tx.need.update({ where: { id: needId }, data: { isUrgent: true } });
      }
    });

    const votes = await prisma.vote.count({ where: { needId } });
    return NextResponse.json({ votes, voted: true });
  } catch {
    // @@unique يمنع التصويت المزدوج — نعيد الحالة الحالية
    const votes = await prisma.vote.count({ where: { needId } });
    return NextResponse.json({ votes, voted: true, alreadyVoted: true });
  }
}
