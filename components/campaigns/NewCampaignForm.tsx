"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { createCampaignSchema } from "@/lib/validations/campaign";

type FE = Record<string, string>;

export function NewCampaignForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FE>({});
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", goalAmount: "" });

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({}); setServerError("");
    const parsed = createCampaignSchema.safeParse({ ...form, goalAmount: parseInt(form.goalAmount, 10) || 0 });
    if (!parsed.success) {
      const errs: FE = {};
      parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? "حدث خطأ"); return; }
      router.push(`/campaigns/${data.id}`);
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div><Label htmlFor="title" required>عنوان الحملة</Label>
        <Input id="title" placeholder="مثال: حملة دعم نازحي الخرطوم" value={form.title} onChange={e => set("title", e.target.value)} error={fieldErrors.title} /></div>
      <div><Label htmlFor="description" required>تفاصيل الحملة</Label>
        <textarea id="description" rows={5} placeholder="اشرح هدف الحملة وكيف سيُصرف المال..." value={form.description} onChange={e => set("description", e.target.value)}
          className={`w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-700 ${fieldErrors.description ? "border-red-500" : "border-border"}`} />
        {fieldErrors.description && <p className="text-xs text-red-500 mt-1">{fieldErrors.description}</p>}</div>
      <div><Label htmlFor="goalAmount" required>الهدف المالي (جنيه)</Label>
        <Input id="goalAmount" type="number" min={10000} placeholder="500000" value={form.goalAmount} onChange={e => set("goalAmount", e.target.value)} error={fieldErrors.goalAmount} /></div>
      {serverError && <p className="text-sm text-red-500">{serverError}</p>}
      <Button type="submit" loading={loading} className="w-full">فتح الحملة</Button>
    </form>
  );
}
