import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ContributorApplyForm } from "@/components/layout/ContributorApplyForm";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default async function ContributorRegisterPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="w-full max-w-lg px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-amber-700">القافلة</h1>
        <p className="mt-2 text-muted-fg text-sm">توثيق المساهم</p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-2 text-center">طلب توثيق المساهم</h2>
        <p className="text-sm text-muted-fg text-center mb-6">
          مرحباً {session.user.name} — أرسل طلبك ليراجعه الفريق
        </p>
        <ContributorApplyForm />
        <p className="mt-4 text-center text-sm text-muted-fg">
          <Link href="/profile" className="text-amber-700 hover:underline">
            العودة للملف الشخصي
          </Link>
        </p>
      </Card>
    </div>
  );
}
