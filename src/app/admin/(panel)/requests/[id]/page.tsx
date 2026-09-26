import { notFound } from "next/navigation";
import { updateRequestStatus } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export default async function RequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await prisma.contactRequest.findUnique({
    where: { id },
    include: { caregiver: true },
  });
  if (!r) notFound();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-serif text-4xl">İletişim talebi</h1>
      <div className="card space-y-2 p-6 text-sm">
        <p>
          <b>Arayan:</b> {r.seekerName} · {r.seekerPhone} · {r.seekerEmail || "—"}
        </p>
        <p>
          <b>Konum:</b> {r.city} / {r.district}
        </p>
        <p>
          <b>İhtiyaç:</b> {r.careNeed || "—"}
        </p>
        <p className="whitespace-pre-wrap">{r.message}</p>
        <hr />
        <p>
          <b>Bakıcı:</b> {r.caregiver?.firstName} {r.caregiver?.lastName}
        </p>
        <p>
          <b>Bakıcı telefon:</b> {r.caregiver?.phone}
        </p>
        <p>
          <b>Bakıcı WhatsApp:</b> {r.caregiver?.whatsapp || "—"}
        </p>
      </div>
      <form action={updateRequestStatus} className="card space-y-3 p-6">
        <input type="hidden" name="id" value={r.id} />
        <label className="field">
          Durum
          <select className="input" name="status" defaultValue={r.status}>
            <option value="NEW">Yeni</option>
            <option value="IN_PROGRESS">İnceleniyor</option>
            <option value="CONNECTED">Taraflar tanıştırıldı</option>
            <option value="CLOSED">Kapandı</option>
          </select>
        </label>
        <label className="field">
          Admin notu
          <textarea className="input" name="adminNotes" defaultValue={r.adminNotes || ""} />
        </label>
        <button className="btn-primary" type="submit">
          Kaydet
        </button>
      </form>
    </div>
  );
}
