import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { NewCampaignForm } from "@/components/campaigns/NewCampaignForm";

export default async function NewCampaignPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CONTRIBUTOR" && session.user.role !== "ADMIN") {
    redirect("/register/contributor");
  }
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">فتح حملة جديدة</h1>
      <Card><NewCampaignForm /></Card>
    </div>
  );
}
