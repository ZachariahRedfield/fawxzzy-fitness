import type { NotesRuleEntry } from '../../config/schema.js';
import type { VerifyFailure } from '../../report/types.js';
import { matchesAnyGlob } from '../../util/globs.js';

export function requireNotesOnChanges(changedFiles: string[], rules: NotesRuleEntry[]): VerifyFailure[] {
  const failures: VerifyFailure[] = [];

  for (const rule of rules) {
    const triggerFiles = changedFiles.filter((file) => matchesAnyGlob(file, rule.whenChanged));
    if (triggerFiles.length === 0) continue;

    const touchedRequired = changedFiles.some((file) => matchesAnyGlob(file, rule.mustTouch));
    if (touchedRequired) continue;

    const evidenceFiles = triggerFiles.slice(0, 10).join(', ');
    failures.push({
      id: 'requireNotesOnChanges',
      message: 'Code changes require a Playbook notes update.',
      evidence: `${evidenceFiles}${triggerFiles.length > 10 ? ' …' : ''} (triggered by ${triggerFiles.length} changed file(s))`,
      fix: 'Update docs/PLAYBOOK_NOTES.md with a note describing WHAT changed and WHY.'
    });
  }

  return failures;
}
