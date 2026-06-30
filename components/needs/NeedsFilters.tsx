"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Select } from "@/components/ui/Select";
import { StateSelect } from "@/components/ui/StateSelect";
import { Button } from "@/components/ui/Button";

const TYPES = [
  { value: "", label: "كل الأنواع" },
  { value: "MEDICINE", label: "دواء" },
  { value: "FOOD", label: "غذاء" },
  { value: "SHELTER", label: "مأوى" },
  { value: "TRANSPORT", label: "مواصلات" },
  { value: "CASH", label: "نقدي" },
  { value: "OTHER", label: "أخرى" },
];

export function NeedsFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(sp.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`/needs?${params.toString()}`);
    },
    [router, sp]
  );

  const urgent = sp.get("urgent") === "1";

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <StateSelect
        value={sp.get("state") ?? ""}
        onChange={(e) => update("state", e.target.value)}
        placeholder="كل الولايات"
        className="w-40"
      />

      <Select
        value={sp.get("type") ?? ""}
        onChange={(e) => update("type", e.target.value)}
        className="w-36"
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </Select>

      <Button
        variant={urgent ? "primary" : "secondary"}
        size="sm"
        onClick={() => update("urgent", urgent ? "" : "1")}
      >
        🔴 عاجل فقط
      </Button>

      {(sp.get("state") || sp.get("type") || urgent) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/needs")}
        >
          مسح الفلاتر
        </Button>
      )}
    </div>
  );
}
