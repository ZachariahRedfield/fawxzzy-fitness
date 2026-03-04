import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { copyTemplateFile } from '../lib/fs.js';
import { info } from '../lib/output.js';

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

export function runInit(cwd: string): void {
  const thisFile = fileURLToPath(import.meta.url);
  const templateRoot = join(dirname(thisFile), '../templates/repo');
  const files = walk(templateRoot);
  for (const source of files) {
    const rel = relative(templateRoot, source);
    const destination = join(cwd, rel);
    const result = copyTemplateFile(source, destination);
    info(`${result}: ${rel}`);
  }
}
