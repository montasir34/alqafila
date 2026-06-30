import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { FoundItemForm } from "@/components/lost/FoundItemForm";

export default async function NewFoundPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/found/new");
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">الإبلاغ عن معثور عليه</h1>
      <Card><FoundItemForm /></Card>
    </div>
  );
}
