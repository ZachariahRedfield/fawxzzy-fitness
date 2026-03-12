import fs from 'node:fs';
import path from 'node:path';
import { appendExecutionStep, completeExecutionRun, recordFailureCause } from '../../../engine/src/execution/updateExecutionRun';
import { stableId, nowIso } from '../../../engine/src/execution/utils';
import { resolveOrCreateRun, saveRun } from '../state';

export function runVerify(args: string[]): void {
  const outIndex = args.indexOf('--out');
  const outPath = outIndex >= 0 ? args[outIndex + 1] : '.playbook/findings.json';
  const runIdIndex = args.indexOf('--run-id');
  const runId = runIdIndex >= 0 ? args[runIdIndex + 1] : undefined;
  const failIndex = args.indexOf('--fail-cause');
  const failCause = failIndex >= 0 ? args[failIndex + 1] : undefined;
  const finalize = args.includes('--complete');

  const run = resolveOrCreateRun('verify remediation flow', runId);

  const artifactPath = path.resolve(outPath);
  fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  fs.writeFileSync(artifactPath, JSON.stringify({ findings: [], verified_at: nowIso() }, null, 2) + '\n', 'utf8');

  appendExecutionStep(run, {
    kind: 'verify',
    status: failCause ? 'failed' : 'passed',
    outputs: { outPath },
    evidence: [{ id: stableId('evidence', `${run.id}:${outPath}`), kind: 'finding', artifact_path: outPath, created_at: nowIso() }],
  });

  if (failCause) {
    recordFailureCause(run, failCause);
  } else if (finalize) {
    completeExecutionRun(run, { status: 'passed', summary: 'Execution run completed successfully.' });
  }

  saveRun(run);
  console.log(JSON.stringify({ run_id: run.id, out: outPath }));
}
