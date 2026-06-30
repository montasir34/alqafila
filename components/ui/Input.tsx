"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <input
          ref={ref}
          className={[
            "h-10 w-full rounded-xl border bg-surface px-4 text-sm text-foreground",
            "placeholder:text-subtle-fg",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-urgent focus:ring-urgent/30 focus:border-urgent"
              : "border-border",
            className,
          ].join(" ")}
          {...props}
        />
        {error && <p className="text-xs text-urgent mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
