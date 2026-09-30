import Link from "next/link";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { CaregiverCard } from "@/components/CaregiverCard";
import { localeFromParam, getMessages, tPath } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = localeFromParam(raw);
  const t = getMessages(locale);

  let featured: Awaited<ReturnType<typeof prisma.caregiver.findMany>> = [];
  try {
    featured = await prisma.caregiver.findMany({
      where: { status: "APPROVED", featured: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    });
    // featured yoksa son onaylananları göster
    if (featured.length === 0) {
      featured = await prisma.caregiver.findMany({
        where: { status: "APPROVED" },
        orderBy: { publishedAt: "desc" },
        take: 4,
      });
    }
  } catch {
    // DB bağlantısı yoksa boş liste ile devam et
  }

  const steps = [t.home.step1, t.home.step2, t.home.step3, t.home.step4];

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="relative min-h-[420px] md:min-h-[520px]">
          <HeroSlideshow alt={t.home.heroImageAlt} />
          <div className="absolute inset-0 bg-teal-dark/60" />
          <div className="relative z-10 mx-auto flex min-h-[420px] max-w-6xl flex-col justify-end px-4 py-16 md:min-h-[520px]">
            <p className="text-sm font-semibold tracking-wide text-gold">{t.brand}</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-cream md:text-5xl">
              {t.home.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-cream/90">{t.home.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" href={tPath(locale, "/caregivers")}>
                {t.home.searchCta}
              </Link>
              <Link
                className="rounded-full border border-cream/40 px-5 py-3 font-semibold text-cream"
                href={tPath(locale, "/apply")}
              >
                {t.home.applyCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
        <div className="card p-8">
          <h2 className="font-serif text-3xl">{t.home.howTitle}</h2>
          <ol className="mt-6 space-y-4">
            {steps.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm text-white">
                  {i + 1}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative min-h-[280px] overflow-hidden rounded-3xl">
          <Image
            src="/images/apply-caregiver.jpg"
            alt={t.images.apply}
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
      </section>

      <section className="relative min-h-[240px] overflow-hidden py-16 text-cream">
        <Image
          src="/images/trust-hands.jpg"
          alt={t.home.trustImageAlt}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-teal-dark/75" />
        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <h2 className="font-serif text-3xl">{t.home.trustTitle}</h2>
          <p className="mt-3 max-w-3xl text-cream/90">{t.home.trustText}</p>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-serif text-3xl">{t.home.featured}</h2>
            <Link className="text-sm font-semibold text-teal" href={tPath(locale, "/caregivers")}>
              {t.home.searchCta}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c) => (
              <CaregiverCard key={c.id} locale={locale} caregiver={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
