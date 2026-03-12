import { ExecutionIntent, ExecutionRun } from '../../../core/src/contracts/execution';
import { nowIso, stableId } from './utils';

export function createExecutionRun(intent: ExecutionIntent): ExecutionRun {
  const createdAt = nowIso();
  return {
    id: stableId('run', `${intent.id}:${intent.goal}:${createdAt}`),
    version: 1,
    intent,
    steps: [],
    checkpoints: [],
    created_at: createdAt,
  };
}
