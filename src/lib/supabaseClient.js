import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigError = !supabaseUrl || !supabasePublishableKey
  ? "Supabaseの環境変数が設定されていません。"
  : null;

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabasePublishableKey);
