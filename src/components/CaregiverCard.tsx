import Link from "next/link";
import { parseList, sentenceCase } from "@/lib/files";
import { getMessages, tPath } from "@/lib/i18n";
import type { Locale } from "@/lib/constants";
import type { Caregiver } from "@prisma/client";

export function CaregiverCard({
  locale,
  caregiver,
}: {
  locale: Locale;
  caregiver: Caregiver;
}) {
  const t = getMessages(locale);
  const langs = parseList(caregiver.languages);
  const cares = parseList(caregiver.careTypes);
  const works = parseList(caregiver.workTypes);

  const isNew =
    caregiver.publishedAt &&
    Date.now() - new Date(caregiver.publishedAt).getTime() < 15 * 24 * 60 * 60 * 1000;

  return (
    <article className="card overflow-hidden">
      <div className="relative aspect-[4/5] bg-sage/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={caregiver.photoPath || "/images/placeholder-caregiver.jpg"}
          alt={t.images.portrait}
          className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
        />
        {isNew && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold text-ink shadow">
            {locale === "ru" ? "Новый" : "Yeni"}
          </span>
        )}
        {caregiver.featured && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-teal px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
            ⭐
          </span>
        )}
      </div>
      <div className="space-y-1.5 p-3.5">
        <h3 className="font-serif text-xl leading-tight">
          {caregiver.firstName} {caregiver.lastName[0]}.
        </h3>
        <p className="text-xs text-muted">
          {caregiver.city} / {caregiver.district} · {caregiver.experienceYears}{" "}
          {t.search.years}
        </p>
        <p className="flex flex-wrap gap-1 text-[11px]">
          {langs.map((l) => (
            <span key={l} className="rounded-full bg-cream px-2 py-0.5">
              {t.spoken[l as keyof typeof t.spoken] || l}
            </span>
          ))}
        </p>
        <p className="line-clamp-2 text-xs text-muted first-letter:font-semibold first-letter:text-teal-dark">{sentenceCase(caregiver.bio)}</p>
        <div className="flex flex-wrap gap-1 text-[11px] text-teal-dark">
          {cares.map((c) => (
            <span key={c}>{t.care[c as keyof typeof t.care] || c}</span>
          ))}
          {works.map((w) => (
            <span key={w}>· {t.work[w as keyof typeof t.work] || w}</span>
          ))}
        </div>
        <Link
          className="btn-primary mt-1.5 w-full px-3 py-2 text-xs"
          href={tPath(locale, `/caregivers/${caregiver.id}`)}
        >
          {t.search.viewProfile}
        </Link>
      </div>
    </article>
  );
}
