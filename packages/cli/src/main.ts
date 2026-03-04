#!/usr/bin/env node
import { Command } from 'commander';
import { runInit } from './commands/init.js';
import { runAnalyze } from './commands/analyze.js';
import { runVerify } from './commands/verify.js';
import { runDoctor } from './commands/doctor.js';

const program = new Command();
program.name('playbook').description('Playbook governance CLI').version('0.1.0');

program.command('init').description('Initialize playbook docs in current repo').action(() => runInit(process.cwd()));
program.command('analyze').description('Analyze repo for shallow stack signals').option('--json', 'Output json').action(async (opts) => runAnalyze(process.cwd(), Boolean(opts.json)));
program
  .command('verify')
  .description('Run verify rules over changed files')
  .option('--ci', 'CI mode')
  .option('--json', 'Output json')
  .action(async (opts) => {
    const code = await runVerify(process.cwd(), opts);
    process.exit(code);
  });
program.command('doctor').description('Check local setup and governance health').action(async () => runDoctor(process.cwd()));

program.parseAsync(process.argv);
