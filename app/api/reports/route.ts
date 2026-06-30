import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createReportSchema = z.object({
  targetType: z.enum(["NEED", "LOST_ITEM", "LOST_CAR", "FOUND_ITEM", "MISSING_PERSON", "CAMPAIGN", "USER"]),
  targetId: z.string().min(1),
  reason: z.string().min(5, "أذكر سبب البلاغ"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        ...parsed.data,
        status: "PENDING",
      },
      select: { id: true },
    });

    return NextResponse.json(report, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
