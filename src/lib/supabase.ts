import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://pymbwaukdmgsawglqxal.supabase.co";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bWJ3YXVrZG1nc2F3Z2xxeGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzQ0MDYsImV4cCI6MjA5NDgxMDQwNn0.qZN5HJeOAB-JdsTnZeB6fF9qK22XX6FDj91QCLvnSh4";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);