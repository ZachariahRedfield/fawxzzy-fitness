import { formatHuman, formatJson, verifyRepo } from '@playbook/engine';

export async function runVerify(cwd: string, opts: { ci?: boolean; json?: boolean }): Promise<number> {
  const report = await verifyRepo(cwd);
  const outputAsJson = Boolean(opts.ci || opts.json);
  if (outputAsJson) {
    console.log(formatJson(report));
    if (opts.ci) console.log(report.ok ? 'playbook verify: ok' : 'playbook verify: failed');
  } else {
    console.log(formatHuman(report));
  }
  return report.ok ? 0 : 1;
}
