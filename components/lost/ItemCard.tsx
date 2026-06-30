import Link from "next/link";

type ItemCardProps = {
  id: string;
  kind: "lost-item" | "lost-car" | "found";
  title: string;
  description: string;
  imageUrl?: string | null;
  state: string;
  city: string;
  status: string;
  createdAt: string | Date;
  extra?: React.ReactNode;
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "", RESOLVED: "محلول", CLOSED: "مغلق",
};

export function ItemCard({ id, kind, title, description, imageUrl, state, city, status, extra }: ItemCardProps) {
  const href = kind === "lost-item" ? `/lost/${id}?kind=item`
    : kind === "lost-car" ? `/lost/${id}?kind=car`
    : `/found/${id}`;

  return (
    <Link href={href} className="block group">
      <article className="rounded-xl border border-border bg-background overflow-hidden hover:border-amber-700 hover:shadow-md transition-all h-full flex flex-col">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className="w-full h-36 object-cover" />
        )}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-fg">{state} — {city}</span>
            {STATUS_LABEL[status] && (
              <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">{STATUS_LABEL[status]}</span>
            )}
          </div>
          <h3 className="font-semibold text-sm leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">{title}</h3>
          <p className="text-xs text-muted-fg line-clamp-2 flex-1">{description}</p>
          {extra}
        </div>
      </article>
    </Link>
  );
}
