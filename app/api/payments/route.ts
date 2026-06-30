import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentSchema } from "@/lib/validations/need";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { needId, campaignId, amount, method, proofImageUrl } = parsed.data;

    // يجب أن يكون needId أو campaignId — وليس كليهما
    if ((needId && campaignId) || (!needId && !campaignId)) {
      return NextResponse.json(
        { error: "يجب تحديد حوجة أو حملة فقط" },
        { status: 400 }
      );
    }

    // التحقق من وجود الحوجة وأنها مفتوحة
    if (needId) {
      const need = await prisma.need.findUnique({
        where: { id: needId },
        select: { status: true },
      });
      if (!need || need.status !== "OPEN") {
        return NextResponse.json(
          { error: "الحوجة غير متاحة" },
          { status: 400 }
        );
      }
    }

    const payment = await prisma.payment.create({
      data: {
        supporterId: session.user.id,
        needId,
        campaignId,
        amount,
        method,
        proofImageUrl,
        status: "PENDING",
      },
      select: { id: true, status: true },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
