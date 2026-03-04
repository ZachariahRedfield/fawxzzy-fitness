import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

async function runGit(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync('git', args, { cwd });
  return stdout.trim();
}

export async function getMergeBase(repoRoot: string, baseRef: string, headRef = 'HEAD'): Promise<string | undefined> {
  try {
    const sha = await runGit(['merge-base', baseRef, headRef], repoRoot);
    return sha || undefined;
  } catch {
    return undefined;
  }
}

export async function selectBase(repoRoot: string): Promise<{ baseRef?: string; baseSha?: string; warning?: string }> {
  const candidates = ['origin/main', 'main'];
  for (const ref of candidates) {
    const baseSha = await getMergeBase(repoRoot, ref, 'HEAD');
    if (baseSha) return { baseRef: ref, baseSha };
  }

  try {
    const baseSha = await runGit(['rev-parse', 'HEAD~1'], repoRoot);
    return { baseRef: 'HEAD~1', baseSha };
  } catch {
    return { warning: 'No git base found; treating as no changes' };
  }
}
