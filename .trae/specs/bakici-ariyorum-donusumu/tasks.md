# "İş İlanları" → "Bakıcı Arıyorum" Dönüşümü - Implementation Plan

## Task 1: i18n mesajlarını ve isimlendirmeyi güncelle (tr.ts + ru.ts)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: None
- **Acceptance Criteria Addressed**: AC-1, AC-9
- **Test Requirements**:
  - `rule` TR-1.1: `tr.nav.jobs === "Bakıcı Arıyorum"` ve grep ile kaynakta "İş ilanları" geçmemesi
  - `rubric` TR-1.2: Boyut = i18n çeviri kalitesi; ölçek 1-5; eşik >= 4
- **Completion Evidence**:
  - TR-1.1: `tr.nav.jobs = "Bakıcı Arıyorum"`, `tr.jobs.title = "Bakıcı Arıyorum"` onaylandı. `Grep -R "İş ilanları" src/` → No matches (0 sonuç). `AdminNav.tsx` → "Bakıcı Arıyorum", `tr.ts nav.jobs` → "Bakıcı Arıyorum"
  - TR-1.2: Score 5/5. Hem tr.ts hem ru.ts'de 14+ yeni key (newPost, formIntro, formDisclaimer, ownerName, phone, whatsapp, email, city, district, neighbourhood, careTypes, workTypes, title, description, submit, successTitle, successText, contactOwner, whatsappCta, phoneCta, postedBy, jobStatusLabel + jobStatus nesnesi DRAFT/PENDING/PUBLISHED/CLOSED) tanımlı. RU çevirileri doğal ("Ищу сиделку", "Подать объявление", "На проверке" vb.). Eksik key yok; Messages type genişlemesine rağmen her key RU'da mevcut.

## Task 2: AdminNav ve JobPosting modelini + constants güncelle
- **Status**: `completed`
- **Priority**: high
- **Depends On**: None
- **Acceptance Criteria Addressed**: AC-5, AC-8
- **Test Requirements**:
  - `rule` TR-2.1: `constants.ts JOB_STATUSES` includes "PENDING" and length === 4
  - `rule` TR-2.2: `prisma validate` exit code 0
  - `rubric` TR-2.3: Boyut = geriye dönük uyumluluk; eşik >= 5
- **Completion Evidence**:
  - TR-2.1: `src/lib/constants.ts` satır 20: `export const JOB_STATUSES = ["DRAFT", "PENDING", "PUBLISHED", "CLOSED"]` → length 4 ve PENDING mevcut ✅
  - TR-2.2: `npx prisma validate` → exit code 0, "The schema at prisma/schema.prisma is valid" çıktısı ✅
  - TR-2.3: Score 5/5. `npx prisma db push` → exit code 0, "The database is already in sync with the Prisma schema" (eskiden JobPosting'de kolonlar zaten nullable String? idi, yeni ekler `firstName, phone, whatsapp, email, careTypes, workTypes, rejectionReason, applicationLocale String @default("tr"), publishedAt DateTime?` tümü String? veya default'lu. Eski kayıtlarda NULL/boş default ile doğru görüntülenecek. Prisma Client generate OK, supabase postgresql şeması eşitlendi.)

## Task 3: actions.ts'a yeni action'lar ekle (submitJobPosting + setJobStatus)
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 2
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `rule` TR-3.1: submitJobPosting required fields ile kayıt oluşturur, status = PENDING
  - `rule` TR-3.2: setJobStatus PENDING → PUBLISHED / CLOSED + rejectionReason
  - `rubric` TR-3.3: Boyut = aksiyon güvenliği; eşik >= 4
- **Completion Evidence**:
  - TR-3.1: Smoke test `OLUSTURULDU ID=cmuighfzj0000u2pw58d101i9 STATUS= PENDING` + `submitJobPosting` kodu zorunlu alanlarda boş ise `?error=1` redirect, geçerli ise `status: "PENDING"` create + notifyAdminWhatsApp çağrısı → OK
  - TR-3.2: `setJobStatus` kodu `["DRAFT","PENDING","PUBLISHED","CLOSED"].includes(next)` check → status + rejectionReason (sadece CLOSED'da set) + publishedAt (PUBLISHED'ta new Date). actions.ts 379-395 → OK
  - TR-3.3: Score 5/5. `requireAdmin()`: setJobStatus, saveJob zorunlu admin; submitJobPosting admin zorunluluğu YOK (doğru: ziyaretçi formu). Input validation: submitJobPosting 5 zorunlu alana göre `if (!title || !city || !firstName || !phone || !description) redirect error`. saveJob status whitelist ile geçerlilik kontrolü.

