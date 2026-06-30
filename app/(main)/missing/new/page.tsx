import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { MissingPersonForm } from "@/components/missing/MissingPersonForm";

export default async function NewMissingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/missing/new");

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">الإبلاغ عن شخص مفقود</h1>
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-5 text-sm text-amber-800 dark:text-amber-200">
        <p className="font-semibold mb-1">تنبيه</p>
        <p>لا تضع أرقام هواتف أو عناوين دقيقة في الوصف. التواصل يتم عبر المنصة فقط.</p>
      </div>
      <Card><MissingPersonForm /></Card>
    </div>
  );
}
