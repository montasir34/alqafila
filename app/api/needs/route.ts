import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNeedSchema, needFiltersSchema } from "@/lib/validations/need";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const filters = needFiltersSchema.safeParse(
    Object.fromEntries(searchParams)
  );
  if (!filters.success) {
    return NextResponse.json({ error: "فلاتر غير صحيحة" }, { status: 400 });
  }

  const { state, type, urgent, page, limit } = filters.data;
  const skip = (page - 1) * limit;

  const where = {
    status: "OPEN" as const,
    ...(state && { state }),
    ...(type && { type }),
    ...(urgent && { isUrgent: true }),
  };

  const [needs, total] = await Promise.all([
    prisma.need.findMany({
      where,
      orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        targetAmount: true,
        collectedAmount: true,
        paymentMethods: true,
        status: true,
        isAnonymous: true,
        isUrgent: true,
        state: true,
        city: true,
        createdAt: true,
        // إخفاء الناشر للمجهولين
        poster: {
          select: { id: true, name: true, image: true },
        },
        _count: { select: { votes: true, payments: true } },
      },
    }),
    prisma.need.count({ where }),
  ]);

  // إخفاء بيانات الناشر للمجهولين
  const sanitized = needs.map((n) => ({
    ...n,
    poster: n.isAnonymous ? null : n.poster,
  }));

  return NextResponse.json({ needs: sanitized, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createNeedSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const need = await prisma.need.create({
      data: {
        ...parsed.data,
        posterId: session.user.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: need.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
