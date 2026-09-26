import { randomBytes } from "crypto";
import path from "path";
import { getSupabaseAdmin } from "./supabase";

export const PUBLIC_UPLOAD = "photos";    // Supabase Storage bucket adı
export const PRIVATE_UPLOAD = "documents"; // Supabase Storage bucket adı

export async function saveFile(
  file: File,
  destDir: string,
  prefix: string,
): Promise<{ storedPath: string; originalName: string; mimeType: string }> {
  const ext = path.extname(file.name || "").slice(0, 8) || "";
  const name = `${prefix}-${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;

  // destDir'den bucket adını belirle
  const bucket = destDir === PUBLIC_UPLOAD || destDir.includes("photos")
    ? "photos"
    : "documents";

  const filePath = name;
  const buf = Buffer.from(await file.arrayBuffer());

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, buf, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

  // Public URL oluştur (photos bucket public olacak)
  const { data } = getSupabaseAdmin().storage.from(bucket).getPublicUrl(filePath);

  return {
    storedPath: data.publicUrl,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
  };
}

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function ageFromYear(year?: number | null) {
  if (!year) return null;
  return new Date().getFullYear() - year;
}

export function sentenceCase(text: string | null | undefined): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed[0].toLocaleUpperCase("tr-TR") + trimmed.slice(1);
}
