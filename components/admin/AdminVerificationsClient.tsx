"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";

type Verification = {
  id: string;
  status: string;
  idImageUrl: string | null;
  selfieUrl: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string; state: string; city: string };
};

export function AdminVerificationsClient() {
  const qc = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ pending: Verification[] }>({
    queryKey: ["admin-verifications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/verifications");
      return res.json();
    },
    refetchInterval: 15000,
  });

  async function handleAction(id: string, action: "approve" | "reject") {
    setLoading(id + action);
    await fetch(`/api/admin/verifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    qc.invalidateQueries({ queryKey: ["admin-verifications"] });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (!data?.pending?.length) {
    return (
      <div className="text-center py-16 text-muted-fg">
        <p className="text-4xl mb-3">✅</p>
        <p>لا توجد طلبات توثيق معلّقة</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">طلبات التوثيق ({data.pending.length})</h1>
      {data.pending.map(v => (
        <div key={v.id} className="rounded-xl border border-border p-5 flex flex-col gap-4">
          <div>
            <p className="font-semibold text-lg">{v.user.name ?? "مجهول"}</p>
            <p className="text-sm text-muted-fg">{v.user.email}</p>
            <p className="text-sm text-muted-fg">{v.user.state} / {v.user.city}</p>
            <p className="text-xs text-muted-fg mt-1">تقدّم في {new Date(v.createdAt).toLocaleDateString("ar-SD")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {v.idImageUrl && (
              <div>
                <p className="text-xs text-muted-fg mb-1">صورة الهوية</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.idImageUrl} alt="هوية" className="w-full h-36 object-cover rounded-lg border border-border" />
              </div>
            )}
            {v.selfieUrl && (
              <div>
                <p className="text-xs text-muted-fg mb-1">صورة شخصية</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.selfieUrl} alt="سيلفي" className="w-full h-36 object-cover rounded-lg border border-border" />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={() => handleAction(v.id, "approve")} loading={loading === v.id + "approve"} className="flex-1">
              ✅ قبول وترقية
            </Button>
            <Button variant="danger" onClick={() => handleAction(v.id, "reject")} loading={loading === v.id + "reject"} className="flex-1">
              ❌ رفض
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
