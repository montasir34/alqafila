"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { StateSelect } from "@/components/ui/StateSelect";
import { CitySelect } from "@/components/ui/CitySelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { registerSchema } from "@/lib/validations/auth";

type FieldErrors = Partial<Record<string, string>>;

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
    city: "",
  });
  const [idImageUrl, setIdImageUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (field === "state") {
        setForm((p) => ({ ...p, state: e.target.value, city: "" }));
      } else {
        setForm((p) => ({ ...p, [field]: e.target.value }));
      }
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setFieldErrors({});

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) errors[i.path[0] as string] = i.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          ...(idImageUrl && selfieUrl ? { idImageUrl, selfieUrl } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "حدث خطأ");
        return;
      }
      const qs = data.appliedForVerification ? "?applied=1" : "";
      router.push(`/check-email${qs}`);
    } finally {
      setLoading(false);
    }
  }

  const hasBothDocs = !!(idImageUrl && selfieUrl);
  const hasOnlyOne = !!(idImageUrl || selfieUrl) && !hasBothDocs;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name" required>الاسم الكامل</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="محمد أحمد"
          value={form.name}
          onChange={set("name")}
          error={fieldErrors.name}
        />
      </div>

      <div>
        <Label htmlFor="email" required>البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="example@email.com"
          value={form.email}
          onChange={set("email")}
          error={fieldErrors.email}
        />
      </div>

      <div>
        <Label htmlFor="password" required>كلمة المرور</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="8 أحرف على الأقل"
          value={form.password}
          onChange={set("password")}
          error={fieldErrors.password}
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword" required>تأكيد كلمة المرور</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={fieldErrors.confirmPassword}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="state" required>الولاية</Label>
          <StateSelect
            id="state"
            value={form.state}
            onChange={set("state")}
            error={fieldErrors.state}
          />
        </div>
        <div>
          <Label htmlFor="city" required>المدينة</Label>
          <CitySelect
            id="city"
            stateName={form.state}
            value={form.city}
            onChange={set("city")}
            error={fieldErrors.city}
          />
        </div>
      </div>

      {/* توثيق اختياري */}
      <div className="rounded-xl border border-border bg-surface-alt p-4 flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">التوثيق كمساهم — اختياري</p>
          <p className="text-xs text-muted-fg mt-0.5">
            ارفع هويّتك وصورة شخصية الآن ليُرسَل طلب التوثيق تلقائياً بعد التسجيل.
            صورة الهوية تُحذف من السيرفر بعد المراجعة مباشرة.
          </p>
        </div>

        <ImageUpload
          label="صورة الهوية الوطنية"
          hint="وجهي لبطاقتك — تُحذف بعد مراجعة طلبك"
          folder="ids"
          value={idImageUrl}
          onChange={setIdImageUrl}
          aspectRatio="wide"
        />

        <ImageUpload
          label="صورة شخصية (سيلفي)"
          hint="صورة واضحة لوجهك — ستظهر في ملفك كمساهم موثّق"
          folder="selfies"
          value={selfieUrl}
          onChange={setSelfieUrl}
          aspectRatio="square"
        />

        {hasOnlyOne && (
          <p className="text-xs text-warning bg-warning-soft rounded-lg px-3 py-2">
            لإرسال طلب التوثيق يجب رفع الصورتين معاً
          </p>
        )}
        {hasBothDocs && (
          <p className="text-xs text-success bg-success-soft rounded-lg px-3 py-2">
            ✓ سيُرسَل طلب التوثيق تلقائياً بعد إنشاء الحساب
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-urgent bg-urgent-soft rounded-xl px-4 py-3 text-center">{serverError}</p>
      )}

      <Button type="submit" loading={loading} className="w-full mt-2">
        إنشاء حساب
      </Button>
    </form>
  );
}
