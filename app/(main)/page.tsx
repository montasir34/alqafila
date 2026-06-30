import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";

// ══════════════════════════════════
// Data fetching
// ══════════════════════════════════

async function getStats() {
  const [openNeeds, fulfilledNeeds, contributors, totalPayments] = await Promise.all([
    prisma.need.count({ where: { status: "OPEN" } }),
    prisma.need.count({ where: { status: "FULFILLED" } }),
    prisma.user.count({ where: { role: { in: ["CONTRIBUTOR", "ADMIN"] } } }),
    prisma.payment.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { amount: true },
    }),
  ]);
  return { openNeeds, fulfilledNeeds, contributors, totalAmount: totalPayments._sum.amount ?? 0 };
}

async function getUrgentNeeds() {
  return prisma.need.findMany({
    where: { status: "OPEN", isUrgent: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      id: true, title: true, type: true,
      targetAmount: true, collectedAmount: true,
      state: true, city: true, isAnonymous: true,
    },
  });
}

async function getActiveCampaigns() {
  return prisma.liveCampaign.findMany({
    where: { status: "ACTIVE" },
    orderBy: { startedAt: "desc" },
    take: 3,
    select: {
      id: true, title: true, goalAmount: true, raisedAmount: true,
      contributor: { select: { name: true } },
    },
  });
}

// ══════════════════════════════════
// Constants
// ══════════════════════════════════

const TYPE_LABELS: Record<string, string> = {
  MEDICINE: "دواء", FOOD: "غذاء", SHELTER: "مأوى",
  TRANSPORT: "نقل", CASH: "نقدي", OTHER: "أخرى",
};

const FAQ_ITEMS = [
  {
    question: "كيف أتأكد إن الحوجة حقيقية؟",
    answer: "كل حوجة مربوطة بحساب موثّق. المساهمون الموثّقون (بهوية) بيصوّتوا على الحوجات العاجلة، وصاحب الحوجة لازم يؤكّد استلام كل دفعة. الشفافية كاملة — قدر تشوف كل الدفعات والإثباتات.",
  },
  {
    question: "التحويل بأي طريقة؟",
    answer: "بنكاك، فوري، كاشي، أوكاش، إي-سيرتي، بنك أوف خرطوم — حسب ما يحدّده صاحب الحوجة. التحويل مباشر بينك وبينه، المنصة ما بتلمس الفلوس.",
  },
  {
    question: "هل المنصة بتاخد عمولة؟",
    answer: "لا. المنصة مجانية ١٠٠٪، ولا تأخذ أي نسبة أو رسوم. المبلغ الكامل يوصل لصاحب الحوجة مباشرة.",
  },
  {
    question: "كيف أصير مساهم موثّق؟",
    answer: "سجّل حساب، ثم اقدم طلب التوثيق من ملفك الشخصي. محتاج صورة هوية وسيلفي للتحقق. الفريق يراجع الطلب ويردّ خلال يوم أو يومين. الموثّقون يقدروا يصوّتوا على الإلحاح، وينشروا حملات.",
  },
  {
    question: "كيف أبلّغ عن نصب أو محتوى مشبوه؟",
    answer: "في كل حوجة وحملة زر 'بلّغ'. فريق الإدارة يراجع البلاغات ويتصرف خلال ٢٤ ساعة. في حالات النصب الصريح، الحساب يُعلَّق فوراً.",
  },
  {
    question: "هل معلوماتي الشخصية آمنة؟",
    answer: "نعم. صور الهويات تُحذف من السيرفر بعد التحقق مباشرة ويُحتفظ بحالة التوثيق فقط. الحوجات المجهولة لا يظهر فيها اسم أو معلومات صاحبها في أي واجهة عامة.",
  },
  {
    question: "هل ممكن أنشر حوجة بشكل مجهول؟",
    answer: "نعم، عند نشر حوجة في إمكانك تفعيل 'نشر مجهول' — اسمك ومعلوماتك لن تظهر للزوار، لكن الداعمون بيتواصلوا معاك عبر وسائل الدفع المحدّدة مسبقاً.",
  },
];

