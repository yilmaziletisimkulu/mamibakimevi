import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!;

// Service role key ile — sadece server-side kullanılır
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
