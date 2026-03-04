export function detectTailwind(files: string[], deps: string[]): boolean {
  return files.some((f) => /(^|\/)tailwind\.config\./.test(f)) || deps.includes('tailwindcss');
}
