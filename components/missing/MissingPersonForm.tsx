"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { StateSelect } from "@/components/ui/StateSelect";
import { CitySelect } from "@/components/ui/CitySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { createMissingPersonSchema } from "@/lib/validations/lost";

type FE = Record<string, string>;

export function MissingPersonForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FE>({});
  const [serverError, setServerError] = useState("");
  const [form, setForm] = useState({
    name: "", age: "", gender: "", description: "", photoUrl: "",
    lastSeenAt: "", lastSeenDate: "", state: "", city: "",
  });

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({}); setServerError("");
    const parsed = createMissingPersonSchema.safeParse({
      ...form,
      age: form.age ? parseInt(form.age) : undefined,
      gender: form.gender || undefined,
    });
    if (!parsed.success) {
      const errs: FE = {};
      parsed.error.issues.forEach(i => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/missing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error ?? "حدث خطأ"); return; }
      router.push(`/missing/${data.id}`);
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* تنبيه الخصوصية */}
      <div className="rounded-xl bg-primary-soft border border-primary/20 px-4 py-3 text-sm text-primary">
        🔒 التواصل مع ذوي المفقود يتم عبر المنصة فقط — لا تُنشر أرقام هواتف أو مواقع دقيقة
      </div>

      <div>
        <Label htmlFor="name" required>الاسم الكامل</Label>
        <Input id="name" placeholder="محمد أحمد علي"
          value={form.name} onChange={e => set("name", e.target.value)} error={fieldErrors.name} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="age">العمر التقريبي</Label>
          <Input id="age" type="number" min={1} max={120} placeholder="35"
            value={form.age} onChange={e => set("age", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="gender">الجنس</Label>
          <Select id="gender" value={form.gender}
            onChange={e => set("gender", e.target.value)} placeholder="اختر">
            <option value="ذكر">ذكر</option>
            <option value="أنثى">أنثى</option>
            <option value="غير محدد">غير محدد</option>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description" required>الوصف الجسدي والملابس</Label>
        <textarea id="description" rows={4}
          placeholder="طويل القامة، يرتدي جلباب أبيض، بشرة فاتحة... لا تضع أرقام هواتف أو مواقع دقيقة هنا"
          value={form.description} onChange={e => set("description", e.target.value)}
          className={[
            "w-full rounded-xl border bg-surface px-4 py-3 text-sm resize-none",
            "placeholder:text-subtle-fg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors",
            fieldErrors.description ? "border-urgent" : "border-border",
          ].join(" ")} />
        {fieldErrors.description && <p className="text-xs text-urgent mt-1">{fieldErrors.description}</p>}
      </div>

      {/* صورة المفقود — مهمة جداً للتعرف */}
      <ImageUpload
        label="صورة المفقود"
        hint="صورة واضحة للوجه — مطلوبة وتساعد كثيراً في التعرف"
        folder="missing"
        value={form.photoUrl}
        onChange={v => set("photoUrl", v)}
        required
        error={fieldErrors.photoUrl}
        aspectRatio="square"
      />

      <div>
        <Label htmlFor="lastSeenAt">آخر مكان شوهد فيه (عام)</Label>
        <Input id="lastSeenAt" placeholder="مثال: منطقة الخرطوم بحري — لا تذكر عنواناً دقيقاً"
          value={form.lastSeenAt} onChange={e => set("lastSeenAt", e.target.value)} />
      </div>

      <div>
        <Label htmlFor="lastSeenDate">تاريخ آخر ظهور</Label>
        <Input id="lastSeenDate" type="date"
          value={form.lastSeenDate} onChange={e => set("lastSeenDate", e.target.value)} />
      </div>

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
        نشر بلاغ المفقود
      </Button>
    </form>
  );
}
