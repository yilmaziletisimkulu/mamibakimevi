import { localeFromParam, getMessages } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { PageBanner } from "@/components/PageBanner";
import { CityDistrictFields } from "@/components/CityDistrictFields";
import { PhoneInput } from "@/components/PhoneInput";
import { submitJobPosting } from "@/app/actions";
import { CARE_TYPES, WORK_TYPES } from "@/lib/constants";

function ChipGroup({
  legend,
  name,
  options,
  labels,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  labels: Record<string, string>;
}) {
  return (
    <fieldset className="field">
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((key) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 text-sm has-[:checked]:bg-teal has-[:checked]:text-white has-[:checked]:border-teal transition-all"
          >
            <input type="checkbox" name={name} value={key} className="accent-teal" />
            {labels[key] || key}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default async function JobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const locale = localeFromParam((await params).locale);
  const t = getMessages(locale);
  const sp = await searchParams;

  const ADMIN_WHATSAPP = "905556874803";

  let jobs: Awaited<ReturnType<typeof prisma.jobPosting.findMany>> = [];
  try {
    jobs = await prisma.jobPosting.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    // DB bağlantısı yoksa boş liste ile devam et
  }

  const careLabels: Record<string, string> = locale === "ru"
    ? { ELDERLY: "Уход за пожилыми", PATIENT: "Уход за больными", ALZHEIMER: "Альцгеймер", DISABILITY: "Уход при инвалидности", POST_OP: "После операции", PALLIATIVE: "Паллиатив" }
    : { ELDERLY: "Yaşlı bakımı", PATIENT: "Hasta bakımı", ALZHEIMER: "Alzheimer / demans", DISABILITY: "Engelli bakımı", POST_OP: "Ameliyat sonrası", PALLIATIVE: "Palyatif bakım" };
  const workLabels: Record<string, string> = locale === "ru"
    ? { LIVE_IN: "С проживанием", DAYTIME: "Дневной", HOURLY: "Почасовой", FLEXIBLE: "Гибкий" }
    : { LIVE_IN: "Yatılı", DAYTIME: "Gündüzlü", HOURLY: "Saatlik", FLEXIBLE: "Esnek" };

  function parseList(raw: string | null | undefined, keys: readonly string[]): string[] {
    if (!raw) return [];
    try {
      const arr: unknown = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter((x): x is string => typeof x === "string" && keys.includes(x));
    } catch {
      /* ignore */
    }
    return [];
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <PageBanner
        src="/images/jobs-home.jpg"
        alt={t.images.jobs}
        title={t.jobs.title}
        subtitle={t.jobs.subtitle}
      />

      {/* Başarı / hata banner */}
      {sp.ok === "1" && (
          <div className="card border-emerald/20 mt-8 border bg-emerald/5 p-5">
          <h3 className="font-serif text-2xl text-emerald-900">{t.jobs.successTitle}</h3>
          <p className="mt-1 text-sm text-emerald-900/80">{t.jobs.successText}</p>
        </div>
      )}
      {sp.error === "1" && (
          <div className="card mt-8 border-terracotta/20 border bg-terracotta/5 p-5">
          <p className="font-semibold text-terracotta">{locale === "ru" ? "Форма не сохранена. Проверьте обязательные поля." : "Form kaydedilemedi. Lütfen zorunlu alanları doldurun."}</p>
        </div>
      )}

      {/* İlan ver formu */}
      <section className="card mt-10 space-y-4 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl">{t.jobs.newPost}</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">{t.jobs.formIntro}</p>
          </div>
        </div>
        <p className="text-xs text-muted">{t.jobs.formDisclaimer}</p>

        <form action={submitJobPosting} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="locale" value={locale} />

          <label className="field md:col-span-2">
            {t.jobs.postTitle}
            <input className="input" name="title" required placeholder={locale === "ru" ? "Например: Кону ищет сиделку для пожилой мамы" : "Örn: Kulu'da anneme bakıcı arıyorum"} />
          </label>

          <CityDistrictFields
            cityLabel={t.jobs.city}
            districtLabel={t.jobs.district}
            neighbourhoodLabel={t.jobs.neighbourhood}
          />

          <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
            <ChipGroup
              legend={t.jobs.careTypes}
              name="careTypes"
              options={CARE_TYPES}
              labels={careLabels}
            />
            <ChipGroup
              legend={t.jobs.workTypes}
              name="workTypes"
              options={WORK_TYPES}
              labels={workLabels}
            />
          </div>

          <label className="field">
            {t.jobs.ownerName}
            <input className="input capitalize" name="firstName" required autoCapitalize="words" placeholder={locale === "ru" ? "Фамилия Имя" : "Ad Soyad"} />
          </label>
          <label className="field">
            {t.jobs.phone}
            <PhoneInput name="phone" required placeholder="0 555 555 55 55" />
          </label>
          <label className="field md:col-span-2">
            {t.jobs.email}
            <span className="ml-1 text-xs font-normal text-muted">(isteğe bağlı)</span>
            <input className="input" name="email" type="email" />
          </label>

          <label className="field md:col-span-2">
            {t.jobs.description}
            <textarea
              className="input min-h-32"
              name="description"
              required
              placeholder={
                locale === "ru"
                  ? "Расскажите о человеке, которому нужен уход: возраст, состояние, пожелания к сиделке, зарплата, начало работы и т.д."
                  : "Bakıma ihtiyacı olan kişi hakkında bilgi verin: yaş, durum, bakıcıdan beklentiler, ücret, işe başlama tarihi vb."
              }
            />
          </label>

          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="btn-primary">
              {t.jobs.submit}
            </button>
          </div>
        </form>
      </section>

      {/* İlan listesi */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-3xl">
            {locale === "ru" ? "Опубликованные объявления" : "Yayınlanan ilanlar"}
          </h2>
          <span className="text-sm text-muted">
            {jobs.length} {locale === "ru" ? (jobs.length === 1 ? "объявление" : "объявлени") : "ilan"}
          </span>
        </div>
        {jobs.length === 0 ? (
          <p className="mt-10 card p-6 text-muted">{t.jobs.empty}</p>
        ) : (
          <div className="mt-6 space-y-5">
            {jobs.map((job) => {
              const cts = parseList(job.careTypes, CARE_TYPES);
              const wts = parseList(job.workTypes, WORK_TYPES);
              const jobCity = job.city + (job.district ? ` / ${job.district}` : "") + (job.neighbourhood ? ` / ${job.neighbourhood}` : "");
              const adminWaText = locale === "ru"
                ? `Здравствуйте! Я сиделка и заинтересовалась объявлением на Mami Bakimevi.\n\n📋 Объявление: ${job.title}\n📍 Город: ${jobCity}\n👤 Отправитель: ${job.firstName || "—"}\n\nХочу узнать детали и уточнить, подходит ли мне эта работа. Мои контакты ниже.`
                : `Merhaba! Mami Bakimevi'deki ilanla ilgilenen bakıcıyım.\n\n📋 İlan: ${job.title}\n📍 Şehir: ${jobCity}\n👤 İlan sahibi: ${job.firstName || "—"}\n\nDetayları öğrenmek ve kendimi tanıtmak istiyorum. Kendi iletişim bilgilerimi iletmeme yardımcı olun.`;
              return (
                <article key={job.id} className="card p-6">
                  <header className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl">{job.title}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {jobCity}
                        {job.publishedAt ? ` · ${new Date(job.publishedAt).toLocaleDateString(locale === "ru" ? "ru-RU" : "tr-TR")}` : job.createdAt ? ` · ${new Date(job.createdAt).toLocaleDateString(locale === "ru" ? "ru-RU" : "tr-TR")}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-right text-sm">
                      {cts.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cts.map((c) => (
                            <span key={c} className="rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal">
                              {careLabels[c] || c}
                            </span>
                          ))}
                        </div>
                      )}
                      {wts.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {wts.map((w) => (
                            <span key={w} className="rounded-full bg-amber/10 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                              {workLabels[w] || w}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </header>

                  <p className="mt-4 whitespace-pre-wrap">{job.description}</p>

                  <footer className="mt-6 border-t border-ink/10 pt-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">
                        {t.jobs.postedBy}
                      </p>
                      {job.firstName && <p className="font-semibold">{job.firstName}</p>}
                      <p className="mt-1 text-xs text-muted">
                        {t.jobs.privateContact}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(adminWaText)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                      >
                        {t.jobs.applyCta}
                      </a>
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
