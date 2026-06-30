import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { NeedTypeBadge } from "./NeedTypeBadge";

export type NeedSummary = {
  id: string;
  type: string;
  title: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  isUrgent: boolean;
  isAnonymous: boolean;
  state: string;
  city: string;
  createdAt: string | Date;
  poster: { id: string; name: string | null; image: string | null } | null;
  _count: { votes: number; payments: number };
};

export function NeedCard({ need }: { need: NeedSummary }) {
  return (
    <Link href={`/needs/${need.id}`} className="block group">
      <article className="rounded-xl border border-border bg-background p-5 hover:border-amber-700 hover:shadow-md transition-all h-full flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <NeedTypeBadge type={need.type} />
            {need.isUrgent && (
              <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
                عاجل
              </span>
            )}
          </div>
          <span className="text-xs text-muted-fg shrink-0">
            {need.state} — {need.city}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">
          {need.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-fg line-clamp-2 flex-1">
          {need.description}
        </p>

        {/* Progress */}
        <ProgressBar collected={need.collectedAmount} target={need.targetAmount} />

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-fg pt-1">
          <span>
            {need.isAnonymous
              ? "مجهول"
              : (need.poster?.name ?? "غير محدد")}
          </span>
          <div className="flex items-center gap-3">
            <span>🗳️ {need._count.votes}</span>
            <span>💳 {need._count.payments}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
