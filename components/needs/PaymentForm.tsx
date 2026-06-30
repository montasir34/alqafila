"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { PAYMENT_METHOD_LABELS } from "@/lib/validations/need";

interface PaymentFormProps {
  needId?: string;
  campaignId?: string;
  paymentMethods: string[];
  onSuccess: () => void;
}

export function PaymentForm({ needId, campaignId, paymentMethods, onSuccess }: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(paymentMethods[0] ?? "");
  const [proofUrl, setProofUrl] = useState("");
  const [proofPreview, setProofPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("الصورة أكبر من 5 ميغابايت"); return; }
    setUploading(true);
    setError("");
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: reader.result, folder: "proofs" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "فشل الرفع"); setUploading(false); return; }
      setProofUrl(data.url);
      setProofPreview(reader.result as string);
      setUploading(false);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!proofUrl) { setError("يرجى رفع إثبات التحويل"); return; }
    const amt = parseInt(amount, 10);
    if (!amt || amt < 1) { setError("أدخل مبلغاً صحيحاً"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needId, campaignId, amount: amt, method, proofImageUrl: proofUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "حدث خطأ"); return; }
      setDone(true);
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <p className="text-3xl mb-2">✅</p>
        <p className="font-semibold">تم إرسال إثبات تحويلك بنجاح</p>
        <p className="text-sm text-muted-fg mt-1">
          في انتظار تأكيد صاحب الحوجة
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label required>طريقة الدفع</Label>
        <Select value={method} onChange={(e) => setMethod(e.target.value)}>
          {paymentMethods.map((m) => (
            <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m] ?? m}</option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="amount" required>المبلغ المحوّل (جنيه)</Label>
        <Input
          id="amount"
          type="number"
          min={1}
          placeholder="أدخل المبلغ"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div>
        <Label required>إثبات التحويل (لقطة شاشة)</Label>
        {proofPreview ? (
          <div className="relative mt-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proofPreview} alt="إثبات" className="w-full h-36 object-cover rounded-lg border border-border" />
            <button
              type="button"
              onClick={() => { setProofUrl(""); setProofPreview(""); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute top-1 end-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
            >×</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-1 h-24 w-full rounded-lg border-2 border-dashed border-border flex items-center justify-center text-sm text-muted-fg hover:border-amber-700 hover:text-amber-700 transition-colors disabled:opacity-50"
          >
            {uploading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : "📎 ارفع لقطة الشاشة"}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" loading={loading} className="w-full">
        إرسال إثبات التحويل
      </Button>
    </form>
  );
}
