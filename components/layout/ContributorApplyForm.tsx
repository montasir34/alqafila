"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";

export function ContributorApplyForm() {
  const router = useRouter();
  const [idImageUrl, setIdImageUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idImageUrl) { setError("يرجى رفع صورة الهوية الوطنية"); return; }
    if (!selfieUrl) { setError("يرجى رفع صورة شخصية واضحة"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contributor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idImageUrl, selfieUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "حدث خطأ"); return; }
      router.push("/profile?applied=1");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* تنبيه الخصوصية */}
      <div className="rounded-xl bg-primary-soft border border-primary/20 px-4 py-3 text-sm">
        <p className="font-semibold text-primary mb-1">لماذا نطلب التوثيق؟</p>
        <p className="text-muted-fg">
          المساهمون الموثّقون يقدروا يصوّتوا على الإلحاح ويفتحوا حملات لايف.
          صورة الهوية تُستخدم للتحقق فقط وتُحذف بعد المراجعة مباشرة.
        </p>
      </div>

      <ImageUpload
        label="صورة الهوية الوطنية"
        hint="وجهي لبطاقتك — تُحذف من السيرفر بعد مراجعة طلبك مباشرة"
        folder="ids"
        value={idImageUrl}
        onChange={setIdImageUrl}
        required
        aspectRatio="wide"
      />

      <ImageUpload
        label="صورة شخصية (سيلفي)"
        hint="صورة واضحة لوجهك — ستظهر في ملفك كمساهم موثّق"
        folder="selfies"
        value={selfieUrl}
        onChange={setSelfieUrl}
        required
        aspectRatio="square"
      />

      {error && (
        <p className="text-sm text-urgent bg-urgent-soft rounded-xl px-4 py-3 text-center">{error}</p>
      )}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        إرسال طلب التوثيق
      </Button>
    </form>
  );
}
