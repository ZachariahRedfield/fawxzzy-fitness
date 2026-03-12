import fs from 'node:fs';
import path from 'node:path';
import { appendExecutionStep } from '../../../engine/src/execution/updateExecutionRun';
import { nowIso, stableId } from '../../../engine/src/execution/utils';
import { resolveOrCreateRun, saveRun } from '../state';

export function runApply(args: string[]): void {
  const planIndex = args.indexOf('--from-plan');
  const planPath = planIndex >= 0 ? args[planIndex + 1] : '.playbook/plan.json';
  const runIdIndex = args.indexOf('--run-id');
  const runId = runIdIndex >= 0 ? args[runIdIndex + 1] : undefined;

  const run = resolveOrCreateRun('apply remediation flow', runId);

  const resolvedPlanPath = path.resolve(planPath);
  const plan = fs.existsSync(resolvedPlanPath) ? JSON.parse(fs.readFileSync(resolvedPlanPath, 'utf8')) : { actions: [] };

  const applyArtifactPath = '.playbook/apply.json';
  const resolvedApplyPath = path.resolve(applyArtifactPath);
  fs.mkdirSync(path.dirname(resolvedApplyPath), { recursive: true });
  fs.writeFileSync(resolvedApplyPath, JSON.stringify({ applied: true, plan, applied_at: nowIso() }, null, 2) + '\n', 'utf8');

  appendExecutionStep(run, {
    kind: 'apply',
    status: 'passed',
    inputs: { planPath },
    outputs: { artifact: applyArtifactPath },
    evidence: [{ id: stableId('evidence', `${run.id}:${applyArtifactPath}`), kind: 'apply', artifact_path: applyArtifactPath, created_at: nowIso() }],
  });

  saveRun(run);
  console.log(JSON.stringify({ run_id: run.id, artifact: applyArtifactPath }));
}
