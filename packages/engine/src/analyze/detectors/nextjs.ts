export function detectNextjs(files: string[], deps: string[]): boolean {
  return files.some((f) => /(^|\/)next\.config\./.test(f) || f.startsWith('app/') || f.startsWith('pages/')) || deps.includes('next');
}
