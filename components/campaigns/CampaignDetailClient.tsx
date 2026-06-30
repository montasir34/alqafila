"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PaymentForm } from "@/components/needs/PaymentForm";

type Disbursement = { id: string; amount: number; recipient: string; proofUrl: string | null; spentAt: string };
type Payment = { id: string; amount: number; method: string; confirmedAt: string | null; supporter: { name: string | null } };

type Campaign = {
  id: string; title: string; description: string;
  goalAmount: number; raisedAmount: number; status: string;
  startedAt: string; endedAt: string | null;
  contributor: { id: string; name: string | null; image: string | null };
  payments: Payment[];
  disbursements: Disbursement[];
  _count: { payments: number };
};

interface Props {
  initialData: Campaign;
  currentUserId?: string;
  currentUserRole?: string;
}

export function CampaignDetailClient({ initialData, currentUserId, currentUserRole }: Props) {
  const qc = useQueryClient();
  const [showPayForm, setShowPayForm] = useState(false);
  const [tab, setTab] = useState<"supporters" | "transparency">("supporters");

  const { data: campaign } = useQuery<Campaign>({
    queryKey: ["campaign", initialData.id],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${initialData.id}`);
      return res.json();
    },
    initialData,
    refetchInterval: initialData.status === "ACTIVE" ? 5000 : false,
  });

  const isOwner = currentUserId === campaign.contributor.id;
  const canSupport = !!currentUserId && !isOwner && campaign.status === "ACTIVE";
  const totalDisbursed = campaign.disbursements.reduce((s, d) => s + d.amount, 0);

  // تأكيد دفعات الحملة
  async function confirmPayment(paymentId: string, action: "confirm" | "reject") {
    await fetch(`/api/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    qc.invalidateQueries({ queryKey: ["campaign", campaign.id] });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main */}
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold shrink-0">
            {campaign.contributor.name?.[0] ?? "م"}
          </span>
          <div>
            <p className="font-semibold">{campaign.contributor.name}</p>
            <p className="text-xs text-muted-fg">مساهم موثّق</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold">{campaign.title}</h1>
        <p className="text-base leading-relaxed whitespace-pre-wrap">{campaign.description}</p>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(["supporters", "transparency"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-amber-700 text-amber-700" : "border-transparent text-muted-fg hover:text-foreground"}`}>
              {t === "supporters" ? `الداعمون (${campaign._count.payments})` : "الشفافية والصرف"}
            </button>
          ))}
        </div>

        {tab === "supporters" ? (
          <div className="flex flex-col gap-2">
            {campaign.payments.length === 0
              ? <p className="text-sm text-muted-fg">لا توجد دفعات مؤكدة بعد</p>
              : campaign.payments.map(p => (
                <div key={p.id} className="flex justify-between items-center text-sm border border-border rounded-lg px-3 py-2">
                  <span>{p.supporter.name ?? "داعم مجهول"}</span>
                  <span className="font-semibold text-amber-700">{p.amount.toLocaleString("ar-SD")} ج</span>
                </div>
              ))
            }
          </div>
        ) : (
          <TransparencyTab
            disbursements={campaign.disbursements}
            totalDisbursed={totalDisbursed}
            raisedAmount={campaign.raisedAmount}
            isOwner={isOwner}
            campaignId={campaign.id}
            onAdd={() => qc.invalidateQueries({ queryKey: ["campaign", campaign.id] })}
          />
        )}

        {/* دفعات معلّقة لصاحب الحملة */}
        {isOwner && <CampaignPendingPayments campaignId={campaign.id} onAction={confirmPayment} />}
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        <Card>
          <ProgressBar collected={campaign.raisedAmount} target={campaign.goalAmount} />
          <div className="mt-3 text-xs text-muted-fg text-center">
            {campaign.status !== "ACTIVE" && (
              <span className="text-green-600 font-medium">
                {campaign.status === "COMPLETED" ? "✅ مكتملة" : "مغلقة"}
              </span>
            )}
          </div>
        </Card>

        {canSupport && !showPayForm && (
          <Button onClick={() => setShowPayForm(true)} className="w-full">ادعم هذه الحملة</Button>
        )}
        {showPayForm && (
          <Card>
            <h3 className="font-semibold mb-4">إرسال الدعم</h3>
            <PaymentForm
              campaignId={campaign.id}
              paymentMethods={["bankak", "fawry", "cashi", "ocash"]}
              onSuccess={() => {
                setShowPayForm(false);
                qc.invalidateQueries({ queryKey: ["campaign", campaign.id] });
              }}
            />
          </Card>
        )}
        {!currentUserId && campaign.status === "ACTIVE" && (
          <p className="text-center text-sm text-muted-fg">
            <a href="/login" className="text-amber-700 font-medium hover:underline">سجّل دخولك</a> لدعم هذه الحملة
          </p>
        )}
      </div>
    </div>
  );
}

