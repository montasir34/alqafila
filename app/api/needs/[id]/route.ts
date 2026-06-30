import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const need = await prisma.need.findUnique({
    where: { id },
    include: {
      poster: { select: { id: true, name: true, image: true } },
      _count: { select: { votes: true, payments: true } },
      payments: {
        where: { status: "CONFIRMED" },
        orderBy: { confirmedAt: "desc" },
        take: 10,
        select: {
          id: true,
          amount: true,
          method: true,
          confirmedAt: true,
          supporter: { select: { name: true, image: true } },
        },
      },
    },
  });

  if (!need) {
    return NextResponse.json({ error: "الحوجة غير موجودة" }, { status: 404 });
  }

  return NextResponse.json({
    ...need,
    poster: need.isAnonymous ? null : need.poster,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { id } = await params;
  const need = await prisma.need.findUnique({
    where: { id },
    select: { posterId: true, status: true },
  });

  if (!need) {
    return NextResponse.json({ error: "الحوجة غير موجودة" }, { status: 404 });
  }

  const isOwner = need.posterId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
  }

  const { status } = await req.json() as { status: string };
  const allowed = ["FULFILLED", "CLOSED"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "حالة غير مسموح بها" }, { status: 400 });
  }

  const updated = await prisma.need.update({
    where: { id },
    data: { status: status as "FULFILLED" | "CLOSED" },
    select: { id: true, status: true },
  });

  return NextResponse.json(updated);
}
