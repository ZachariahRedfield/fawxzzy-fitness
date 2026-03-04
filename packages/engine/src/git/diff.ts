import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function getChangedFiles(repoRoot: string, baseSha: string, headRef = 'HEAD'): Promise<string[]> {
  const { stdout } = await execFileAsync('git', ['diff', '--name-only', `${baseSha}..${headRef}`], { cwd: repoRoot });
  return stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
