import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function copyTemplateFile(source: string, destination: string): 'copied' | 'skipped' {
  if (existsSync(destination)) return 'skipped';
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: false });
  return 'copied';
}
