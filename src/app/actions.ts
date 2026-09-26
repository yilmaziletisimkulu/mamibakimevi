"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveFile, PUBLIC_UPLOAD, PRIVATE_UPLOAD, sentenceCase } from "@/lib/files";
import { localeFromParam } from "@/lib/i18n";
import { notifyAdminWhatsApp } from "@/lib/whatsapp";
import { requireAdmin, createAdminSession, destroyAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

function asList(form: FormData, key: string) {
  return form.getAll(key).map(String).filter(Boolean);
}

export async function submitApplication(formData: FormData) {
  const locale = localeFromParam(String(formData.get("locale") || "tr"));
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  // Telefon formatından rakamları temizle: "0 555 555 55 55" → "05555555555"
  const phone = String(formData.get("phone") || "").replace(/\s/g, "").trim();
  if (!firstName || !lastName || !phone) {
    redirect(`/${locale}/apply?error=1`);
  }
  const photo = formData.get("photo");
  let photoPath: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    try {
      const saved = await saveFile(photo, PUBLIC_UPLOAD, "photo");
      photoPath = saved.storedPath; // Supabase public URL
    } catch {
      // Fotoğraf yüklenemedi — devam et
    }
  }

  const caregiver = await prisma.caregiver.create({
    data: {
      firstName,
      lastName,
      gender: String(formData.get("gender") || "FEMALE"),
      birthYear: Number(formData.get("birthYear") || 0) || null,
      city: String(formData.get("city") || ""),
      district: String(formData.get("district") || ""),
      neighbourhood: String(formData.get("neighbourhood") || "") || null,
      phone,
      whatsapp: String(formData.get("whatsapp") || "") || null,
      email,
      languages: JSON.stringify(asList(formData, "languages")),
      careTypes: JSON.stringify(asList(formData, "careTypes")),
      workTypes: JSON.stringify(asList(formData, "workTypes")),
      experienceYears: Number(formData.get("experienceYears") || 0),
      bio: sentenceCase(String(formData.get("bio") || "")),
      photoPath,
      status: "PENDING",
      applicationLocale: locale,
    },
  });

  const docs = formData.getAll("documents");
  for (const doc of docs) {
    if (doc instanceof File && doc.size > 0) {
      try {
        const saved = await saveFile(doc, PRIVATE_UPLOAD, caregiver.id);
        await prisma.document.create({
          data: {
            caregiverId: caregiver.id,
            originalName: saved.originalName,
            storedPath: saved.storedPath,
            mimeType: saved.mimeType,
          },
        });
      } catch {
        // Belge yüklenemedi — devam et
      }
    }
  }

  // Admin'e WhatsApp bildirimi gönder
  const notice = [
    "🆕 Mami Bakimevi — yeni bakıcı başvurusu",
    `Ad: ${caregiver.firstName} ${caregiver.lastName}`,
    `Şehir: ${caregiver.city} / ${caregiver.district}`,
    `Dil: ${caregiver.applicationLocale.toUpperCase()}`,
    `Başvuru No: ${caregiver.id}`,
    `İncelemek için: /admin/applications/${caregiver.id}`,
  ].join("\n");
  try {
    await notifyAdminWhatsApp(notice);
  } catch {
    // Bildirim gönderilemezse başvuruyu yine de kaydet
  }

  redirect(`/${locale}/apply/success`);
}


export async function submitContactRequest(formData: FormData) {
  const locale = localeFromParam(String(formData.get("locale") || "tr"));
  const caregiverId = String(formData.get("caregiverId") || "");
  const seekerName = String(formData.get("seekerName") || "").trim();
  const seekerPhone = String(formData.get("seekerPhone") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!caregiverId || !seekerName || !seekerPhone || !message) {
    redirect(`/${locale}/contact/${caregiverId}?error=1`);
  }

  const caregiver = await prisma.caregiver.findFirst({
    where: { id: caregiverId, status: "APPROVED" },
  });
  if (!caregiver) redirect(`/${locale}/caregivers`);

  const request = await prisma.contactRequest.create({
    data: {
      caregiverId,
      seekerName,
      seekerPhone,
      seekerEmail: String(formData.get("seekerEmail") || "") || null,
      city: String(formData.get("city") || "") || null,
      district: String(formData.get("district") || "") || null,
      neighbourhood: String(formData.get("neighbourhood") || "") || null,
      careNeed: String(formData.get("careNeed") || "") || null,
      message,
      status: "NEW",
    },
  });

  const notice = [
    "Mami Bakimevi — yeni iletişim talebi",
    `Talep No: ${request.id}`,
    `Bakıcı: ${caregiver.firstName} ${caregiver.lastName}`,
    `Arayan: ${seekerName} / ${seekerPhone}`,
    `Mesaj: ${message.slice(0, 300)}`,
  ].join("\n");

  const result = await notifyAdminWhatsApp(notice);
  if (result.sent) {
    await prisma.contactRequest.update({
      where: { id: request.id },
      data: { whatsappNotified: true },
    });
  }

  redirect(`/${locale}/contact/${caregiverId}/success`);
}

