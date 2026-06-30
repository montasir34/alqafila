import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const kind = searchParams.get("kind") ?? "item";

  if (kind === "car") {
    const car = await prisma.lostCar.findUnique({
      where: { id },
      include: { reporter: { select: { id: true, name: true } } },
    });
    if (!car) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    return NextResponse.json(car);
  }

  const item = await prisma.lostItem.findUnique({
    where: { id },
    include: { reporter: { select: { id: true, name: true } } },
  });
  if (!item) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const { id } = await params;
  const { status, kind } = await req.json() as { status: string; kind: string };

  if (!["RESOLVED", "CLOSED"].includes(status)) {
    return NextResponse.json({ error: "حالة غير مسموح بها" }, { status: 400 });
  }

  if (kind === "car") {
    const car = await prisma.lostCar.findUnique({ where: { id }, select: { reporterId: true } });
    if (!car || (car.reporterId !== session.user.id && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
    }
    const updated = await prisma.lostCar.update({ where: { id }, data: { status: status as "RESOLVED" | "CLOSED" }, select: { id: true, status: true } });
    return NextResponse.json(updated);
  }

  const item = await prisma.lostItem.findUnique({ where: { id }, select: { reporterId: true } });
  if (!item || (item.reporterId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
  }
  const updated = await prisma.lostItem.update({ where: { id }, data: { status: status as "RESOLVED" | "CLOSED" }, select: { id: true, status: true } });
  return NextResponse.json(updated);
}
