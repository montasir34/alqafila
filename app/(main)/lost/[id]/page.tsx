import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ContactButton } from "@/components/lost/ContactButton";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ kind?: string }> };

export default async function LostDetailPage({ params, searchParams }: PageProps) {
  const [{ id }, sp, session] = await Promise.all([params, searchParams, auth()]);
  const kind = sp.kind ?? "item";

  if (kind === "car") {
    const car = await prisma.lostCar.findUnique({
      where: { id },
      include: { reporter: { select: { id: true, name: true } } },
    });
    if (!car) notFound();

    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <span className="text-xs text-muted-fg">{car.state} — {car.city}</span>
          <h1 className="text-2xl font-bold mt-1">{car.make} {car.model} — {car.color}</h1>
        </div>
        {car.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={car.imageUrl} alt="صورة السيارة" className="w-full rounded-xl object-cover max-h-72" />
        )}
        <dl className="grid grid-cols-2 gap-3 text-sm border border-border rounded-xl p-4">
          <div><dt className="text-muted-fg">رقم اللوحة</dt><dd className="font-semibold">{car.plateNumber}</dd></div>
          {car.chassisNumber && <div><dt className="text-muted-fg">رقم الشاسيه</dt><dd className="font-semibold">{car.chassisNumber}</dd></div>}
          {car.year && <div><dt className="text-muted-fg">سنة الصنع</dt><dd>{car.year}</dd></div>}
          <div><dt className="text-muted-fg">المُبلِّغ</dt><dd>{car.reporter.name}</dd></div>
        </dl>
        {car.description && <p className="text-sm leading-relaxed">{car.description}</p>}
        {session?.user && session.user.id !== car.reporter.id && (
          <ContactButton receiverId={car.reporter.id} targetType="LOST_CAR" targetId={id} label="تواصل مع صاحب السيارة" />
        )}
      </div>
    );
  }

  const item = await prisma.lostItem.findUnique({
    where: { id },
    include: { reporter: { select: { id: true, name: true } } },
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
      {item.lastSeenAt && (
        <p className="text-sm text-muted-fg">📍 آخر مكان: {item.lastSeenAt}</p>
      )}
      <p className="text-base leading-relaxed whitespace-pre-wrap">{item.description}</p>
      <p className="text-sm text-muted-fg">المُبلِّغ: {item.reporter.name}</p>
      {session?.user && session.user.id !== item.reporter.id && (
        <ContactButton receiverId={item.reporter.id} targetType="LOST_ITEM" targetId={id} label="تواصل مع صاحب المفقود" />
      )}
    </div>
  );
}
