"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "حدث خطأ"); return; }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="text-4xl">📬</span>
        <p className="text-sm text-muted-fg">
          إذا كان البريد مسجّلاً وغير مفعّل، راجع صندوق الوارد أو Spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted-fg text-center">
        أدخل بريدك الإلكتروني وسنرسل رابط تحقق جديد.
      </p>
      <div>
        <Label htmlFor="email" required>البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {error && (
        <p className="text-sm text-urgent bg-urgent-soft rounded-xl px-4 py-2 text-center">{error}</p>
      )}
      <Button type="submit" loading={loading} className="w-full">
        إرسال رابط التحقق
      </Button>
    </form>
  );
}
