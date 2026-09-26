# "İş İlanları" → "Bakıcı Arıyorum" Dönüşümü - Product Requirements Document

## Overview
- **Summary**: Mevcut "İş İlanları" (JobPosting) modülünün adını "Bakıcı Arıyorum" olarak değiştirip ziyaretçilerin (ailelerin) bakıcı arama ilanı gönderebileceği, admin onayından sonra yayınlanacağı kapalı bir akışa dönüştürmek.
- **Purpose**: Normal "bakıcı arayan aile, bakıcı seçer" akışının tersi bir kanal sunmak. Aileler ilan verir, bakıcılar onları görüp WhatsApp/iletişim ile ulaşır. Tüm ilanlar admin onaylı olmalı (spam ve uygunsuz içerik engeli).
- **Target Users**:
  - Ziyaretçi / Aile (Bakıcı arayan, anonim form gönderir)
  - Admin (ilan onayı, red, silme, düzenleme)
  - Bakıcı (sadece yayınlanmış ilanları okur, kendi insiyatifiyle iletişime geçer)

## Goals
- Menü, sayfa başlıkları, i18n mesajlarında "İş ilanları" ismini "Bakıcı Arıyorum" (tr) ve karşılığında uygun RU başlığıyla değiştirmek.
- Ziyaretçilerin `/jobs` sayfasından ilan gönderebileceği form eklemek.
- Gönderilen her ilanı otomatik `PENDING` statüsüne almak, asla doğrudan yayınlamamak.
- Admin panelinde bekleyen (PENDING) ilanlar için onay/red akışı tanımlamak.
- Yayınlanan ilan kartlarında iletişim bilgisi + WhatsApp yönlendirmesi göstermek.
- Mevcut "DRAFT, PUBLISHED, CLOSED" statü kümesine "PENDING" eklemek.

## Non-Goals
- **Başvuru butonu / formu eklemek değil**: Bakıcıların ilana tıklayıp formla başvurması bu kapsamda değil. Sadece ilanların yayınlanması ve bakıcının kendi insiyatifiyle iletişime geçmesi.
- Kayıtlı kullanıcı zorunluluğu yok: Ziyaretçi üye olmadan form doldurur.
- Bildirim sistemi entegrasyonu (zorunlu değil): WhatsApp bildirimi opsiyonel bırakılır, varsa çalışır yoksa panelden yönetilir.

## Background & Context
- Mevcut durum: `JobPosting` modeli `schema.prisma`'da `DRAFT, PUBLISHED, CLOSED` statüsüyle tanımlı.
  - Admin `/admin/jobs` sayfasından **direkt PUBLISHED seçerek** ilan açabiliyor.
  - Ziyaretçi `/jobs` sayfasında sadece yayınlanmışları okuyor, gönderemiyor.
- Kullanıcının önerisi: "Bakıcı Arıyorum" ismi daha anlaşılır. Ziyaretçi form doldursun, admin onaylasın.
- İlişkili model referansı: `Caregiver` başvuru akışındaki `PENDING → APPROVED / REJECTED` paterni aynen iş ilanlarına uyarlanacak.

## Functional Requirements

- **FR-1 (İsimlendirme / İ18N)**: Navigasyon, sayfa başlıkları, form başlıkları ve admin sidebar'da "İş ilanları" ifadesi Türkçe'de "Bakıcı Arıyorum" olarak değişir. Rusça'da "Ищу сиделку" (veya eşanlamlı doğal ifade) kullanılır. `about.p3` içindeki geçmiş/gelecek metinlerde de geçen ifade güncellenir.
- **FR-2 (Ziyaretçi formu)**: `/{locale}/jobs` rotasında, ilan listesinin **üstünde** bir yer "İlan ver" formu bulunur. Alanlar: Başlık (zorunlu), Şehir (zorunlu, seçim), İlçe (seçim, opsiyonel), Mahalle (opsiyonel), Bakım türü (çoklu seçim, bakıcı başvurusundaki gibi), Çalışma tercihi (çoklu seçim), Ad Soyad (zorunlu, iletişim için ama gizli tutulur), Telefon (zorunlu), WhatsApp (opsiyonel), E-posta (opsiyonel), Açıklama (zorunlu). Gönderim sonrası `status = "PENDING"` olur ve başarı/teşekkür mesajı gösterilir.
- **FR-3 (Statü kümesi)**: `JOB_STATUSES` ve `schema.prisma` (varsa model üzerinden enum kullanılıyorsa) `PENDING` statüsünü ekler: `DRAFT, PENDING, PUBLISHED, CLOSED`. Yeni gönderilenler otomatik `PENDING`'dir. Admin UI'da listeler status renkleri/badgeleriyle ayrılır.
- **FR-4 (Admin onay akışı)**: `/admin/jobs` sayfası 3 bölüme ayrılır: (1) Bekleyen ilanlar (PENDING) — her biri için Onayla / Reddet butonları + red sebebi alanı, (2) Yayınlananlar (PUBLISHED + CLOSED) — düzenleme/silme/kapatma, (3) Yeni ilan formu (admin manuel ekleyebilmesi için). `saveJob` action'ı güncellenerek yeni alanları destekler; `setJobStatus` action eklenir (onay/red/kapat/draft döngüsü).
- **FR-5 (Kartlarda iletişim)**: Yayınlanan ilan kartında açıklamanın altında "İlan sahibiyle iletişim" bölümü; WhatsApp butonu (`wa.me/{phone}`) ve/veya "Telefonunu gör" butonu (admin onaylı ise numara gösterilir). Not: Telefon/WApp bilgisi admin onayından sonra gösterilebilir.
- **FR-6 (Listeleme filtresi)**: Frontend `/jobs` sayfasında sadece `status = "PUBLISHED"` olanlar listelenmeye devam eder, ayrıca `CLOSED` olanlar görünmez.

