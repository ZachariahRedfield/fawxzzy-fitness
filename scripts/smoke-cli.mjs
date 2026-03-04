import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const cli = join(root, 'packages/cli/dist/main.js');

execFileSync('node', [cli, '--help'], { stdio: 'inherit' });

const temp = mkdtempSync(join(tmpdir(), 'playbook-smoke-'));
execFileSync('git', ['init'], { cwd: temp, stdio: 'ignore' });
execFileSync('git', ['config', 'user.email', 'smoke@example.com'], { cwd: temp });
execFileSync('git', ['config', 'user.name', 'Smoke Test'], { cwd: temp });

execFileSync('node', [cli, 'init'], { cwd: temp, stdio: 'inherit' });
mkdirSync(join(temp, 'src'), { recursive: true });
writeFileSync(join(temp, 'src/foo.ts'), 'export const foo = 1;\n');
execFileSync('git', ['add', '.'], { cwd: temp });
execFileSync('git', ['commit', '-m', 'initial'], { cwd: temp });
writeFileSync(join(temp, 'src/foo.ts'), 'export const foo = 2;\n');
execFileSync('git', ['add', 'src/foo.ts'], { cwd: temp });
execFileSync('git', ['commit', '-m', 'change src'], { cwd: temp });

let failed = false;
try {
  execFileSync('node', [cli, 'verify'], { cwd: temp, stdio: 'pipe' });
} catch {
  failed = true;
}
if (!failed) {
  throw new Error('verify should fail when notes are not updated');
}

writeFileSync(join(temp, 'docs/PLAYBOOK_NOTES.md'), '# Playbook Notes\n\n- WHAT changed: foo\n- WHY it changed: smoke\n');
execFileSync('git', ['add', 'docs/PLAYBOOK_NOTES.md'], { cwd: temp });
execFileSync('git', ['commit', '-m', 'update notes'], { cwd: temp });
execFileSync('node', [cli, 'verify'], { cwd: temp, stdio: 'inherit' });
