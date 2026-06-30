"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { NeedTypeBadge } from "./NeedTypeBadge";
import { PaymentForm } from "./PaymentForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PAYMENT_METHOD_LABELS } from "@/lib/validations/need";
import { VoteButton } from "./VoteButton";

type Payment = {
  id: string;
  amount: number;
  method: string;
  confirmedAt: string | null;
  supporter: { name: string | null; image: string | null };
};

type Need = {
  id: string;
  type: string;
  title: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  paymentMethods: string[];
  status: string;
  isUrgent: boolean;
  isAnonymous: boolean;
  state: string;
  city: string;
  createdAt: string;
  poster: { id: string; name: string | null } | null;
  _count: { votes: number; payments: number };
  payments: Payment[];
};

interface Props {
  initialData: Need;
  currentUserId?: string;
  currentUserRole?: string;
}

export function NeedDetailClient({ initialData, currentUserId, currentUserRole }: Props) {
  const qc = useQueryClient();
  const [showPayForm, setShowPayForm] = useState(false);

  const { data: need } = useQuery<Need>({
    queryKey: ["need", initialData.id],
    queryFn: async () => {
      const res = await fetch(`/api/needs/${initialData.id}`);
      return res.json();
    },
    initialData,
    refetchInterval: initialData.status === "OPEN" ? 5000 : false,
  });

  const isOwner = currentUserId === need.poster?.id;
  const canSupport = !!currentUserId && !isOwner && need.status === "OPEN";

  // تأكيد الاستلام
  async function confirmPayment(paymentId: string, action: "confirm" | "reject") {
    await fetch(`/api/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    qc.invalidateQueries({ queryKey: ["need", need.id] });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start gap-3 flex-wrap">
          <NeedTypeBadge type={need.type} />
          {need.isUrgent && (
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
              عاجل
            </span>
          )}
          {need.status !== "OPEN" && (
            <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-medium text-white">
              {need.status === "FULFILLED" ? "تم الوفاء" : "مغلقة"}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold leading-snug">{need.title}</h1>

        <p className="text-sm text-muted-fg">
          {need.state} — {need.city} ·{" "}
          {need.isAnonymous ? "مجهول" : (need.poster?.name ?? "غير محدد")}
        </p>

        <p className="text-base leading-relaxed whitespace-pre-wrap">
          {need.description}
        </p>

        {/* طرق الدفع */}
        <div>
          <p className="text-sm font-medium mb-2">طرق الدفع المقبولة:</p>
          <div className="flex flex-wrap gap-2">
            {need.paymentMethods.map((m: string) => (
              <span
                key={m}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium"
              >
                {PAYMENT_METHOD_LABELS[m] ?? m}
              </span>
            ))}
          </div>
        </div>

        {/* سجل الدعم المؤكّد */}
        {need.payments.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3">آخر الداعمين</p>
            <div className="flex flex-col gap-2">
              {need.payments.map((p: Payment) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm border border-border rounded-lg px-3 py-2"
                >
                  <span>{p.supporter.name ?? "داعم مجهول"}</span>
                  <span className="font-semibold text-amber-700">
                    {p.amount.toLocaleString("ar-SD")} ج
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* تأكيد الدفعات (صاحب الحوجة) */}
        {isOwner && (
          <PendingPayments needId={need.id} onAction={confirmPayment} />
        )}
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        <Card>
          <ProgressBar
            collected={need.collectedAmount}
            target={need.targetAmount}
          />
          <div className="mt-4 flex justify-between text-xs text-muted-fg">
            <span>💳 {need._count.payments} دعم</span>
          </div>
        </Card>

        <VoteButton
          needId={need.id}
          initialVotes={need._count.votes}
          isContributor={currentUserRole === "CONTRIBUTOR" || currentUserRole === "ADMIN"}
          isOwner={isOwner}
        />

        {canSupport && !showPayForm && (
          <Button onClick={() => setShowPayForm(true)} className="w-full">
            ادعم هذه الحوجة
          </Button>
        )}

        {showPayForm && (
          <Card>
            <h3 className="font-semibold mb-4">إرسال الدعم</h3>
            <PaymentForm
              needId={need.id}
              paymentMethods={need.paymentMethods}
              onSuccess={() => {
                setShowPayForm(false);
                qc.invalidateQueries({ queryKey: ["need", need.id] });
              }}
            />
          </Card>
        )}

        {!currentUserId && need.status === "OPEN" && (
          <p className="text-center text-sm text-muted-fg">
            <a href="/login" className="text-amber-700 font-medium hover:underline">
              سجّل دخولك
            </a>{" "}
            لدعم هذه الحوجة
          </p>
        )}
      </div>
    </div>
  );
}

// مكوّن فرعي: الدفعات المعلّقة (صاحب الحوجة فقط)
function PendingPayments({
  needId,
  onAction,
}: {
  needId: string;
  onAction: (id: string, action: "confirm" | "reject") => void;
}) {
  const { data } = useQuery<{ payments: Array<{
    id: string; amount: number; method: string; proofImageUrl: string;
    supporter: { name: string | null };
    createdAt: string;
  }> }>({
    queryKey: ["pending-payments", needId],
    queryFn: async () => {
      const res = await fetch(`/api/needs/${needId}/pending-payments`);
      return res.json();
    },
    refetchInterval: 8000,
  });

  if (!data?.payments?.length) return null;

  return (
    <div>
      <p className="text-sm font-semibold mb-3 text-amber-700">
        دفعات في انتظار تأكيدك ({data.payments.length})
      </p>
      <div className="flex flex-col gap-3">
        {data.payments.map((p) => (
          <div key={p.id} className="border border-amber-200 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span>{p.supporter.name ?? "مجهول"}</span>
              <span className="font-semibold">{p.amount.toLocaleString("ar-SD")} ج</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.proofImageUrl}
              alt="إثبات التحويل"
              className="w-full h-32 object-cover rounded-md border border-border"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onAction(p.id, "confirm")} className="flex-1">
                ✓ تأكيد
              </Button>
              <Button size="sm" variant="danger" onClick={() => onAction(p.id, "reject")} className="flex-1">
                ✗ رفض
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
