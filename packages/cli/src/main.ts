import { runApply } from './commands/apply';
import { runPlan } from './commands/plan';
import { runVerify } from './commands/verify';
import { queryRunById, queryRuns } from './query/runs';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'verify') {
  runVerify(args.slice(1));
} else if (command === 'plan') {
  runPlan(args.slice(1));
} else if (command === 'apply') {
  runApply(args.slice(1));
} else if (command === 'query' && args[1] === 'runs') {
  console.log(JSON.stringify(queryRuns(), null, 2));
} else if (command === 'query' && args[1] === 'run') {
  const idIndex = args.indexOf('--id');
  const id = idIndex >= 0 ? args[idIndex + 1] : undefined;
  if (!id) throw new Error('Missing --id value');
  console.log(JSON.stringify(queryRunById(id), null, 2));
} else {
  console.log('Usage: playbook verify|plan|apply|query runs|query run --id <run-id>');
  process.exitCode = 1;
}
