import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createMissingPersonSchema } from "@/lib/validations/lost";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const state = searchParams.get("state") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    status: "ACTIVE" as const,
    ...(state && { state }),
  };

  const [persons, total] = await Promise.all([
    prisma.missingPerson.findMany({
      where, orderBy: { createdAt: "desc" }, skip, take: limit,
      select: {
        id: true, name: true, age: true, gender: true, description: true,
        photoUrl: true, lastSeenAt: true, lastSeenDate: true,
        state: true, city: true, status: true, createdAt: true,
        // لا نكشف بيانات المُبلِّغ في القائمة العامة
      },
    }),
    prisma.missingPerson.count({ where }),
  ]);

  return NextResponse.json({ persons, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createMissingPersonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { lastSeenDate, ...rest } = parsed.data;

  const person = await prisma.missingPerson.create({
    data: {
      ...rest,
      lastSeenDate: lastSeenDate ? new Date(lastSeenDate) : undefined,
      reporterId: session.user.id,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: person.id }, { status: 201 });
}
