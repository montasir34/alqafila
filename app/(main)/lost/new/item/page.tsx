import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { LostItemForm } from "@/components/lost/LostItemForm";

export default async function NewLostItemPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/lost/new/item");

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">الإبلاغ عن مفقود</h1>
      <Card><LostItemForm /></Card>
    </div>
  );
}
