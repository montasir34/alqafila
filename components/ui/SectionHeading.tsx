interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  centered = false,
  action,
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={[
        "flex items-end justify-between gap-4",
        centered && "flex-col items-center text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-fg">{subtitle}</p>
        )}
      </div>
      {action && !centered && <div className="shrink-0">{action}</div>}
    </div>
  );
}
