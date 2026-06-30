import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createMessageSchema } from "@/lib/validations/lost";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const targetId = searchParams.get("targetId");

  const messages = await prisma.contactMessage.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ],
      ...(targetId && { targetId }),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, body: true, read: true, createdAt: true, targetType: true, targetId: true,
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true } },
    },
  });

  // تحديد الرسائل المستلمة كمقروءة
  await prisma.contactMessage.updateMany({
    where: { receiverId: session.user.id, read: false, ...(targetId && { targetId }) },
    data: { read: true },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  if (parsed.data.receiverId === session.user.id) {
    return NextResponse.json({ error: "لا يمكن إرسال رسالة لنفسك" }, { status: 400 });
  }

  const message = await prisma.contactMessage.create({
    data: { ...parsed.data, senderId: session.user.id },
    select: { id: true },
  });

  return NextResponse.json({ id: message.id }, { status: 201 });
}
