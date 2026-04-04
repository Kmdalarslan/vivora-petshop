import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yuwfwopyujbnfncscqkz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gtPr3-VjBYKEIJoU-IbT3Q_teL_mg56";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
