import fs from 'node:fs';
import path from 'node:path';
import { ExecutionRun } from '../../../core/src/contracts/execution';
import { deterministicStringify } from './utils';

export const RUN_ARTIFACT_DIR = '.playbook/runs';

export function writeExecutionRun(run: ExecutionRun, cwd = process.cwd()): string {
  const dirPath = path.resolve(cwd, RUN_ARTIFACT_DIR);
  fs.mkdirSync(dirPath, { recursive: true });

  const artifactPath = path.join(dirPath, `${run.id}.json`);
  const payload = deterministicStringify(run);
  fs.writeFileSync(artifactPath, payload, 'utf8');

  return artifactPath;
}
