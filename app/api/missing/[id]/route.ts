import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const person = await prisma.missingPerson.findUnique({
    where: { id },
    select: {
      id: true, name: true, age: true, gender: true, description: true,
      photoUrl: true, lastSeenAt: true, lastSeenDate: true,
      state: true, city: true, status: true, createdAt: true,
      // نكشف reporterId فقط حتى يمكن إرسال رسالة — لكن لا نكشف بياناته الشخصية
      reporterId: true,
    },
  });
  if (!person) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json(person);
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

  const person = await prisma.missingPerson.findUnique({ where: { id }, select: { reporterId: true } });
  if (!person || (person.reporterId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
  }

  const updated = await prisma.missingPerson.update({
    where: { id },
    data: { status: status as "RESOLVED" | "CLOSED" },
    select: { id: true, status: true },
  });
  return NextResponse.json(updated);
}
