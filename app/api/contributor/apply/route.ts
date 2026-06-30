import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { contributorSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = contributorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.contributorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json(
        { error: "طلبك قيد المراجعة بالفعل" },
        { status: 409 }
      );
    }

    const profile = await prisma.contributorProfile.create({
      data: {
        userId: session.user.id,
        idImageUrl: parsed.data.idImageUrl,
        selfieUrl: parsed.data.selfieUrl,
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ، يرجى المحاولة مرة أخرى" },
      { status: 500 }
    );
  }
}
