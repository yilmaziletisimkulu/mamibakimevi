import { notFound } from "next/navigation";
import { updateCaregiverAdmin, toggleFeatured } from "@/app/actions";
import { DeleteCaregiverButton } from "@/components/DeleteCaregiverButton";
import { prisma } from "@/lib/prisma";

export default async function CaregiverEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await prisma.caregiver.findUnique({ where: { id } });
  if (!c) notFound();

  return (
    <div className="max-w-2xl space-y-4">
      {/* Başlık + aksiyonlar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl">{c.firstName} {c.lastName}</h1>
        <div className="flex gap-2">
          {/* Öne çıkar */}
          <form action={toggleFeatured}>
            <input type="hidden" name="id" value={c.id} />
            <button
              type="submit"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                c.featured
                  ? "bg-gold/20 text-ink hover:bg-gold/40"
                  : "border border-gold/40 text-muted hover:bg-gold/10"
              }`}
            >
              {c.featured ? "⭐ Öne çıkarıldı — kaldır" : "⭐ Öne çıkar"}
            </button>
          </form>

          {/* Profili sil */}
          <DeleteCaregiverButton id={c.id} name={`${c.firstName} ${c.lastName}`} />
        </div>
      </div>

      {/* Düzenleme formu */}
      <form action={updateCaregiverAdmin} className="card space-y-4 p-6" encType="multipart/form-data">
        <input type="hidden" name="id" value={c.id} />

        {/* Mevcut fotoğraf + güncelleme */}
        <div>
          <p className="text-sm font-semibold mb-2">Profil fotoğrafı</p>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.photoPath || "/images/placeholder-caregiver.jpg"}
              alt="Mevcut fotoğraf"
              className="h-20 w-20 rounded-2xl object-cover"
            />
            <label className="field flex-1">
              Yeni fotoğraf yükle
              <input className="input" name="photo" type="file" accept="image/*" />
            </label>
          </div>
        </div>
        <label className="field">
          Ad
          <input className="input" name="firstName" defaultValue={c.firstName} />
        </label>
        <label className="field">
          Soyad
          <input className="input" name="lastName" defaultValue={c.lastName} />
        </label>
        <label className="field">
          Şehir
          <input className="input" name="city" defaultValue={c.city} />
        </label>
        <label className="field">
          İlçe
          <input className="input" name="district" defaultValue={c.district} />
        </label>
        <label className="field">
          Telefon
          <input className="input" name="phone" defaultValue={c.phone} />
        </label>
        <label className="field">
          WhatsApp
          <input className="input" name="whatsapp" defaultValue={c.whatsapp || ""} />
        </label>
        <label className="field">
          E-posta
          <input className="input" name="email" defaultValue={c.email} />
        </label>
        <label className="field">
          Deneyim (yıl)
          <input className="input" name="experienceYears" type="number" defaultValue={c.experienceYears} />
        </label>
        <label className="field">
          Hakkında
          <textarea className="input min-h-32" name="bio" defaultValue={c.bio} />
        </label>
        <label className="field">
          Admin notu
          <textarea className="input" name="adminNotes" defaultValue={c.adminNotes || ""} />
        </label>
        <button className="btn-primary" type="submit">Kaydet</button>
      </form>
    </div>
  );
}
