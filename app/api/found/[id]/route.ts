import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.foundItem.findUnique({
    where: { id },
    include: { finder: { select: { id: true, name: true } } },
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
  const { status } = await req.json() as { status: string };

  if (!["RESOLVED", "CLOSED"].includes(status)) {
    return NextResponse.json({ error: "حالة غير مسموح بها" }, { status: 400 });
  }

  const item = await prisma.foundItem.findUnique({ where: { id }, select: { finderId: true } });
  if (!item || (item.finderId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
  }

  const updated = await prisma.foundItem.update({
    where: { id },
    data: { status: status as "RESOLVED" | "CLOSED" },
    select: { id: true, status: true },
  });
  return NextResponse.json(updated);
}