// ══════════════════════════════════
// Page
// ══════════════════════════════════

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/profile");

  const [stats, urgentNeeds, campaigns] = await Promise.all([
    getStats(),
    getUrgentNeeds(),
    getActiveCampaigns(),
  ]);

  return (
    <div className="flex flex-col -mt-6">

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden -mx-4 px-4">
        {/* خلفية تدرّج دافئ */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-soft via-background to-surface-alt -z-10" />
        {/* نمط هندسي خفيف */}
        <div
          className="absolute inset-0 opacity-[0.03] -z-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        <div className="mx-auto max-w-2xl py-20 sm:py-28 text-center flex flex-col items-center gap-6">
          <Badge variant="primary" className="text-xs px-3 py-1">
            🇸🇩 منصة تنسيق الإغاثة في السودان
          </Badge>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            القافلة تنسيق الإغاثة
            <span className="block text-primary mt-1">بشفافية وبدون وسيط</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-fg max-w-md leading-relaxed">
            نوصّل العون لأهلنا مباشرةً — ادعم من يحتاج أو انشر حوجتك،
            والتحويل دايماً مباشر بينك وبينه.
          </p>

          {/* الزرّان الرئيسيان */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:justify-center">
            <Link href="/register" className="flex-1 sm:flex-initial">
              <Button size="lg" className="w-full sm:w-auto">
                🤲 طلب حوجة
              </Button>
            </Link>
            <Link href="/register" className="flex-1 sm:flex-initial">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                💛 مساهم جديد
              </Button>
            </Link>
          </div>

          <p className="text-xs text-subtle-fg">
            مجاني ١٠٠٪ · لا عمولات · التحويل مباشر
          </p>

          {/* ══ STATS — مباشرة تحت العبارة ══ */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4">
            <StatCard value={stats.openNeeds} label="حوجة مفتوحة" icon="📋" />
            <StatCard value={stats.fulfilledNeeds} label="حوجة اكتملت" icon="✅" />
            <StatCard value={stats.contributors} label="مساهم موثّق" icon="🌟" />
            <StatCard
              value={Math.floor(stats.totalAmount / 1000)}
              label="ألف جنيه جُمعت"
              icon="💰"
              suffix="K+"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-16 py-14 px-4 max-w-5xl mx-auto w-full">

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
        <section id="كيف-تعمل">
          <SectionHeading
            title="كيف تعمل القافلة؟"
            subtitle="ثلاث خطوات بسيطة، شفافية كاملة"
            centered
            className="mb-10"
          />
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* خط رابط — desktop فقط */}
            <div className="hidden sm:block absolute top-8 inset-s-[calc(16.67%+1rem)] inset-e-[calc(16.67%+1rem)] h-px bg-border" />

            {[
              {
                step: "١",
                icon: "📝",
                title: "انشر حوجتك",
                desc: "حدّد نوع الحوجة، المبلغ، ووسيلة الدفع المفضّلة. يمكن النشر بشكل مجهول.",
              },
              {
                step: "٢",
                icon: "💛",
                title: "الداعم يحوّل مباشرة",
                desc: "الداعم يحوّل لك مباشرة ويرفع إثبات التحويل على المنصة.",
              },
              {
                step: "٣",
                icon: "✅",
                title: "تأكّد واستلم",
                desc: "تأكّد الدفعة، يتحدث الشريط، ولما تكتمل الحوجة تُغلق تلقائياً.",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-3 relative">
                <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-soft border border-primary/20 shrink-0">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="absolute -top-2 -inset-e-2 h-5 w-5 rounded-full bg-primary text-primary-fg text-xs font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-fg leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TRANSPARENCY BANNER ═══════════════════════════════════════ */}
        <section className="rounded-2xl bg-primary-soft border border-primary/20 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-3xl shrink-0">🔒</span>
          <div>
            <p className="font-semibold text-foreground text-base sm:text-lg leading-snug">
              المنصة ما بتمسك فلوسك — التحويل مباشر بينك وبين المحتاج
            </p>
            <p className="text-sm text-muted-fg mt-1">
              إحنا بس نوثّق ونوصّل بينكم. لا عمولات، لا وساطة مالية، صفر رسوم.
            </p>
          </div>
        </section>

        {/* ══ URGENT NEEDS ══════════════════════════════════════════════ */}
        <section id="الحوجات-العاجلة">
          <SectionHeading
            title="حوجات عاجلة — ساعد الآن"
            action={
              <Link href="/needs?urgent=true" className="text-sm text-primary font-medium hover:underline">
                عرض الكل ←
              </Link>
            }
            className="mb-5"
          />

          {urgentNeeds.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface-alt py-12 text-center text-muted-fg">
              <p className="text-3xl mb-2">✨</p>
              <p className="text-sm">لا توجد حوجات عاجلة حالياً — الحمد لله</p>
            </div>
          ) : (
            /* موبايل: scroll أفقي / desktop: grid */
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
              {urgentNeeds.map((n) => (
                <div key={n.id} className="snap-start shrink-0 w-[80vw] sm:w-auto sm:shrink">
                  <article className="rounded-2xl border border-border bg-surface p-4 hover:border-primary/40 hover:shadow-md hover:shadow-black/7 hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="neutral" className="text-xs">
                        {TYPE_LABELS[n.type] ?? n.type}
                      </Badge>
                      <Badge variant="urgent" className="text-xs">
                        🔴 عاجل
                      </Badge>
                    </div>
                    <Link href={`/needs/${n.id}`} className="group flex-1 flex flex-col gap-2">
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 flex-1">
                        {n.title}
                      </h3>
                      <p className="text-xs text-muted-fg">{n.state} {n.city ? `/ ${n.city}` : ""}</p>
                      <ProgressBar
                        collected={n.collectedAmount}
                        target={n.targetAmount}
                        size="sm"
                      />
                    </Link>
                    <Link href="/register" className="block">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        سجّل دخولك للمساهمة
                      </Button>
                    </Link>
                  </article>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ══ CAMPAIGNS ═════════════════════════════════════════════════ */}
        {campaigns.length > 0 && (
          <section>
            <SectionHeading
              title="حملات نشطة"
              subtitle="مساهمون موثّقون يجمعون الدعم بشفافية"
              action={
                <Link href="/campaigns" className="text-sm text-primary font-medium hover:underline">
                  عرض الكل ←
                </Link>
              }
              className="mb-5"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {campaigns.map((c) => (
                <Link key={c.id} href={`/campaigns/${c.id}`} className="block group">
                  <article className="rounded-2xl border border-border bg-surface p-5 hover:border-primary/40 hover:shadow-md hover:shadow-black/7 hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-primary text-primary-fg flex items-center justify-center text-xs font-bold shrink-0">
                        {c.contributor.name?.[0] ?? "م"}
                      </span>
                      <span className="text-xs text-muted-fg truncate">{c.contributor.name}</span>
                      <Badge variant="verified" className="ms-auto text-xs">موثّق</Badge>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 flex-1">
                      {c.title}
                    </h3>
                    <ProgressBar collected={c.raisedAmount} target={c.goalAmount} size="sm" />
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ══ LOST & FOUND TEASER ═══════════════════════════════════════ */}
        <section id="المنصة-أكبر" className="rounded-2xl bg-surface-alt border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4 text-center">المنصة أكبر من الحوجات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href: "/lost", icon: "🔍", title: "المفقودات", desc: "أبلّغ عن أشياء أو سيارات مفقودة" },
              { href: "/missing", icon: "🙏", title: "المفقودون", desc: "ابحث عن شخص أو أبلّغ عنه بأمان" },
              { href: "/found", icon: "📦", title: "المعثور عليه", desc: "لقيت حاجة لأهلها؟ بلّغ هنا" },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
              >
                <span className="text-2xl shrink-0">{s.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{s.title}</p>
                  <p className="text-xs text-muted-fg mt-0.5">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ FAQ ═══════════════════════════════════════════════════════ */}
        <section id="أسئلة-شائعة">
          <SectionHeading
            title="أسئلة شائعة"
            subtitle="كل ما تحتاج تعرفه قبل ما تبدأ"
            centered
            className="mb-7"
          />
          <Accordion items={FAQ_ITEMS} />
        </section>

      </div>

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="border-t border-border bg-surface-alt mt-4">
        <div className="mx-auto max-w-5xl px-4 py-10 grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
          <div className="flex flex-col gap-3">
            <p className="text-lg font-bold text-primary flex items-center gap-2">
              <span>🚛</span> القافلة
            </p>
            <p className="text-muted-fg leading-relaxed text-xs">
              منصة تنسيق الإغاثة في السودان — تربط المحتاجين بالداعمين مباشرةً.
            </p>
            <p className="text-xs text-subtle-fg">
              التحويل دائماً مباشر · لا عمولات · لا وساطة مالية
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-semibold text-foreground mb-1">حسابك</p>
            {[
              { href: "/register", label: "تسجيل جديد" },
              { href: "/login", label: "تسجيل الدخول" },
              { href: "/register/contributor", label: "التقديم كمساهم" },
              { href: "/profile", label: "ملفي الشخصي" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-muted-fg hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-border px-4 py-4 text-center text-xs text-subtle-fg">
          © {new Date().getFullYear()} القافلة — جميع الحقوق محفوظة
        </div>
      </footer>

    </div>
  );
}
