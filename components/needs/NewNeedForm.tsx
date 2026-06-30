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
import { createNeedSchema, PAYMENT_METHODS_LIST, PAYMENT_METHOD_LABELS } from "@/lib/validations/need";

type FieldErrors = Record<string, string>;

const NEED_TYPES = [
  { value: "MEDICINE",  label: "دواء" },
  { value: "FOOD",      label: "غذاء" },
  { value: "SHELTER",   label: "مأوى" },
  { value: "TRANSPORT", label: "مواصلات" },
  { value: "CASH",      label: "نقدي" },
  { value: "OTHER",     label: "أخرى" },
];

export function NewNeedForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState({
    type: "",
    title: "",
    description: "",
    targetAmount: "",
    paymentMethods: [] as string[],
    state: "",
    city: "",
    isAnonymous: false,
    imageUrl: "",
  });

  function setField(field: string, value: unknown) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function toggleMethod(method: string) {
    setForm((p) => ({
      ...p,
      paymentMethods: p.paymentMethods.includes(method)
        ? p.paymentMethods.filter((m) => m !== method)
        : [...p.paymentMethods, method],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setFieldErrors({});

    const data = {
      ...form,
      targetAmount: parseInt(form.targetAmount, 10) || 0,
    };

    const parsed = createNeedSchema.safeParse(data);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errors[String(i.path[0])] = i.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/needs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "حدث خطأ");
        return;
      }
      router.push(`/needs/${json.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* النوع */}
      <div>
        <Label htmlFor="type" required>نوع الحوجة</Label>
        <Select
          id="type"
          value={form.type}
          onChange={(e) => setField("type", e.target.value)}
          placeholder="اختر النوع"
          error={fieldErrors.type}
        >
          {NEED_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      </div>

      {/* العنوان */}
      <div>
        <Label htmlFor="title" required>عنوان الحوجة</Label>
        <Input
          id="title"
          placeholder="مثال: دواء ضغط لمريض مزمن في أم درمان"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          error={fieldErrors.title}
        />
      </div>

      {/* الوصف */}
      <div>
        <Label htmlFor="description" required>التفاصيل</Label>
        <textarea
          id="description"
          rows={4}
          placeholder="اشرح وضعك بالتفصيل — كلما كان الوصف واضحاً زادت فرصة الحصول على الدعم"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          className={[
            "w-full rounded-xl border bg-surface px-4 py-3 text-sm resize-none",
            "placeholder:text-subtle-fg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors",
            fieldErrors.description ? "border-urgent" : "border-border",
          ].join(" ")}
        />
        {fieldErrors.description && (
          <p className="text-xs text-urgent mt-1">{fieldErrors.description}</p>
        )}
      </div>

      {/* صورة توضيحية */}
      <ImageUpload
        label="صورة توضيحية"
        hint="صورة تساعد الداعمين على فهم الحوجة بشكل أوضح (اختياري)"
        folder="needs"
        value={form.imageUrl}
        onChange={(url) => setField("imageUrl", url)}
        aspectRatio="wide"
      />

      {/* المبلغ */}
      <div>
        <Label htmlFor="targetAmount" required>المبلغ المطلوب (جنيه سوداني)</Label>
        <Input
          id="targetAmount"
          type="number"
          min={1000}
          placeholder="مثال: 50000"
          value={form.targetAmount}
          onChange={(e) => setField("targetAmount", e.target.value)}
          error={fieldErrors.targetAmount}
        />
      </div>

      {/* طرق الدفع */}
      <div>
        <Label required>طرق الدفع المقبولة</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {PAYMENT_METHODS_LIST.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleMethod(m)}
              className={[
                "px-3 py-1.5 rounded-xl border text-sm font-medium transition-all duration-150",
                form.paymentMethods.includes(m)
                  ? "bg-primary text-primary-fg border-primary shadow-sm"
                  : "border-border hover:border-primary hover:text-primary",
              ].join(" ")}
            >
              {PAYMENT_METHOD_LABELS[m] ?? m}
            </button>
          ))}
        </div>
        {fieldErrors.paymentMethods && (
          <p className="text-xs text-urgent mt-1">{fieldErrors.paymentMethods}</p>
        )}
      </div>

      {/* الموقع */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="state" required>الولاية</Label>
          <StateSelect
            id="state"
            value={form.state}
            onChange={(e) => { setField("state", e.target.value); setField("city", ""); }}
            error={fieldErrors.state}
          />
        </div>
        <div>
          <Label htmlFor="city" required>المدينة</Label>
          <CitySelect
            id="city"
            stateName={form.state}
            value={form.city}
            onChange={(e) => setField("city", e.target.value)}
            error={fieldErrors.city}
          />
        </div>
      </div>

      {/* نشر مجهول */}
      <label className="flex items-center gap-3 cursor-pointer select-none rounded-xl border border-border p-3 hover:bg-surface-alt transition-colors">
        <input
          type="checkbox"
          checked={form.isAnonymous}
          onChange={(e) => setField("isAnonymous", e.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        <div>
          <span className="text-sm font-medium">نشر مجهول</span>
          <p className="text-xs text-muted-fg">لن يظهر اسمك للزوار</p>
        </div>
      </label>

      {serverError && (
        <p className="text-sm text-urgent text-center bg-urgent-soft rounded-xl px-4 py-3">{serverError}</p>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        نشر الحوجة
      </Button>
    </form>
  );
}
