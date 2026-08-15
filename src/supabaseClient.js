import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Isso só aparece se o .env não foi configurado — ver README.md.
  console.error(
    "Faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Configure o arquivo .env (veja README.md)."
  );
}

export const supabase = createClient(url, anonKey);
