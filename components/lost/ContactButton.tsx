"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ContactButtonProps {
  receiverId: string;
  targetType: string;
  targetId: string;
  label?: string;
}

export function ContactButton({ receiverId, targetType, targetId, label = "تواصل عبر المنصة" }: ContactButtonProps) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!body.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, targetType, targetId, body }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "حدث خطأ"); return; }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <p className="text-sm text-green-600 font-medium">✅ تم إرسال رسالتك — سيرد عليك صاحب المنشور</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {!open ? (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          💬 {label}
        </Button>
      ) : (
        <>
          <textarea
            rows={3}
            placeholder="اكتب رسالتك هنا..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-700"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={send} loading={loading} className="flex-1">إرسال</Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
          </div>
        </>
      )}
    </div>
  );
}
