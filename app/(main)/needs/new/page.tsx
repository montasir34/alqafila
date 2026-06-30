import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NewNeedForm } from "@/components/needs/NewNeedForm";
import { Card } from "@/components/ui/Card";

export default async function NewNeedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/needs/new");

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">انشر حوجتك</h1>

      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-sm text-amber-800 dark:text-amber-200">
        <p className="font-semibold mb-1">تنبيه مهم</p>
        <p>
          المنصة لا تضمن الأموال ولا تتحمل مسؤولية التحويل. دورها التنسيق
          والتوثيق فقط. أضف طرق دفعك الصحيحة حتى يتمكن الداعمون من التواصل معك.
        </p>
      </div>

      <Card>
        <NewNeedForm />
      </Card>
    </div>
  );
}
