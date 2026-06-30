import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ContactButton } from "@/components/lost/ContactButton";

type PageProps = { params: Promise<{ id: string }> };

export default async function FoundDetailPage({ params }: PageProps) {
  const [{ id }, session] = await Promise.all([params, auth()]);

  const item = await prisma.foundItem.findUnique({
    where: { id },
    include: { finder: { select: { id: true, name: true } } },
  });
  if (!item) notFound();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <span className="text-xs text-muted-fg">{item.state} — {item.city}</span>
        <h1 className="text-2xl font-bold mt-1">{item.title}</h1>
      </div>
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.title} className="w-full rounded-xl object-cover max-h-72" />
      )}
      {item.isCar && item.plateNumber && (
        <p className="text-sm font-medium">🚗 رقم اللوحة: {item.plateNumber}</p>
      )}
      {item.foundAt && <p className="text-sm text-muted-fg">📍 مكان الإيجاد: {item.foundAt}</p>}
      <p className="text-base leading-relaxed whitespace-pre-wrap">{item.description}</p>
      <p className="text-sm text-muted-fg">العثور بواسطة: {item.finder.name}</p>
      {session?.user && session.user.id !== item.finder.id && (
        <ContactButton receiverId={item.finder.id} targetType="FOUND_ITEM" targetId={id} label="تواصل مع من عثر عليه" />
      )}
    </div>
  );
}
