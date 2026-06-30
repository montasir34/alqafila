import { RegisterForm } from "@/components/layout/RegisterForm";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-amber-700">القافلة</h1>
        <p className="mt-2 text-muted-fg text-sm">
          منصة إغاثة السودانيين
        </p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-6 text-center">إنشاء حساب جديد</h2>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-muted-fg">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-amber-700 font-medium hover:underline">
            سجّل دخولك
          </Link>
        </p>
      </Card>
    </div>
  );
}