## Task 4: Admin jobs sayfasını yeniden düzenle
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Acceptance Criteria Addressed**: AC-3, AC-5
- **Test Requirements**:
  - `rule` TR-4.1: PENDING kayıtlar üst bölümde + Onayla butonu action setJobStatus status=PUBLISHED gönderir
  - `rule` TR-4.2: Reddet butonu status=CLOSED + rejectionReason gönderir
  - `rubric` TR-4.3: Boyut = admin UX; eşik >= 4
- **Completion Evidence**:
  - TR-4.1: `admin/jobs/page.tsx` section "Bekleyen onaylar" → `.where status=PENDING` + formda hidden status=PUBLISHED + action=setJobStatus ✅
  - TR-4.2: Aynı sayfa, form içinde `rejectionReason` input + hidden status=CLOSED + action=setJobStatus, onSubmit teyidi ✅
  - TR-4.3: Score 5/5. Sayfa 4 bölümlü: (1) Bekleyen onaylar - sarı badge, border, onay/red/taslak butonları, gönderen tel/ws/email, (2) Yayında olanlar - yeşil badge, kapat/taslağa al, (3) Yeni ilan ekle formu - status select 4 seçenek (DRAFT/PENDING/PUBLISHED/CLOSED) + default PUBLISHED, (4) Kapandı / Taslak - closed+drafts birleşik, yeniden yayınla butonu. Status renkli badge: DRAFT(sky), PENDING(amber), PUBLISHED(emerald), CLOSED(zinc).

## Task 5: Public jobs sayfasına form + listeleme kartı iyileştirmeleri
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1, Task 3
- **Acceptance Criteria Addressed**: AC-2, AC-4, AC-7
- **Test Requirements**:
  - `rule` TR-5.1: findMany where koşulu `status: "PUBLISHED"`
  - `rule` TR-5.2: Kart HTML'inde href="https://wa.me/" linki
  - `rubric` TR-5.3: Boyut = ziyaretçi formu UX; eşik >= 4
- **Completion Evidence**:
  - TR-5.1: `[locale]/jobs/page.tsx` satır 48-54: `where: { status: "PUBLISHED" }` → DRAFT/PENDING/CLOSED listelenmez ✅
  - TR-5.2: Aynı dosya `<a href="https://wa.me/${phoneRaw}?text=..." target="_blank" rel="noreferrer">` → wa.me linki kesin ✅
  - TR-5.3: Score 5/5. Form structure:  (1) PageBanner → title/subtitle "Bakıcı Arıyorum", (2) Success banner ?ok=1, (3) Error banner ?error=1, (4) "İlan ver" section, formIntro + formDisclaimer, (5) title input, (6) CityDistrictFields client component (şehir/ilçe/mahalle dinamik), (7) careTypes + workTypes chip groups (checkbox + inline seçim), (8) firstName + phone + whatsapp + email 2 kolonlu grid, (9) description textarea + submit butonu. Listeleme kartında başlık + tarih + careTypes/workTypes color chip + description + footer postedBy + tel + wa.me ile önceden doldurulmuş metin.

## Task 6: Build, lint, typecheck ve smoke test
- **Status**: `completed`
- **Priority**: high
- **Depends On**: Task 1, 2, 3, 4, 5
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `rule` TR-6.1: `eslint` kendi değişen dosyalarım için exit code 0
  - `rule` TR-6.2: `prisma validate` exit code 0
  - `rule` TR-6.3: Smoke test adımları başarılı
- **Completion Evidence**:
  - TR-6.1: `npx eslint src/app/[locale]/jobs/page.tsx src/app/admin/(panel)/jobs/page.tsx src/app/actions.ts src/messages/tr.ts src/messages/ru.ts src/lib/constants.ts src/components/AdminNav.tsx` → exit code 0 (1 warning sadece prisma/prisma dosyası ignore) ✅
  - TR-6.2: `prisma validate` (Task 2'de) → exit code 0 ✅
  - TR-6.3: smoke-test-job.ts → `OLUSTURULDU ID=cmuighfzj0000u2pw58d101i9 STATUS= PENDING`, `PENDING SAYISI= 1`, `PUBLISHED var mi= 1`, `TEMIZLENDI` ve exit 0. Mevcut published eski kayıtlarda firstName/phone null (eski kayıtlar) — AC-7 backward uyum OK ✅
