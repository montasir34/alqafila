import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ContactButton } from "@/components/lost/ContactButton";

type PageProps = { params: Promise<{ id: string }> };

export default async function MissingDetailPage({ params }: PageProps) {
  const [{ id }, session] = await Promise.all([params, auth()]);

  const person = await prisma.missingPerson.findUnique({
    where: { id },
    select: {
      id: true, name: true, age: true, gender: true, description: true,
      photoUrl: true, lastSeenAt: true, lastSeenDate: true,
      state: true, city: true, status: true, createdAt: true, reporterId: true,
    },
  });
  if (!person) notFound();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200">
        التواصل عبر المنصة فقط — لا تُشارك معلومات شخصية خارج المنصة.
      </div>

      <div className="flex gap-5 items-start">
        {person.photoUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={person.photoUrl} alt={person.name} className="w-32 h-32 rounded-xl object-cover object-top border border-border shrink-0" />
          : <div className="w-32 h-32 rounded-xl bg-muted flex items-center justify-center text-4xl shrink-0">👤</div>
        }
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{person.name}</h1>
          {person.age && <p className="text-sm text-muted-fg">العمر: {person.age} سنة</p>}
          {person.gender && <p className="text-sm text-muted-fg">الجنس: {person.gender}</p>}
          <p className="text-sm text-muted-fg">{person.state} — {person.city}</p>
          {person.lastSeenAt && <p className="text-sm">📍 آخر مكان: {person.lastSeenAt}</p>}
          {person.lastSeenDate && (
            <p className="text-sm text-muted-fg">
              📅 {new Date(person.lastSeenDate).toLocaleDateString("ar-SD")}
            </p>
          )}
        </div>
      </div>

      <p className="text-base leading-relaxed whitespace-pre-wrap">{person.description}</p>

      {person.status === "RESOLVED" && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 rounded-xl p-4 text-green-700 dark:text-green-300 font-semibold text-center">
          ✅ تم العثور على هذا الشخص
        </div>
      )}

      {session?.user && session.user.id !== person.reporterId && person.status === "ACTIVE" && (
        <div className="border border-border rounded-xl p-4">
          <p className="text-sm font-medium mb-3">لديك معلومات عن هذا الشخص؟</p>
          <ContactButton
            receiverId={person.reporterId}
            targetType="MISSING_PERSON"
            targetId={id}
            label="أرسل معلوماتك عبر المنصة"
          />
        </div>
      )}
    </div>
  );
}
