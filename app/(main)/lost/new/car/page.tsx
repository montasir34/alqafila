import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { LostCarForm } from "@/components/lost/LostCarForm";

export default async function NewLostCarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/lost/new/car");

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">الإبلاغ عن سيارة مفقودة</h1>
      <Card><LostCarForm /></Card>
    </div>
  );
}
