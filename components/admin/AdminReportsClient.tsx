"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";

type Report = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { name: string | null; email: string };
};

const TARGET_LABELS: Record<string, string> = {
  NEED: "حوجة", LOST_ITEM: "مفقود", LOST_CAR: "سيارة مفقودة",
  FOUND_ITEM: "معثور عليه", MISSING_PERSON: "مفقود بشري",
  CAMPAIGN: "حملة", USER: "مستخدم",
};

export function AdminReportsClient() {
  const qc = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ reports: Report[] }>({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reports");
      return res.json();
    },
    refetchInterval: 15000,
  });

  async function handleAction(id: string, action: "reviewed" | "actioned" | "dismissed") {
    setLoading(id + action);
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    qc.invalidateQueries({ queryKey: ["admin-reports"] });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (!data?.reports?.length) {
    return (
      <div className="text-center py-16 text-muted-fg">
        <p className="text-4xl mb-3">🏳️</p>
        <p>لا توجد بلاغات معلّقة</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">البلاغات المعلّقة ({data.reports.length})</h1>
      {data.reports.map(r => (
        <div key={r.id} className="rounded-xl border border-border p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                {TARGET_LABELS[r.targetType] ?? r.targetType}
              </span>
              <p className="text-xs text-muted-fg mt-1">معرّف الهدف: {r.targetId}</p>
            </div>
            <p className="text-xs text-muted-fg">{new Date(r.createdAt).toLocaleDateString("ar-SD")}</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="text-muted-fg text-xs mb-1">سبب البلاغ:</p>
            <p>{r.reason}</p>
          </div>
          <p className="text-xs text-muted-fg">
            بلّغ: {r.reporter.name ?? "مجهول"} ({r.reporter.email})
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => handleAction(r.id, "actioned")} loading={loading === r.id + "actioned"}>
              ✅ تم الإجراء
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleAction(r.id, "reviewed")} loading={loading === r.id + "reviewed"}>
              👁 تمت المراجعة
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleAction(r.id, "dismissed")} loading={loading === r.id + "dismissed"}>
              ✗ رفض
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
