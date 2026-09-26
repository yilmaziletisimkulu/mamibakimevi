import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  let pending = 0, approved = 0, requests = 0, complaints = 0, users = 0;
  try {
    [pending, approved, requests, complaints, users] = await Promise.all([
      prisma.caregiver.count({ where: { status: "PENDING" } }),
      prisma.caregiver.count({ where: { status: "APPROVED" } }),
      prisma.contactRequest.count({ where: { status: "NEW" } }),
      prisma.complaint.count({ where: { status: "NEW" } }),
      prisma.user.count(),
    ]);
  } catch {
    // DB hatası olsa da sayfa açılsın
  }

  const cards = [
    ["Bekleyen başvurular", pending, "/admin/applications?status=PENDING"],
    ["Yayınlanan bakıcılar", approved, "/admin/caregivers"],
    ["Yeni iletişim talepleri", requests, "/admin/requests"],
    ["Yeni şikayetler", complaints, "/admin/complaints"],
    ["Kullanıcılar", users, "/admin/users"],
  ] as const;

  return (
    <div>
      <h1 className="font-serif text-4xl">Özet</h1>
      <p className="mt-2 text-muted">
        Bakıcı başvuruları otomatik yayınlanmaz. İletişim bilgileri yalnızca bu panelde görünür.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <Link key={href} href={href} className="card p-6 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-serif text-4xl text-teal-dark">{value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
