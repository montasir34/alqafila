interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface-alt py-14 px-6 text-center",
        className,
      ].join(" ")}
    >
      <span className="text-4xl" role="img" aria-hidden>{icon}</span>
      <p className="font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-fg max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
