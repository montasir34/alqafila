"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { StateSelect } from "@/components/ui/StateSelect";
import { CitySelect } from "@/components/ui/CitySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { createFoundItemSchema } from "@/lib/validations/lost";

type FE = Record<string, string>;

export function FoundItemForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FE>({});
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({
    isCar: false, title: "", description: "", imageUrl: "",
    plateNumber: "", chassisNumber: "", foundAt: "", state: "", city: "",
  });

  function set(k: string, v: unknown) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({}); setServerError("");
    const parsed = createFoundItemSchema.safeParse(form);
    if (!parsed.success) {
      const errs: FE = {};
      parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? "حدث خطأ"); return; }
      router.push(`/found/${data.id}`);
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* نوع المعثور عليه */}
      <label className="flex items-center gap-3 cursor-pointer select-none rounded-xl border border-border p-3 hover:bg-surface-alt transition-colors">
        <input type="checkbox" checked={form.isCar}
          onChange={e => set("isCar", e.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary" />
        <div>
          <span className="text-sm font-medium">سيارة (لوحة معروفة)</span>
          <p className="text-xs text-muted-fg">فعّل إذا كانت سيارة وعندك رقم اللوحة</p>
        </div>
      </label>

      <div>
        <Label htmlFor="title" required>وصف مختصر</Label>
        <Input id="title"
          placeholder={form.isCar ? "مثال: تويوتا هايلاكس بيضاء" : "مثال: حقيبة جلدية بنية"}
          value={form.title} onChange={e => set("title", e.target.value)} error={fieldErrors.title} />
      </div>

      {form.isCar && (
        <div>
          <Label htmlFor="plateNumber">رقم اللوحة</Label>
          <Input id="plateNumber" placeholder="أ ب ج 1234"
            value={form.plateNumber as string} onChange={e => set("plateNumber", e.target.value)} />
        </div>
      )}

      <div>
        <Label htmlFor="description" required>التفاصيل</Label>
        <textarea id="description" rows={3}
          placeholder="صف الشيء بدقة — اللون، الحجم، المميزات..."
          value={form.description} onChange={e => set("description", e.target.value)}
          className={[
            "w-full rounded-xl border bg-surface px-4 py-3 text-sm resize-none",
            "placeholder:text-subtle-fg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors",
            fieldErrors.description ? "border-urgent" : "border-border",
          ].join(" ")} />
        {fieldErrors.description && <p className="text-xs text-urgent mt-1">{fieldErrors.description}</p>}
      </div>

      <div>
        <Label htmlFor="foundAt">مكان الإيجاد</Label>
        <Input id="foundAt" placeholder="مثال: أمام سوق أم درمان"
          value={form.foundAt as string} onChange={e => set("foundAt", e.target.value)} />
      </div>

      <ImageUpload
        label="صورة الشيء المعثور عليه"
        hint="صورة واضحة تساعد صاحبه على التعرف عليه — مطلوبة"
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
