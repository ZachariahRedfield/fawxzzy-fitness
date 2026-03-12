import fs from 'node:fs';
import path from 'node:path';
import { ExecutionIntent, ExecutionRun } from '../../core/src/contracts/execution';
import { createExecutionRun } from '../../engine/src/execution/createExecutionRun';
import { writeExecutionRun } from '../../engine/src/execution/writeExecutionRun';

function runsDir(cwd = process.cwd()): string {
  return path.resolve(cwd, '.playbook/runs');
}

export function loadRunById(runId: string, cwd = process.cwd()): ExecutionRun {
  const runPath = path.resolve(cwd, '.playbook/runs', `${runId}.json`);
  return JSON.parse(fs.readFileSync(runPath, 'utf8')) as ExecutionRun;
}

export function loadLatestOpenRun(cwd = process.cwd()): ExecutionRun | undefined {
  const dir = runsDir(cwd);
  if (!fs.existsSync(dir)) return undefined;

  const files = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort().reverse();
  for (const file of files) {
    const run = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) as ExecutionRun;
    if (!run.completed_at && !run.outcome) {
      return run;
    }
  }
  return undefined;
}

export function createRunFromGoal(goal: string, cwd = process.cwd()): ExecutionRun {
  const intent: ExecutionIntent = {
    id: `intent:${goal}`,
    goal,
    scope: ['workspace'],
    constraints: ['deterministic-artifacts'],
    requested_by: 'user',
  };
  const run = createExecutionRun(intent);
  writeExecutionRun(run, cwd);
  return run;
}

export function resolveOrCreateRun(goal: string, runId?: string, cwd = process.cwd()): ExecutionRun {
  if (runId) return loadRunById(runId, cwd);
  return loadLatestOpenRun(cwd) ?? createRunFromGoal(goal, cwd);
}

export function saveRun(run: ExecutionRun, cwd = process.cwd()): string {
  return writeExecutionRun(run, cwd);
}