## Non-Functional Requirements
- **NFR-1 Güvenlik**: Ziyaretçi formu `requireAdmin` olmadan çalışır ama rate limit / brute force basit seviyede (form başına 1 dk bekleme, sunucu tarafında denetlenmese de en azından hidden honeypot alanı veya form nonce uygulanmazsa zarar vermez; en düşük seviyede: boş gönderim engellenir).
- **NFR-2 Veritabanı geriye dönük uyumluluk**: Mevcut `JobPosting` kayıtları varsa şemada kolon eklerken hepsi `String? @default(...)` olmalı. Migration yerine `prisma db push` kullanıldığı için varolan kayıtlar bozulmamalı.
- **NFR-3 Dil tutarlılığı**: Tüm yeni alanlar hem `tr.ts` hem `ru.ts` mesajlarında anahtar/değer olarak tam tanımlanmalı. Eksik key TS derleme hatası vermeli (`Messages` type strict olduğu için).
- **NFR-4 UX**: Gönderilen form sonrası URL'de `?ok=1` query parametresi ile başarı banner'ı gösterilmeli (başvuru / şikayet formları paternine benzer).

## Constraints
- **Technical**: Proje Next.js 16 App Router + Server Actions (`.actions.ts` "use server") kullanıyor. Yeni action'lar `actions.ts`'e eklenecek, ayrı API route dosyası yok. Prisma tek ORM, Supabase PG tek DB.
- **Business**: İlanların telefonda yayınlanmadan önce admin gözünden geçmesi şart (müşteri şartı). Ziyaretçinin kişisel verileri (tel, wa) gizli tutulur; sadece yayınlanmış ilanlarda - ve admin isterse - gösterilir.
- **Dependencies**: Prisma Client yeniden `generate` edilmeli, sonrasında `build` geçmeli. Netlify deploy sonrası env'e dokunulmuyor (yeni env anahtarı gerekmiyor).

## Assumptions
- Ziyaretçi formunda "Ad Soyad / Telefon" zorunlu, admin bu bilgilere göre ilanı değerlendirecek.
- Yayınlanan ilanlarda telefon gösterilsin (kullanıcıdan onaylıyse veya hep gösterilsin - decision: her zaman göster, çünkü aile bakıcı arıyor, iletişim kurması bekleniyor).
- Mevcut admin "Yeni iş ilanı" formunda status default'u `PUBLISHED` yerine `PENDING` yapılmaz, adminin `PUBLISHED` olarak direkt göndermesine izin verilir (admin onayı kendi gönderdiği için).
- WhatsApp bildirimi yoksa (env boşsa) form çalışmaya devam eder, sadece bildirim eksik olur.

## Acceptance Criteria

### AC-1: Tüm kullanıcı yüzeylerinde isim değişikliği uygulanmış
- **Type**: `rule`
- **Given**: Türkçe dil seçili, site ana sayfası açılmış
- **When**: Header navigasyonu, footer (geçiyorsa), `/jobs` sayfası başlığı, admin sidebar kontrol edilir
- **Then**: "İş ilanları" ifadesi hiçbir yerde görünmez; yerine "Bakıcı Arıyorum" ifadesi geçer
- **Pass Condition**: `grep -r "İş ilanları" src/` boş döner; `tr.nav.jobs`, `tr.jobs.title` Türkçe "Bakıcı Arıyorum" şeklindedir
- **Evidence**: Source code grep + TS derlemesinde type check OK

### AC-2: Ziyaretçi ilan gönderme formu mevcut ve çalışıyor
- **Type**: `rule`
- **Given**: Ziyaretçi `/tr/jobs` sayfasında
- **When**: Form doldurulur (başlık + şehir + ad soyad + telefon + açıklama minimum zorunlu alanlar) ve gönderilir
- **Then**: DB'ye `JobPosting` kaydı `status = "PENDING"` olarak eklenir, sayfada `?ok=1` ile başarı mesajı görünür
- **Pass Condition**: Prisma count sorgusunda yeni kayıt + status alanı doğrulanır. URL'de `ok=1` görülür.
- **Evidence**: Form submit → DB query `SELECT status FROM "JobPosting" ORDER BY "createdAt" DESC LIMIT 1` sonucu `PENDING`

