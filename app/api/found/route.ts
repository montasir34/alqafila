import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createFoundItemSchema } from "@/lib/validations/lost";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const state = searchParams.get("state") ?? "";
  const isCar = searchParams.get("isCar") === "1";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    status: "ACTIVE" as const,
    isCar,
    ...(state && { state }),
  };

  const [items, total] = await Promise.all([
    prisma.foundItem.findMany({
      where, orderBy: { createdAt: "desc" }, skip, take: limit,
      select: {
        id: true, isCar: true, title: true, description: true, imageUrl: true,
        plateNumber: true, foundAt: true, state: true, city: true,
        status: true, createdAt: true,
        finder: { select: { name: true } },
      },
    }),
    prisma.foundItem.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createFoundItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const item = await prisma.foundItem.create({
    data: { ...parsed.data, finderId: session.user.id },
    select: { id: true },
  });
  return NextResponse.json({ id: item.id }, { status: 201 });
}
