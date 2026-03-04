import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { loadConfig } from '@playbook/engine';
import { warn, info } from '../lib/output.js';

export async function runDoctor(cwd: string): Promise<void> {
  try {
    execFileSync('git', ['--version'], { stdio: 'ignore' });
    info('git: installed');
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { cwd, stdio: 'ignore' });
    info('git repo: yes');
  } catch {
    warn('git missing or current directory is not a git repository');
  }

  const { config, warning: configWarning } = await loadConfig(cwd);
  if (configWarning) warn(configWarning);
  else info('playbook config: present');

  for (const docPath of [config.docs.notesPath, config.docs.architecturePath, config.docs.governancePath, config.docs.checklistPath]) {
    if (existsSync(join(cwd, docPath))) info(`found: ${docPath}`);
    else warn(`missing: ${docPath}`);
  }

  info('next steps: run `playbook init`, then commit docs changes, then run `playbook verify`.');
}
