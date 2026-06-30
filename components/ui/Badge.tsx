type BadgeVariant = "urgent" | "success" | "warning" | "neutral" | "primary" | "verified";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  urgent:   "bg-urgent-soft text-urgent border border-urgent/20",
  success:  "bg-success-soft text-success border border-success/20",
  warning:  "bg-warning-soft text-warning border border-warning/20",
  neutral:  "bg-muted text-muted-fg border border-border",
  primary:  "bg-primary-soft text-primary border border-primary/20",
  verified: "bg-success-soft text-success border border-success/20",
};

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
