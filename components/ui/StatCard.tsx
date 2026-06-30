"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface StatCardProps {
  value: number;
  label: string;
  icon: string;
  suffix?: string;
}

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [active, target, duration]);

  return count;
}

export function StatCard({ value, label, icon, suffix = "" }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useCountUp(value, inView);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-5 shadow-sm shadow-black/4 text-center"
    >
      <span className="text-3xl">{icon}</span>
      <p className="text-3xl font-bold text-primary tabular-nums">
        {count.toLocaleString("ar-SD")}{suffix}
      </p>
      <p className="text-sm text-muted-fg leading-snug">{label}</p>
    </div>
  );
}
