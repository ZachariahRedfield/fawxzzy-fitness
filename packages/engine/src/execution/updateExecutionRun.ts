import {
  ExecutionCheckpoint,
  ExecutionEvidence,
  ExecutionOutcome,
  ExecutionRun,
  ExecutionStep,
  ExecutionStepKind,
  ExecutionStepStatus,
} from '../../../core/src/contracts/execution';
import { nowIso, stableId } from './utils';

export type AppendStepParams = {
  kind: ExecutionStepKind;
  status?: ExecutionStepStatus;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  evidence?: ExecutionEvidence[];
};

function ensureMutable(run: ExecutionRun): void {
  if (run.completed_at || run.outcome) {
    throw new Error(`Execution run ${run.id} is frozen and cannot be updated.`);
  }
}

export function appendExecutionStep(run: ExecutionRun, params: AppendStepParams): ExecutionRun {
  ensureMutable(run);
  const index = run.steps.length + 1;
  const startedAt = nowIso();
  const step: ExecutionStep = {
    id: stableId('step', `${run.id}:${index}:${params.kind}`),
    kind: params.kind,
    status: params.status ?? 'pending',
    inputs: params.inputs ?? {},
    outputs: params.outputs ?? {},
    evidence: params.evidence ?? [],
    started_at: startedAt,
    completed_at: ['passed', 'failed', 'skipped'].includes(params.status ?? '') ? startedAt : undefined,
  };

  run.steps.push(step);

  const checkpoint: ExecutionCheckpoint = {
    id: stableId('checkpoint', `${run.id}:${step.id}`),
    label: `${params.kind}-${index}`,
    at_step_id: step.id,
    created_at: startedAt,
  };
  step.checkpoint = checkpoint;
  run.checkpoints.push(checkpoint);

  return run;
}

export function recordFailureCause(run: ExecutionRun, cause: string): ExecutionRun {
  const outcome: ExecutionOutcome = {
    status: 'failed',
    summary: 'Execution failed.',
    failure_cause: cause,
  };
  run.outcome = outcome;
  run.completed_at = nowIso();
  return run;
}

export function recordVerificationEvidence(run: ExecutionRun, evidence: ExecutionEvidence): ExecutionRun {
  ensureMutable(run);
  const step = run.steps.findLast((candidate) => candidate.kind === 'verify');
  if (!step) {
    throw new Error(`Execution run ${run.id} has no verify step for evidence.`);
  }
  step.evidence.push(evidence);
  return run;
}

export function completeExecutionRun(run: ExecutionRun, outcome: ExecutionOutcome): ExecutionRun {
  ensureMutable(run);
  run.outcome = outcome;
  run.completed_at = nowIso();
  return run;
}
