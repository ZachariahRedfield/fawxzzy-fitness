import { analyzeRepo } from '@playbook/engine';

export async function runAnalyze(cwd: string, asJson: boolean): Promise<void> {
  const result = await analyzeRepo(cwd);
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  console.log(result.summary);
}
