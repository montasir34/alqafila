import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminVerificationsClient } from "@/components/admin/AdminVerificationsClient";

export default async function AdminVerificationsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  return <AdminVerificationsClient />;
}
