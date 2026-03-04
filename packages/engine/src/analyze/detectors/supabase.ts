export function detectSupabase(files: string[], deps: string[]): boolean {
  return files.some((f) => f.startsWith('supabase/')) || deps.includes('@supabase/supabase-js');
}
