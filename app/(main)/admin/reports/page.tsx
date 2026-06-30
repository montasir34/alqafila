import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminReportsClient } from "@/components/admin/AdminReportsClient";

export default async function AdminReportsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");
  return <AdminReportsClient />;
}
