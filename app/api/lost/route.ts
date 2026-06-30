import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createLostItemSchema, createLostCarSchema } from "@/lib/validations/lost";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const kind = searchParams.get("kind") ?? "item"; // item | car
  const state = searchParams.get("state") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    status: "ACTIVE" as const,
    ...(state && { state }),
  };

  if (kind === "car") {
    const [items, total] = await Promise.all([
      prisma.lostCar.findMany({
        where, orderBy: { createdAt: "desc" }, skip, take: limit,
        select: {
          id: true, make: true, model: true, year: true, color: true,
          plateNumber: true, imageUrl: true, state: true, city: true,
          status: true, createdAt: true,
          reporter: { select: { name: true } },
        },
      }),
      prisma.lostCar.count({ where }),
    ]);
    return NextResponse.json({ items, total, page, limit, kind: "car" });
  }

  const [items, total] = await Promise.all([
    prisma.lostItem.findMany({
      where, orderBy: { createdAt: "desc" }, skip, take: limit,
      select: {
        id: true, title: true, description: true, imageUrl: true,
        lastSeenAt: true, state: true, city: true, status: true, createdAt: true,
        reporter: { select: { name: true } },
      },
    }),
    prisma.lostItem.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, limit, kind: "item" });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const body = await req.json() as { kind?: string } & Record<string, unknown>;
  const kind = body.kind ?? "item";

  if (kind === "car") {
    const parsed = createLostCarSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const car = await prisma.lostCar.create({
      data: { ...parsed.data, reporterId: session.user.id },
      select: { id: true },
    });
    return NextResponse.json({ id: car.id }, { status: 201 });
  }

  const parsed = createLostItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const item = await prisma.lostItem.create({
    data: { ...parsed.data, reporterId: session.user.id },
    select: { id: true },
  });
  return NextResponse.json({ id: item.id }, { status: 201 });
}
