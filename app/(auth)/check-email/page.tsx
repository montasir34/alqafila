import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface Props {
  searchParams: Promise<{ applied?: string; resend?: string }>;
}

export default async function CheckEmailPage({ searchParams }: Props) {
  const { applied, resend } = await searchParams;
  const fromLogin = resend === "1";

  return (
    <div className="w-full max-w-md px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">القافلة</h1>
      </div>

      <Card>
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <span className="text-6xl">📬</span>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {fromLogin ? "حسابك غير مفعّل بعد" : "راجع بريدك الإلكتروني"}
            </h2>
            <p className="text-sm text-muted-fg leading-relaxed">
              {fromLogin
                ? "أرسلنا لك رابط تفعيل الحساب عند التسجيل. انقر عليه لتأكيد بريدك ثم سجّل دخولك."
                : "أرسلنا لك رابط تفعيل الحساب. انقر عليه لتأكيد بريدك والدخول للمنصة."}
            </p>
            {applied === "1" && (
              <p className="text-xs text-primary mt-3 bg-primary-soft rounded-lg px-3 py-2">
                طلب التوثيق كمساهم أُرسل تلقائياً — سيراجعه الفريق بعد تفعيل حسابك
              </p>
            )}
          </div>

          <p className="text-xs text-subtle-fg">
            لم يصلك الإيميل؟ راجع Spam أو{" "}
            <Link href="/resend-verification" className="text-primary hover:underline">
              اطلب إعادة الإرسال
            </Link>
          </p>

          <Link href="/login" className="text-sm text-muted-fg hover:text-primary transition-colors">
            ← العودة لتسجيل الدخول
          </Link>
        </div>
      </Card>
    </div>
  );
}
