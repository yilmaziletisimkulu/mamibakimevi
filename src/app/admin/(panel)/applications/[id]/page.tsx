import { notFound } from "next/navigation";
import { setApplicationStatus } from "@/app/actions";
import { parseList, sentenceCase } from "@/lib/files";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "⏳ Beklemede",
  APPROVED: "✅ Onaylı",
  REJECTED: "❌ Reddedildi",
};

export default async function ApplicationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await prisma.caregiver.findUnique({
    where: { id },
    include: { documents: true },
  });
  if (!c) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">{c.firstName} {c.lastName}</h1>
          <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            c.status === "APPROVED" ? "bg-teal/10 text-teal" :
            c.status === "REJECTED" ? "bg-terracotta/10 text-terracotta" :
            "bg-gold/20 text-ink"
          }`}>
            {STATUS_LABEL[c.status] || c.status}
          </span>
        </div>

        {/* Hızlı onay/red butonları */}
        {c.status === "PENDING" && (
          <div className="flex gap-2 shrink-0">
            <form action={setApplicationStatus}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="status" value="APPROVED" />
              <button className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal-dark">
                ✅ Onayla
              </button>
            </form>
            <form action={setApplicationStatus}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="status" value="REJECTED" />
              <button className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                ❌ Reddet
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="card space-y-2 p-6 text-sm">
        <p><b>Telefon:</b> {c.phone}</p>
        <p><b>WhatsApp:</b> {c.whatsapp || "—"}</p>
        <p><b>E-posta:</b> {c.email}</p>
        <p><b>Konum:</b> {c.city} / {c.district}{c.neighbourhood ? ` / ${c.neighbourhood}` : ""}</p>
        <p><b>Diller:</b> {parseList(c.languages).join(", ")}</p>
        <p><b>Bakım türleri:</b> {parseList(c.careTypes).join(", ")}</p>
        <p><b>Çalışma tercihi:</b> {parseList(c.workTypes).join(", ")}</p>
        <p><b>Deneyim:</b> {c.experienceYears} yıl</p>
        <p className="whitespace-pre-wrap pt-2 border-t border-ink/10 first-letter:text-lg first-letter:font-serif first-letter:font-semibold">{sentenceCase(c.bio)}</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Belgeler</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {c.documents.length === 0 ? <li className="text-muted">Belge yok</li> : null}
          {c.documents.map((d) => (
            <li key={d.id}>
              <a className="text-teal underline" href={`/api/admin/documents/${d.id}`}>
                {d.originalName}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Detaylı karar formu */}
      <form action={setApplicationStatus} className="card space-y-3 p-6">
        <h2 className="font-semibold">Karar güncelle</h2>
        <input type="hidden" name="id" value={c.id} />
        <label className="field">
          Durum
          <select className="input" name="status" defaultValue={c.status}>
            <option value="PENDING">Beklemede</option>
            <option value="APPROVED">Onayla ve yayınla</option>
            <option value="REJECTED">Reddet</option>
          </select>
        </label>
        <label className="field">
          Red gerekçesi
          <textarea className="input" name="rejectionReason" defaultValue={c.rejectionReason || ""} />
        </label>
        <button className="btn-primary" type="submit">Kaydet</button>
      </form>
    </div>
  );
}
