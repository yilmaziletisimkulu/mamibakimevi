import { submitApplication } from "@/app/actions";
import { CityDistrictFields } from "@/components/CityDistrictFields";
import { PhoneInput } from "@/components/PhoneInput";
import { PageBanner } from "@/components/PageBanner";
import { CARE_TYPES, GENDERS, LANGUAGES, WORK_TYPES } from "@/lib/constants";
import { localeFromParam, getMessages } from "@/lib/i18n";

export default async function ApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = localeFromParam(raw);
  const t = getMessages(locale);
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageBanner
        src="/images/apply-caregiver.jpg"
        alt={t.images.apply}
        title={t.apply.title}
        subtitle={t.apply.subtitle}
      />
      {error ? <p className="mt-4 text-terracotta">{t.apply.error}</p> : null}
      <form action={submitApplication} className="card mt-8 space-y-5 p-6" encType="multipart/form-data">
        <input type="hidden" name="locale" value={locale} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="field">
            {t.apply.firstName}
            <input
              className="input capitalize"
              name="firstName"
              required
              autoCapitalize="words"
            />
          </label>
          <label className="field">
            {t.apply.lastName}
            <input
              className="input capitalize"
              name="lastName"
              required
              autoCapitalize="words"
            />
          </label>
          <label className="field">
            {t.apply.gender}
            <select className="input" name="gender" required>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{t.gender[g]}</option>
              ))}
            </select>
          </label>
          <label className="field">
            {t.apply.birthYear}
            <input className="input" name="birthYear" type="number" min={1940} max={2010} />
          </label>
          <CityDistrictFields
            cityLabel={t.apply.city}
            districtLabel={t.apply.district}
            neighbourhoodLabel={t.apply.neighbourhood}
          />
          <label className="field">
            {t.apply.phone}
            <PhoneInput name="phone" required placeholder="0 555 555 55 55" />
          </label>
          <label className="field">
            {t.apply.whatsapp}
            <PhoneInput name="whatsapp" placeholder="0 555 555 55 55" />
          </label>
          <label className="field md:col-span-2">
            {t.apply.email}
            <span className="ml-1 text-xs font-normal text-muted">(isteğe bağlı)</span>
            <input className="input" name="email" type="email" />
          </label>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t.apply.languages}</legend>
          <div className="flex flex-wrap gap-3">
            {LANGUAGES.map((l) => (
              <label key={l} className="flex items-center gap-2 text-sm font-normal">
                <input type="checkbox" name="languages" value={l} defaultChecked={l === locale} />
                {t.spoken[l]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t.apply.careTypes}</legend>
          <div className="flex flex-wrap gap-3">
            {CARE_TYPES.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm font-normal">
                <input type="checkbox" name="careTypes" value={c} />
                {t.care[c]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">{t.apply.workTypes}</legend>
          <div className="flex flex-wrap gap-3">
            {WORK_TYPES.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm font-normal">
                <input type="checkbox" name="workTypes" value={c} />
                {t.work[c]}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field">
          {t.apply.experience}
          <input className="input" name="experienceYears" type="number" min={0} required />
        </label>
        <label className="field">
          {t.apply.bio}
          <textarea
            className="input min-h-32 capitalize"
            name="bio"
            required
            autoCapitalize="sentences"
          />
        </label>
        <label className="field">
          {t.apply.photo}
          <input className="input" name="photo" type="file" accept="image/*" />
        </label>
        <label className="field">
          {t.apply.documents}
          <input className="input" name="documents" type="file" multiple />
        </label>
        <button className="btn-primary w-full" type="submit">
          {t.apply.submit}
        </button>
      </form>
    </div>
  );
}