// صفحة الشفافية
function TransparencyTab({ disbursements, totalDisbursed, raisedAmount, isOwner, campaignId, onAdd }: {
  disbursements: Disbursement[];
  totalDisbursed: number;
  raisedAmount: number;
  isOwner: boolean;
  campaignId: string;
  onAdd: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: "", recipient: "" });
  const [loading, setLoading] = useState(false);

  async function addDisbursement(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/campaigns/${campaignId}/disbursements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseInt(form.amount, 10), recipient: form.recipient }),
    });
    setForm({ amount: "", recipient: "" });
    setShowForm(false);
    setLoading(false);
    onAdd();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border p-3">
          <p className="text-muted-fg text-xs mb-1">إجمالي المُجمَّع</p>
          <p className="font-bold text-lg">{raisedAmount.toLocaleString("ar-SD")} ج</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-muted-fg text-xs mb-1">إجمالي المُصرَف</p>
          <p className="font-bold text-lg">{totalDisbursed.toLocaleString("ar-SD")} ج</p>
        </div>
      </div>

      {disbursements.length === 0
        ? <p className="text-sm text-muted-fg">لا توجد عمليات صرف مسجّلة بعد</p>
        : disbursements.map(d => (
          <div key={d.id} className="border border-border rounded-lg p-3 text-sm flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="font-medium">{d.recipient}</span>
              <span className="font-semibold text-amber-700">{d.amount.toLocaleString("ar-SD")} ج</span>
            </div>
            <p className="text-xs text-muted-fg">{new Date(d.spentAt).toLocaleDateString("ar-SD")}</p>
            {d.proofUrl && (
              <a href={d.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-700 hover:underline">📎 إثبات الصرف</a>
            )}
          </div>
        ))
      }

      {isOwner && (
        showForm ? (
          <form onSubmit={addDisbursement} className="border border-amber-200 rounded-xl p-4 flex flex-col gap-3">
            <input type="number" placeholder="المبلغ (جنيه)" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" required />
            <input type="text" placeholder="وصف الجهة المستفيدة" value={form.recipient} onChange={e => setForm(p => ({ ...p, recipient: e.target.value }))}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700" required />
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={loading} className="flex-1">إضافة</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>إلغاء</Button>
            </div>
          </form>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>+ إضافة عملية صرف</Button>
        )
      )}
    </div>
  );
}

// الدفعات المعلّقة للحملة
function CampaignPendingPayments({ campaignId, onAction }: {
  campaignId: string;
  onAction: (id: string, action: "confirm" | "reject") => void;
}) {
  const { data } = useQuery<{ payments: Array<{ id: string; amount: number; proofImageUrl: string; supporter: { name: string | null } }> }>({
    queryKey: ["campaign-pending", campaignId],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${campaignId}/pending-payments`);
      return res.json();
    },
    refetchInterval: 8000,
  });

  if (!data?.payments?.length) return null;

  return (
    <div>
      <p className="text-sm font-semibold mb-3 text-amber-700">دفعات معلّقة ({data.payments.length})</p>
      <div className="flex flex-col gap-3">
        {data.payments.map(p => (
          <div key={p.id} className="border border-amber-200 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span>{p.supporter.name ?? "مجهول"}</span>
              <span className="font-semibold">{p.amount.toLocaleString("ar-SD")} ج</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.proofImageUrl} alt="إثبات" className="w-full h-28 object-cover rounded-md border border-border" />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onAction(p.id, "confirm")} className="flex-1">✓ تأكيد</Button>
              <Button size="sm" variant="danger" onClick={() => onAction(p.id, "reject")} className="flex-1">✗ رفض</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
