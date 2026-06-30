import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NotificationsClient } from "@/components/profile/NotificationsClient";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <NotificationsClient />;
}
