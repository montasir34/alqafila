import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <Result success={false} message="رابط التحقق غير صحيح." />;
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record) {
    return <Result success={false} message="الرابط غير صحيح أو تم استخدامه مسبقاً." />;
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return <Result success={false} message="انتهت صلاحية الرابط. اطلب إعادة إرسال رسالة التحقق." expired />;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  redirect("/login?verified=1");
}

function Result({
  success,
  message,
  expired = false,
}: {
  success: boolean;
  message: string;
  expired?: boolean;
}) {
  return (
    <div className="w-full max-w-md px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">القافلة</h1>
      </div>
      <Card>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="text-5xl">{success ? "✅" : "❌"}</span>
          <p className="text-sm text-muted-fg leading-relaxed">{message}</p>
          {expired ? (
            <Link href="/resend-verification" className="text-primary text-sm font-medium hover:underline">
              إعادة إرسال رسالة التحقق
            </Link>
          ) : (
            <Link href="/login" className="text-primary text-sm font-medium hover:underline">
              تسجيل الدخول
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
