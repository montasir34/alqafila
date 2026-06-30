import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/email";

const registerWithDocsSchema = registerSchema.and(
  z.object({
    idImageUrl: z.string().min(1).optional(),
    selfieUrl: z.string().min(1).optional(),
  })
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerWithDocsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, state, city, idImageUrl, selfieUrl } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجّل مسبقاً" },
        { status: 409 }
      );
    }

    // حذف بيانات يتيمة بنفس الإيميل من تجارب سابقة
    await prisma.account.deleteMany({
      where: { provider: "credentials", providerAccountId: email },
    });
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    const hashed = await bcrypt.hash(password, 12);
    const hasDocs = !!(idImageUrl && selfieUrl);
    const verifyToken = randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name,
          email,
          state,
          city,
          accounts: {
            create: {
              type: "credentials",
              provider: "credentials",
              providerAccountId: email,
              access_token: hashed,
            },
          },
        },
        select: { id: true, email: true, name: true },
      });

      if (hasDocs) {
        await tx.contributorProfile.create({
          data: {
            userId: created.id,
            idImageUrl: idImageUrl!,
            selfieUrl: selfieUrl!,
          },
        });
      }

      await tx.verificationToken.create({
        data: {
          identifier: email,
          token: verifyToken,
          expires: tokenExpiry,
        },
      });

      return created;
    });

    // إرسال إيميل التحقق (بعد الـ transaction عشان ما يعطّل)
    try {
      console.log("[register] sending verification email to:", email);
      console.log("[register] RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);
      console.log("[register] AUTH_URL:", process.env.AUTH_URL);
      await sendVerificationEmail(email, verifyToken);
      console.log("[register] email sent successfully");
    } catch (emailErr) {
      console.error("[register] failed to send verification email:", emailErr);
    }

    return NextResponse.json({ user, appliedForVerification: hasDocs }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ، يرجى المحاولة مرة أخرى" },
      { status: 500 }
    );
  }
}