export async function submitComplaint(formData: FormData) {
  const locale = localeFromParam(String(formData.get("locale") || "tr"));
  await prisma.complaint.create({
    data: {
      reporterName: String(formData.get("reporterName") || "").trim(),
      reporterPhone: String(formData.get("reporterPhone") || "") || null,
      subject: String(formData.get("subject") || "").trim(),
      body: String(formData.get("body") || "").trim(),
      caregiverId: String(formData.get("caregiverId") || "") || null,
      status: "NEW",
    },
  });
  redirect(`/${locale}/complaint?ok=1`);
}

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "ADMIN" || !user.passwordHash) {
    redirect("/admin/login?error=1");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) redirect("/admin/login?error=1");
  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function setApplicationStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const rejectionReason = String(formData.get("rejectionReason") || "") || null;
  await prisma.caregiver.update({
    where: { id },
    data: {
      status,
      rejectionReason: status === "REJECTED" ? rejectionReason : null,
      publishedAt: status === "APPROVED" ? new Date() : null,
    },
  });
  redirect(`/admin/applications/${id}`);
}

export async function toggleFeatured(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const current = await prisma.caregiver.findUnique({ where: { id }, select: { featured: true } });
  if (!current) return;
  await prisma.caregiver.update({
    where: { id },
    data: { featured: !current.featured },
  });
  redirect("/admin/caregivers");
}

export async function deleteCaregiver(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.caregiver.delete({ where: { id } });
  redirect("/admin/caregivers");
}

export async function changeAdminPassword(formData: FormData) {
  await requireAdmin();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    redirect("/admin/settings?pwError=1");
  }
  if (newPassword !== confirmPassword) {
    redirect("/admin/settings?pwError=2");
  }

  const adminEmail = "admin@mamibakimevi.com";
  const user = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!user?.passwordHash) redirect("/admin/settings?pwError=3");

  const ok = await bcrypt.compare(currentPassword, user.passwordHash!);
  if (!ok) redirect("/admin/settings?pwError=3");

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email: adminEmail }, data: { passwordHash: hash } });
  redirect("/admin/settings?pwOk=1");
}

export async function updateCaregiverAdmin(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  // Fotoğraf güncelleme
  const photo = formData.get("photo");
  let photoPath: string | undefined = undefined;
  if (photo instanceof File && photo.size > 0) {
    try {
      const saved = await saveFile(photo, PUBLIC_UPLOAD, "photo");
      photoPath = saved.storedPath; // Supabase public URL
    } catch {
      // Fotoğraf yüklenemedi
    }
  }

  await prisma.caregiver.update({
    where: { id },
    data: {
      firstName: String(formData.get("firstName") || ""),
      lastName: String(formData.get("lastName") || ""),
      city: String(formData.get("city") || ""),
      district: String(formData.get("district") || ""),
      phone: String(formData.get("phone") || ""),
      whatsapp: String(formData.get("whatsapp") || "") || null,
      email: String(formData.get("email") || ""),
      bio: sentenceCase(String(formData.get("bio") || "")),
      adminNotes: String(formData.get("adminNotes") || "") || null,
      experienceYears: Number(formData.get("experienceYears") || 0),
      ...(photoPath ? { photoPath } : {}),
    },
  });
  redirect(`/admin/caregivers/${id}`);
}

export async function updateRequestStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.contactRequest.update({
    where: { id },
    data: {
      status: String(formData.get("status")),
      adminNotes: String(formData.get("adminNotes") || "") || null,
    },
  });
  redirect(`/admin/requests/${id}`);
}

