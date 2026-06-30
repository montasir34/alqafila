"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, placeholder, className = "", children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <select
          ref={ref}
          className={[
            "h-10 w-full rounded-xl border bg-surface px-4 text-sm text-foreground",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-urgent" : "border-border",
            className,
          ].join(" ")}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        {error && <p className="text-xs text-urgent mt-0.5">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
