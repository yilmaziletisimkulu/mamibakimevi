import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service role key ile — sadece server-side kullanılır
// Lazy init: build sırasında env okunmaz, ilk kullanımda oluşturulur
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Supabase çevre değişkenleri eksik: NEXT_PUBLIC_SUPABASE_URL ve/veya SUPABASE_SECRET_KEY tanımlı olmalı.",
    );
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  return _supabaseAdmin;
}

