const TYPE_MAP: Record<string, { label: string; color: string }> = {
  MEDICINE:  { label: "دواء",     color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  FOOD:      { label: "غذاء",     color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  SHELTER:   { label: "مأوى",     color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  TRANSPORT: { label: "مواصلات",  color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  CASH:      { label: "نقدي",     color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  OTHER:     { label: "أخرى",     color: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300" },
};

export function NeedTypeBadge({ type }: { type: string }) {
  const { label, color } = TYPE_MAP[type] ?? TYPE_MAP.OTHER;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
