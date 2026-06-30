"use client";

import { Select } from "./Select";
import { SUDAN_STATES } from "@/lib/data/sudan-states";
import { SelectHTMLAttributes } from "react";

interface StateSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  placeholder?: string;
}

export function StateSelect({ error, placeholder = "اختر الولاية", ...props }: StateSelectProps) {
  return (
    <Select placeholder={placeholder} error={error} {...props}>
      {SUDAN_STATES.map((s) => (
        <option key={s.name} value={s.name}>
          {s.name}
        </option>
      ))}
    </Select>
  );
}
