import Link from "next/link";
import { notFound } from "next/navigation";
import { parseList, ageFromYear, sentenceCase } from "@/lib/files";
import { localeFromParam, getMessages } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

const ADMIN_WHATSAPP = "905556874803";

function buildWaMessage(locale: string, caregiver: {
  firstName: string; lastName: string; city: string; district: string; experienceYears: number;
}) {
  if (locale === "ru") {
    return `Здравствуйте! Я хочу связаться через Mami Bakımevi.\n\nСиделка: ${caregiver.firstName} ${caregiver.lastName[0]}.\nГород: ${caregiver.city} / ${caregiver.district}\nОпыт: ${caregiver.experienceYears} лет`;
  }
  return `Merhaba, Mami Bakımevi üzerinden iletişime geçmek istiyorum.\n\nBakıcı: ${caregiver.firstName} ${caregiver.lastName[0]}.\nŞehir: ${caregiver.city} / ${caregiver.district}\nDeneyim: ${caregiver.experienceYears} yıl`;
}

export default async function CaregiverProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  const locale = localeFromParam(raw);
  const t = getMessages(locale);

  let caregiver: Awaited<ReturnType<typeof prisma.caregiver.findFirst>> = null;
  try {
    caregiver = await prisma.caregiver.findFirst({
      where: { id, status: "APPROVED" },
    });
  } catch {
    notFound();
  }
  if (!caregiver) notFound();

  const langs = parseList(caregiver.languages);
  const cares = parseList(caregiver.careTypes);
  const works = parseList(caregiver.workTypes);
  const age = ageFromYear(caregiver.birthYear);

  const waUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    buildWaMessage(locale, caregiver)
  )}`;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-[280px_1fr]">
      <aside className="card overflow-hidden">
        <div className="relative aspect-[4/5] bg-sage/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={caregiver.photoPath || "/images/placeholder-caregiver.jpg"}
            alt={t.images.portrait}
            className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
          />
        </div>
        <div className="p-5">
          <h1 className="font-serif text-3xl">
            {caregiver.firstName} {caregiver.lastName[0]}.
          </h1>
          <p className="mt-1 text-sm text-muted">
            {caregiver.city} / {caregiver.district}
            {caregiver.neighbourhood ? ` · ${caregiver.neighbourhood}` : ""}
            {age ? ` · ${age}` : ""}
          </p>
          <Link
            className="btn-primary mt-6 block w-full text-center"
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.profile.contactCta}
          </Link>
          <p className="mt-3 text-xs text-muted">{t.profile.hiddenContact}</p>
        </div>
      </aside>
      <section className="space-y-6">
        <div className="card p-6">
          <h2 className="font-serif text-2xl">{t.profile.experience}</h2>
          <p className="mt-2">
            {caregiver.experienceYears} {t.search.years}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-muted first-letter:text-2xl first-letter:font-serif first-letter:font-semibold first-letter:text-teal">{sentenceCase(caregiver.bio)}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-5">
            <h3 className="text-sm font-semibold">{t.profile.languages}</h3>
            <p className="mt-2 text-sm">
              {langs.map((l) => t.spoken[l as keyof typeof t.spoken] || l).join(", ")}
            </p>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold">{t.profile.careTypes}</h3>
            <p className="mt-2 text-sm">
              {cares.map((c) => t.care[c as keyof typeof t.care] || c).join(", ")}
            </p>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold">{t.profile.workTypes}</h3>
            <p className="mt-2 text-sm">
              {works.map((w) => t.work[w as keyof typeof t.work] || w).join(", ")}
            </p>
          </div>
        </div>
        <p className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
          {t.profile.disclaimer}
        </p>
      </section>
    </div>
  );
}
