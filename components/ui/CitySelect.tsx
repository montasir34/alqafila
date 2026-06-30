"use client";

import { Select } from "./Select";
import { getCitiesForState } from "@/lib/data/sudan-states";
import { SelectHTMLAttributes } from "react";

interface CitySelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  stateName: string;
  error?: string;
}

export function CitySelect({ stateName, error, ...props }: CitySelectProps) {
  const cities = getCitiesForState(stateName);

  return (
    <Select
      placeholder="اختر المدينة / المحلية"
      error={error}
      disabled={!stateName}
      {...props}
    >
      {cities.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </Select>
  );
}
