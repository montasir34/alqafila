import { LoginForm } from "@/components/layout/LoginForm";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ registered?: string; applied?: string; verified?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const registered = params.registered === "1";
  const applied = params.applied === "1";
  const verified = params.verified === "1";

  return (
    <div className="w-full max-w-md px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">القافلة</h1>
        <p className="mt-2 text-muted-fg text-sm">
          منصة إغاثة السودانيين
        </p>
      </div>

      {verified && (
        <div className="mb-4 rounded-xl bg-success-soft border border-success/20 px-4 py-3 text-sm text-success text-center">
          ✅ تم تفعيل حسابك — سجّل دخولك الآن
        </div>
      )}

      {registered && !verified && (
        <div className="mb-4 rounded-xl bg-primary-soft border border-primary/20 px-4 py-3 text-sm text-primary text-center">
          <p className="font-semibold mb-1">
            {applied ? "🎉 تم إنشاء حسابك وإرسال طلب التوثيق" : "🎉 تم إنشاء حسابك"}
          </p>
          <p className="text-xs text-muted-fg">
            راجع بريدك الإلكتروني وانقر رابط التحقق لتفعيل الحساب
          </p>
        </div>
      )}

      <Card>
        <h2 className="text-xl font-semibold mb-6 text-center">تسجيل الدخول</h2>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-muted-fg">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            سجّل الآن
          </Link>
        </p>
      </Card>
    </div>
  );
}
