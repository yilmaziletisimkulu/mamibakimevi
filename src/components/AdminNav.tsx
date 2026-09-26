import Link from "next/link";
import { adminLogout } from "@/app/actions";

const LINKS = [
  ["Özet", "/admin"],
  ["Başvurular", "/admin/applications"],
  ["Bakıcılar", "/admin/caregivers"],
  ["İletişim talepleri", "/admin/requests"],
  ["Bakıcı Arıyorum", "/admin/jobs"],
  ["Kullanıcılar", "/admin/users"],
  ["Şikayetler", "/admin/complaints"],
  ["Ayarlar", "/admin/settings"],
] as const;

export function AdminNav() {
  return (
    <aside className="w-full shrink-0 border-b border-ink/10 bg-teal-dark p-4 text-cream md:min-h-screen md:w-60 md:border-b-0 md:border-r">
      <Link href="/admin" className="font-serif text-2xl">
        Mami Admin
      </Link>
      <nav className="mt-6 flex flex-wrap gap-2 md:flex-col">
        {LINKS.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/tr"
          className="flex items-center gap-2 rounded-lg border border-cream/20 px-3 py-2 text-sm text-cream/80 hover:bg-white/10"
        >
          ← Ana Sayfaya Dön
        </Link>
        <form action={adminLogout}>
          <button className="text-sm text-cream/70 underline" type="submit">
            Çıkış
          </button>
        </form>
      </div>
    </aside>
  );
}
