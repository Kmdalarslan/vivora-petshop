import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yuwfwopyujbnfncscqkz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d2Z3b3B5dWpibmZuY3NjcWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTQzMTYsImV4cCI6MjA5MDM3MDMxNn0.BKEG3SUb-2x_0omvi62bkj5E_YYo_fwS-9B9XqgVIEI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
