"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { StateSelect } from "@/components/ui/StateSelect";
import { CitySelect } from "@/components/ui/CitySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { createLostItemSchema } from "@/lib/validations/lost";

type FE = Record<string, string>;

export function LostItemForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FE>({});
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", imageUrl: "", lastSeenAt: "", state: "", city: "",
  });

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({}); setServerError("");
    const parsed = createLostItemSchema.safeParse(form);
    if (!parsed.success) {
      const errs: FE = {};
      parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, kind: "item" }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? "حدث خطأ"); return; }
      router.push(`/lost/${data.id}?kind=item`);
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      <div>
        <Label htmlFor="title" required>اسم الشيء المفقود</Label>
        <Input id="title" placeholder="مثال: حقيبة جلدية بنية"
          value={form.title} onChange={e => set("title", e.target.value)} error={fieldErrors.title} />
      </div>

      <div>
        <Label htmlFor="description" required>التفاصيل والمميزات</Label>
        <textarea id="description" rows={3}
          placeholder="صف الشكل والمميزات بدقة — اللون، الحجم، أي علامات مميزة"
          value={form.description} onChange={e => set("description", e.target.value)}
          className={[
            "w-full rounded-xl border bg-surface px-4 py-3 text-sm resize-none",
            "placeholder:text-subtle-fg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors",
            fieldErrors.description ? "border-urgent" : "border-border",
          ].join(" ")} />
        {fieldErrors.description && <p className="text-xs text-urgent mt-1">{fieldErrors.description}</p>}
      </div>

      <div>
        <Label htmlFor="lastSeenAt">آخر مكان شوهد فيه</Label>
        <Input id="lastSeenAt" placeholder="مثال: سوق أم درمان، بالقرب من المدخل الرئيسي"
          value={form.lastSeenAt} onChange={e => set("lastSeenAt", e.target.value)} />
      </div>

      <ImageUpload
        label="صورة الشيء المفقود"
        hint="صورة واضحة تساعد على التعرف عليه — مطلوبة للبلاغ"
        folder="items"
        value={form.imageUrl}
        onChange={v => set("imageUrl", v)}
        required
        error={fieldErrors.imageUrl}
        aspectRatio="wide"
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="state" required>الولاية</Label>
          <StateSelect id="state" value={form.state}
            onChange={e => { set("state", e.target.value); set("city", ""); }} error={fieldErrors.state} />
        </div>
        <div>
          <Label htmlFor="city" required>المدينة</Label>
          <CitySelect id="city" stateName={form.state} value={form.city}
            onChange={e => set("city", e.target.value)} error={fieldErrors.city} />
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-urgent bg-urgent-soft rounded-xl px-4 py-3">{serverError}</p>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        نشر الإبلاغ
      </Button>
    </form>
  );
}
