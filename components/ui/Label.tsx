import { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required, className = "", children, ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-foreground mb-1.5 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-urgent ms-0.5">*</span>}
    </label>
  );
}
