import { saveJob, setJobStatus } from "@/app/actions";
import { prisma } from "@/lib/prisma";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: "bg-sky-100 text-sky-800",
    PENDING: "bg-amber-100 text-amber-800",
    PUBLISHED: "bg-emerald-100 text-emerald-800",
    CLOSED: "bg-zinc-200 text-zinc-700",
  };
  const label: Record<string, string> = {
    DRAFT: "Taslak",
    PENDING: "Onay bekliyor",
    PUBLISHED: "Yayında",
    CLOSED: "Kapatıldı",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] || ""}`}>
      {label[status] || status}
    </span>
  );
}

export default async function JobsAdminPage() {
  const all = await prisma.jobPosting.findMany({ orderBy: { createdAt: "desc" } });
  const pending = all.filter((j) => j.status === "PENDING");
  const published = all.filter((j) => j.status === "PUBLISHED");
  const closed = all.filter((j) => j.status === "CLOSED");
  const drafts = all.filter((j) => j.status === "DRAFT");

  return (
    <div className="space-y-10">
      {/* Bekleyen onaylar */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl">Bekleyen onaylar</h1>
            <p className="text-sm text-muted">
              Ziyaretçiler tarafından gönderilmiş, yayınlanmayı bekleyen ilanlar.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            {pending.length} onay bekliyor
          </span>
        </div>
        {pending.length === 0 ? (
          <div className="card mt-4 p-6 text-sm text-muted">
            Bekleyen ilan yok. Harika!
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((j) => (
              <li key={j.id} className="card space-y-3 p-5 border-l-4 border-amber-400">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {statusBadge(j.status)}
                      <p className="font-semibold text-lg">{j.title}</p>
                    </div>
                    <p className="text-sm text-muted mt-1">
                      {j.city}{j.district ? ` / ${j.district}` : ""}{j.neighbourhood ? ` / ${j.neighbourhood}` : ""}
                      {" · "}
                      {new Date(j.createdAt).toLocaleString("tr-TR")}
                    </p>
                    <p className="text-sm mt-2 whitespace-pre-wrap line-clamp-3">{j.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-sm">
                    <div>
                      <span className="text-muted">Gönderen: </span>
                      <span className="font-semibold">{j.firstName}</span>
                    </div>
                    {j.phone && (
                      <a className="text-teal hover:underline" href={`tel:${j.phone.replace(/\D/g, "")}`}>
                        ☎ {j.phone}
                      </a>
                    )}
                    {j.whatsapp && (
                      <a className="text-emerald-700 hover:underline" href={`https://wa.me/${j.whatsapp.replace(/\D/g, "")}`}>
                        💬 WhatsApp
                      </a>
                    )}
                    {j.email && <div className="text-muted">{j.email}</div>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3">
                  <form action={setJobStatus}>
                    <input type="hidden" name="id" value={j.id} />
                    <input type="hidden" name="status" value="PUBLISHED" />
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      ✅ Yayınla
                    </button>
                  </form>
                  <form
                    action={setJobStatus}
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      const reason = (e.currentTarget.elements.namedItem("rejectionReason") as HTMLInputElement);
                      if (reason && !reason.value.trim()) {
                        if (!confirm("Red sebebi girmediniz. Yine de kapatmak istediğinize emin misiniz?")) e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={j.id} />
                    <input type="hidden" name="status" value="CLOSED" />
                    <input
                      className="input !w-56 !py-1.5"
                      name="rejectionReason"
                      placeholder="Red sebebi (isteğe bağlı)"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-terracotta/10 px-4 py-1.5 text-sm font-semibold text-terracotta hover:bg-terracotta/20"
                    >
                      ❌ Reddet / Kapat
                    </button>
                  </form>
                  <form action={setJobStatus}>
                    <input type="hidden" name="id" value={j.id} />
                    <input type="hidden" name="status" value="DRAFT" />
                    <button
                      type="submit"
                      className="rounded-full border border-ink/20 px-4 py-1.5 text-sm font-semibold text-muted hover:bg-ink/5"
                    >
                      📝 Taslağa al
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Yayınlananlar */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-serif text-2xl">Yayında olan ilanlar</h2>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
            {published.length} yayın
          </span>
        </div>
        {published.length === 0 ? (
          <div className="card mt-4 p-6 text-sm text-muted">Yayında ilan yok.</div>
        ) : (
          <ul className="mt-4 space-y-3">
            {published.map((j) => (
              <li key={j.id} className="card flex flex-wrap items-start justify-between gap-4 p-5 border-l-4 border-emerald-400">
                <div>
                  <div className="flex items-center gap-2">
                    {statusBadge(j.status)}
                    <p className="font-semibold">{j.title}</p>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    {j.city}{j.district ? ` / ${j.district}` : ""}
                    {j.firstName ? ` · ${j.firstName}` : ""}
                    {j.phone ? ` · ☎ ${j.phone}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={setJobStatus}>
                    <input type="hidden" name="id" value={j.id} />
                    <input type="hidden" name="status" value="CLOSED" />
                    <button
                      type="submit"
                      className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-semibold hover:bg-zinc-100"
                    >
                      🔒 Kapat
                    </button>
                  </form>
                  <form action={setJobStatus}>
                    <input type="hidden" name="id" value={j.id} />
                    <input type="hidden" name="status" value="DRAFT" />
                    <button
                      type="submit"
                      className="rounded-full border border-sky-300 px-4 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-50"
                    >
                      ↩ Taslağa al
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Kapalı + taslak + Yeni ilan */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Yeni ilan */}
        <form action={saveJob} className="card space-y-3 p-6">
          <h2 className="font-serif text-2xl">Yeni ilan ekle (manuel)</h2>
          <label className="field">
            Başlık
            <input className="input" name="title" required />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="field">
              Şehir
              <input className="input" name="city" required />
            </label>
            <label className="field">
              İlçe
              <input className="input" name="district" />
            </label>
          </div>
          <label className="field">
            İlan sahibi (Ad soyad)
            <input className="input" name="firstName" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="field">
              Telefon
              <input className="input" name="phone" />
            </label>
            <label className="field">
              WhatsApp
              <input className="input" name="whatsapp" />
            </label>
          </div>
          <label className="field">
            Açıklama
            <textarea className="input min-h-24" name="description" required />
          </label>
          <label className="field">
            Durum
            <select className="input" name="status" defaultValue="PUBLISHED">
              <option value="DRAFT">Taslak</option>
              <option value="PENDING">Onay bekliyor</option>
              <option value="PUBLISHED">Yayınla</option>
              <option value="CLOSED">Kapalı</option>
            </select>
          </label>
          <button className="btn-primary" type="submit">
            Kaydet
          </button>
        </form>

        {/* Diğerleri */}
        <div>
          <h2 className="font-serif text-2xl">Kapandı / Taslak</h2>
          {closed.length === 0 && drafts.length === 0 ? (
            <div className="card mt-4 p-6 text-sm text-muted">Kayıt yok.</div>
          ) : (
            <ul className="mt-4 space-y-3">
              {[...closed, ...drafts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).map((j) => (
                <li key={j.id} className="card flex flex-wrap items-start justify-between gap-4 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {statusBadge(j.status)}
                      <p className="font-semibold">{j.title}</p>
                    </div>
                    <p className="text-sm text-muted mt-1">
                      {j.city}{j.district ? ` / ${j.district}` : ""}
                      {j.firstName ? ` · ${j.firstName}` : ""}
                    </p>
                    {j.rejectionReason && (
                      <p className="text-xs text-terracotta mt-1">
                        Red sebebi: {j.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={setJobStatus}>
                      <input type="hidden" name="id" value={j.id} />
                      <input type="hidden" name="status" value="PUBLISHED" />
                      <button
                        type="submit"
                        className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        ✅ Yeniden yayınla
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