### AC-3: Admin panelinde bekleyen ilan onay/red akışı
- **Type**: `rule`
- **Given**: DB'de status=PENDING en az 1 ilan var, admin giriş yapmış
- **When**: `/admin/jobs` sayfası açılır → "Onayla" butonuna tıklanır
- **Then**: İlan statüsü `PUBLISHED` olur, yayınlanma tarihi (publishedAt benzeri, yoksa createdAt) korunur; aynısı için "Reddet" sonrası status = `CLOSED` + rejectionReason saklanır
- **Pass Condition**: 2 ayrı test (onay & red) sonrası DB status değerleri doğru
- **Evidence**: Action return redirect sonrası DB sorgusu

### AC-4: Yayınlanan ilanlarda iletişim bilgisi + WhatsApp butonu
- **Type**: `rule`
- **Given**: Yayınlanmış bir ilan `/tr/jobs` sayfasında
- **When**: İlan kartına bakılır
- **Then**: Kart içinde telefon numarası (gizli değil) ve/veya "WhatsApp ile iletişim kur" butonu `https://wa.me/XXX` linkiyle bulunur
- **Pass Condition**: HTML'de `wa.me` domainine yönlendiren href bulunur, telefon text olarak gösterilir
- **Evidence**: Render edilmiş sayfa HTML snapshot'ı

### AC-5: Yeni statü değeri PENDING şema + kodda her yerde tanımlı
- **Type**: `rule`
- **Given**: Kod ağacı tam taranır
- **When**: `constants.ts` JOB_STATUSES, forms'taki select optionları, actions'taki status guard'ları kontrol edilir
- **Then**: DRAFT, PENDING, PUBLISHED, CLOSED dördü de constants'ta listelenmiştir; admin panelindeki status select'inde PENDING vardır
- **Pass Condition**: `constants.ts JOB_STATUSES` 4 elemanlı ve "PENDING" içerir
- **Evidence**: constants.ts satır okuması + TS typecheck

### AC-6: Build ve lint başarılı
- **Type**: `rule`
- **Given**: Tüm değişiklikler uygulanmış
- **When**: `npx eslint` ve `npx prisma validate` + `npm run build` (veya en azından `next build` öncesi typecheck `tsc`) çalıştırılır
- **Then**: Exit code 0, type hatası ve lint hatası yok
- **Pass Condition**: Komutların hepsinin exit code 0 olması
- **Evidence**: Komut çıktıları

### AC-7: Mevcut DRAFT / PUBLISHED / CLOSED statüsüne sahip eski kayıtlar çalışmaya devam eder
- **Type**: `rule`
- **Given**: DB'de karışık statülerde JobPosting kayıtları var
- **When**: `/jobs` sayfası açılır
- **Then**: Sadece PUBLISHED statüsündekiler listelenir; DRAFT, PENDING, CLOSED listede görünmez
- **Pass Condition**: Prisma findMany where koşulu doğrulanır (`status: "PUBLISHED"`)
- **Evidence**: jobs/page.tsx findMany sorgusu + render edilen kart sayısı kontrolü

### AC-8: Yeni kolonlara sahip JobPosting modeli Geriye dönük uyumlu
- **Type**: `rubric`
- **Dimension**: Geriye dönük uyumluluk / sıfır veri kaybı skoru
- **Scale**: 1-5
- **Anchors**: 1 = prisma db push hata verir, 3 = push geçer ama bazı kolonlar eski kayıtlarda beklenmedik null gösterir, 5 = push hatasız, tüm eski kayıtlar null/defaultlar ile doğru görüntülenir
- **Pass Threshold**: >= 5
- **Evidence**: `npx prisma db push --skip-generate` exit 0 + mevcut kayıtların listelenmesinde hata olmaması

### AC-9: Dil çevirisi eksiksizliği
- **Type**: `rubric`
- **Dimension**: i18n key kapsama oranı + çeviri kalitesi
- **Scale**: 1-5
- **Anchors**: 1 = TR'de bile eksik anahtar var; 3 = TR tam, RU'da eksik/uygunsuz çeviriler; 5 = TR ve RU'da her yeni form alanı, status, buton metni doğal ve eksiksiz çevrilmiş
- **Pass Threshold**: >= 4
- **Evidence**: `tr.ts` ve `ru.ts` anahtarlarının karşılaştırmalı satır okuması

## Open Questions
- [x] Yayınlanan ilanlarda telefon her zaman gösterilsin mi? → EVET (karar: aile arıyor, iletişim beklenir)
- [x] Reddetme sonrası status değeri ne olsun? → `CLOSED` (yeni bir statü eklemek yerine mevcut `CLOSED` + `rejectionReason` ile)
- [ ] Forma admin onayı metni (sizin hakkınızda yayınlanmadan önce admin kontrolünden geçer) eklensin mi?
