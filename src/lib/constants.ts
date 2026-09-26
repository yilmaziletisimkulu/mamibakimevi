export const LOCALES = ["tr", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

export const GENDERS = ["FEMALE", "MALE"] as const;
export const WORK_TYPES = ["LIVE_IN", "DAYTIME", "HOURLY", "FLEXIBLE"] as const;
export const CARE_TYPES = [
  "ELDERLY",
  "PATIENT",
  "ALZHEIMER",
  "DISABILITY",
  "POST_OP",
  "PALLIATIVE",
] as const;
export const LANGUAGES = ["tr", "ru", "uz", "en", "ar", "fa"] as const;

export const APPLICATION_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const REQUEST_STATUSES = ["NEW", "IN_PROGRESS", "CONNECTED", "CLOSED"] as const;
export const COMPLAINT_STATUSES = ["NEW", "REVIEWED", "RESOLVED", "DISMISSED"] as const;
export const JOB_STATUSES = ["DRAFT", "PENDING", "PUBLISHED", "CLOSED"] as const;

export const CITIES: Record<string, string[]> = {
  İstanbul: [
    "Kadıköy", "Üsküdar", "Beşiktaş", "Şişli", "Bakırköy",
    "Ataşehir", "Maltepe", "Pendik", "Sarıyer", "Fatih",
    "Beylikdüzü", "Başakşehir",
  ],
  Ankara: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan"],
  İzmir: ["Konak", "Karşıyaka", "Bornova", "Buca", "Çiğli", "Balçova"],
  Antalya: ["Muratpaşa", "Konyaaltı", "Kepez", "Alanya", "Manavgat"],
  Konya: [
    "Selçuklu", "Meram", "Karatay", "Akşehir", "Beyşehir",
    "Ereğli", "Ilgın", "Kadınhanı", "Kulu", "Sarayönü",
    "Seydişehir", "Yunak", "Ahırlı", "Akören", "Altınekin",
    "Bozkır", "Cihanbeyli", "Çeltik", "Çumra", "Derbent",
    "Derebucak", "Doğanhisar", "Emirgazi", "Güneysınır", "Hadim",
    "Halkapınar", "Hüyük", "Karapınar", "Taşkent", "Tuzlukçu",
    "Yalıhüyük",
  ],
  Mersin: ["Yenişehir", "Mezitli", "Toroslar"],
};

export const CITY_NAMES = Object.keys(CITIES);

// Şehir → İlçe → Mahalle (3. seviye)
// Şu an sadece Konya/Kulu tanımlı, diğer ilçeler için boş bırakılabilir
export const NEIGHBOURHOODS: Record<string, Record<string, string[]>> = {
  Konya: {
    Kulu: [
      "Acıkuyu",
      "Ağılbaşı",
      "Alparslan",
      "Altılar",
      "Arşıncı",
      "Bahadırlı",
      "Beşkardeş",
      "Bozan",
      "Burunağıl",
      "Camikebir",
      "Canımana",
      "Celep",
      "Cumhuriyet",
      "Değirmenözü",
      "Dinek",
      "Dipdede",
      "Doğutepe",
      "Fatih Sultan Mehmet",
      "Fevziye",
      "Gökler",
      "Güzelyayla",
      "Hisarköy",
      "Karacadağ",
      "Karacadere",
      "Karapınar",
      "Karşıyaka",
      "Kemaliye",
      "Kırkkuyu",
      "Kırkpınar",
      "Kömüşini",
      "Köşker",
      "Köstengil",
      "Kozanlı",
      "Ömeranlı",
      "Sarıyayla",
      "Seyitahmetli",
      "Soğukkuyu",
      "Şerefli",
      "Tavlıören",
      "Tuzyaka",
      "Yaraşlı",
      "Yazıçayırı",
      "Yenimahalle",
      "Yeşiltepe",
      "Yeşilyurt",
      "Zincirlikuyu",
    ],
  },
};
