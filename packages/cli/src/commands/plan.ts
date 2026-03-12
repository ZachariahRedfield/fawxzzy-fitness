import fs from 'node:fs';
import path from 'node:path';
import { appendExecutionStep } from '../../../engine/src/execution/updateExecutionRun';
import { nowIso, stableId } from '../../../engine/src/execution/utils';
import { resolveOrCreateRun, saveRun } from '../state';

export function runPlan(args: string[]): void {
  const outIndex = args.indexOf('--out');
  const outPath = outIndex >= 0 ? args[outIndex + 1] : '.playbook/plan.json';
  const runIdIndex = args.indexOf('--run-id');
  const runId = runIdIndex >= 0 ? args[runIdIndex + 1] : undefined;

  const run = resolveOrCreateRun('plan remediation flow', runId);

  const artifactPath = path.resolve(outPath);
  fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
  const plan = { actions: ['collect evidence', 'apply changes', 're-verify'], created_at: nowIso() };
  fs.writeFileSync(artifactPath, JSON.stringify(plan, null, 2) + '\n', 'utf8');

  appendExecutionStep(run, {
    kind: 'plan',
    status: 'passed',
    outputs: { outPath },
    evidence: [{ id: stableId('evidence', `${run.id}:${outPath}`), kind: 'plan', artifact_path: outPath, created_at: nowIso() }],
  });

  saveRun(run);
  console.log(JSON.stringify({ run_id: run.id, out: outPath }));
}
