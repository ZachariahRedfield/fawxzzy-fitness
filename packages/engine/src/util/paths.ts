import { resolve } from 'node:path';

export function resolveRepoPath(repoRoot: string, relPath: string): string {
  return resolve(repoRoot, relPath);
}
