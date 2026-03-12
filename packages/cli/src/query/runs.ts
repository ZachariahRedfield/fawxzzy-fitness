import fs from 'node:fs';
import path from 'node:path';

export function queryRuns(cwd = process.cwd()): unknown[] {
  const dir = path.resolve(cwd, '.playbook/runs');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')));
}

export function queryRunById(runId: string, cwd = process.cwd()): unknown {
  const filePath = path.resolve(cwd, '.playbook/runs', `${runId}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