export async function updateComplaintStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.complaint.update({
    where: { id },
    data: {
      status: String(formData.get("status")),
      adminNotes: String(formData.get("adminNotes") || "") || null,
    },
  });
  redirect("/admin/complaints");
}

export async function saveJob(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const statusRaw = String(formData.get("status") || "DRAFT");
  const status = ["DRAFT", "PENDING", "PUBLISHED", "CLOSED"].includes(statusRaw)
    ? statusRaw
    : "DRAFT";
  const data = {
    title: String(formData.get("title") || ""),
    city: String(formData.get("city") || ""),
    district: String(formData.get("district") || "") || null,
    neighbourhood: String(formData.get("neighbourhood") || "") || null,
    careType: String(formData.get("careType") || "") || null,
    workType: String(formData.get("workType") || "") || null,
    careTypes: formData.has("careTypes")
      ? JSON.stringify(asList(formData, "careTypes"))
      : undefined,
    workTypes: formData.has("workTypes")
      ? JSON.stringify(asList(formData, "workTypes"))
      : undefined,
    description: String(formData.get("description") || ""),
    firstName: String(formData.get("firstName") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    whatsapp: String(formData.get("whatsapp") || "") || null,
    email: String(formData.get("email") || "") || null,
    rejectionReason: String(formData.get("rejectionReason") || "") || null,
    status,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
  };
  if (id) {
    await prisma.jobPosting.update({ where: { id }, data });
  } else {
    await prisma.jobPosting.create({
      data: { ...data, applicationLocale: (formData.get("locale") as string | undefined) || "tr" },
    });
  }
  redirect("/admin/jobs");
}

export async function submitJobPosting(formData: FormData) {
  const locale = localeFromParam(String(formData.get("locale") || "tr"));
  const title = String(formData.get("title") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  // PhoneInput'tan gelen "0 555 555 55 55" formatını temizle
  const phone = String(formData.get("phone") || "").replace(/\s/g, "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title || !city || !firstName || !phone || !description) {
    redirect(`/${locale}/jobs?error=1`);
  }

  const created = await prisma.jobPosting.create({
    data: {
      title,
      city,
      district: String(formData.get("district") || "") || null,
      neighbourhood: String(formData.get("neighbourhood") || "") || null,
      careTypes: JSON.stringify(asList(formData, "careTypes")),
      workTypes: JSON.stringify(asList(formData, "workTypes")),
      description,
      firstName,
      phone,
      whatsapp: String(formData.get("whatsapp") || "") || null,
      email: String(formData.get("email") || "") || null,
      status: "PENDING",
      applicationLocale: locale,
    },
  });

  const notice = [
    "🆕 Mami Bakimevi — yeni bakıcı arayan ilanı",
    `Başlık: ${created.title}`,
    `Konum: ${created.city}${created.district ? " / " + created.district : ""}`,
    `Dil: ${created.applicationLocale.toUpperCase()}`,
    `İlan No: ${created.id}`,
    `Gönderen: ${created.firstName} · ${created.phone}`,
    `İncelemek için: /admin/jobs`,
  ].join("\n");
  try {
    await notifyAdminWhatsApp(notice);
  } catch {
    // Bildirim gönderilemezse ilanı yine de kaydet
  }

  redirect(`/${locale}/jobs?ok=1`);
}

export async function setJobStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const next = String(formData.get("status"));
  const rejectionReason = String(formData.get("rejectionReason") || "") || null;
  if (!["DRAFT", "PENDING", "PUBLISHED", "CLOSED"].includes(next)) return;

  await prisma.jobPosting.update({
    where: { id },
    data: {
      status: next,
      rejectionReason: next === "CLOSED" ? rejectionReason : null,
      publishedAt: next === "PUBLISHED" ? new Date() : undefined,
    },
  });
  redirect("/admin/jobs");
}

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  const pairs = [
    ["whatsappEnabled", formData.get("whatsappEnabled") ? "true" : "false"],
    ["whatsappPhone", String(formData.get("whatsappPhone") || "")],
    ["whatsappToken", String(formData.get("whatsappToken") || "")],
  ] as const;
  for (const [key, value] of pairs) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  redirect("/admin/settings");
}
