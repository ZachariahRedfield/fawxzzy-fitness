import { loadConfig } from '../config/load.js';
import { getChangedFiles } from '../git/diff.js';
import { selectBase } from '../git/base.js';
import type { VerifyReport } from '../report/types.js';
import { requireNotesOnChanges } from './rules/requireNotesOnChanges.js';

export async function verifyRepo(repoRoot: string): Promise<VerifyReport> {
  const warnings: VerifyReport['warnings'] = [];
  const { config, warning: configWarning } = await loadConfig(repoRoot);
  if (configWarning) warnings.push({ id: 'config-defaulted', message: configWarning });

  const base = await selectBase(repoRoot);
  if (base.warning) warnings.push({ id: 'git-base', message: base.warning });

  const changedFiles = base.baseSha ? await getChangedFiles(repoRoot, base.baseSha) : [];
  const failures = requireNotesOnChanges(changedFiles, config.verify.rules.requireNotesOnChanges);

  return {
    ok: failures.length === 0,
    summary: {
      failures: failures.length,
      warnings: warnings.length,
      baseRef: base.baseRef,
      baseSha: base.baseSha
    },
    failures,
    warnings
  };
}
