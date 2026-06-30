"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { StateSelect } from "@/components/ui/StateSelect";
import { CitySelect } from "@/components/ui/CitySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { createLostCarSchema } from "@/lib/validations/lost";

type FE = Record<string, string>;

export function LostCarForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FE>({});
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({
    make: "", model: "", year: "", color: "", plateNumber: "",
    chassisNumber: "", description: "", imageUrl: "", state: "", city: "",
  });

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({}); setServerError("");
    const parsed = createLostCarSchema.safeParse({
      ...form,
      year: form.year ? parseInt(form.year) : undefined,
    });
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
        body: JSON.stringify({ ...parsed.data, kind: "car" }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? "حدث خطأ"); return; }
      router.push(`/lost/${data.id}?kind=car`);
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="make" required>نوع السيارة</Label>
          <Input id="make" placeholder="تويوتا" value={form.make}
            onChange={e => set("make", e.target.value)} error={fieldErrors.make} />
        </div>
        <div>
          <Label htmlFor="model" required>الموديل</Label>
          <Input id="model" placeholder="كامري" value={form.model}
            onChange={e => set("model", e.target.value)} error={fieldErrors.model} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="color" required>اللون</Label>
          <Input id="color" placeholder="أبيض" value={form.color}
            onChange={e => set("color", e.target.value)} error={fieldErrors.color} />
        </div>
        <div>
          <Label htmlFor="year">سنة الصنع</Label>
          <Input id="year" type="number" placeholder="2020" value={form.year}
            onChange={e => set("year", e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="plateNumber" required>رقم اللوحة</Label>
        <Input id="plateNumber" placeholder="أ ب ج 1234" value={form.plateNumber}
          onChange={e => set("plateNumber", e.target.value)} error={fieldErrors.plateNumber} />
      </div>

      <div>
        <Label htmlFor="chassisNumber">رقم الشاسيه (اختياري)</Label>
        <Input id="chassisNumber" placeholder="مثال: JT2AE09W5J0123456"
          value={form.chassisNumber} onChange={e => set("chassisNumber", e.target.value)} />
      </div>

      <div>
        <Label htmlFor="description">ملاحظات إضافية</Label>
        <textarea id="description" rows={2}
          placeholder="أي تفاصيل مميزة — ملصقات، خدوش، تعديلات..."
          value={form.description} onChange={e => set("description", e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm resize-none placeholder:text-subtle-fg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors" />
      </div>

      <ImageUpload
        label="صورة السيارة"
        hint="صورة واضحة للسيارة تساعد على التعرف عليها — مطلوبة"
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
