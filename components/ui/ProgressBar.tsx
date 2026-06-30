"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  collected: number;
  target: number;
  showAmounts?: boolean;
  size?: "sm" | "md";
}

function fmt(n: number) {
  return n.toLocaleString("ar-SD");
}

export function ProgressBar({
  collected,
  target,
  showAmounts = true,
  size = "md",
}: ProgressBarProps) {
  const pct = Math.min(100, target > 0 ? (collected / target) * 100 : 0);
  const trackH = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className={`${trackH} w-full rounded-full bg-muted overflow-hidden`}>
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      {showAmounts && (
        <div className="flex justify-between text-xs text-muted-fg">
          <span>
            <span className="font-semibold text-foreground">{fmt(collected)}</span>{" "}
            <span>ج</span>
          </span>
          <span>
            {pct.toFixed(0)}٪ من {fmt(target)}
          </span>
        </div>
      )}
    </div>
  );
}
