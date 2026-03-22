import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function run(cmd, args, cwd) {
  try {
    return execFileSync(cmd, args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
  } catch (error) {
    return String(error.stdout ?? '').trim();
  }
}

function writeRepoFile(repoRoot, relativePath, contents) {
  const absolutePath = path.join(repoRoot, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents);
}

function createRepoFixture() {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'release-governance-'));
  run('git', ['init'], repoRoot);
  run('git', ['config', 'user.name', 'Codex'], repoRoot);
  run('git', ['config', 'user.email', 'codex@example.com'], repoRoot);

  writeRepoFile(repoRoot, 'package.json', JSON.stringify({
    name: 'fixture',
    version: '1.2.3',
    scripts: {
      verify: 'node scripts/playbook-runtime.mjs verify'
    }
  }, null, 2) + '\n');
  writeRepoFile(repoRoot, 'docs/CHANGELOG.md', '## [v1.2.3] – Fixture\n\n### WHAT\n- Base release.\n');
  writeRepoFile(repoRoot, 'scripts/playbook-runtime.mjs', "const COMPAT_ALIASES = new Set(['verify']);\n");
  writeRepoFile(repoRoot, 'src/api.ts', 'export const api = 1;\n');

  run('git', ['add', '.'], repoRoot);
  run('git', ['commit', '-m', 'base'], repoRoot);
  return repoRoot;
}

function runVerify(repoRoot) {
  const scriptPath = path.resolve('scripts/verify-release-governance.mjs');
  const result = run('node', [scriptPath, '--json', '--base-ref', 'HEAD^'], repoRoot);
  return JSON.parse(result);
}

test('public contract expansion without changelog update fails release-plan rule', () => {
  const repoRoot = createRepoFixture();
  writeRepoFile(repoRoot, 'package.json', JSON.stringify({
    name: 'fixture',
    version: '1.2.4',
    scripts: {
      verify: 'node scripts/playbook-runtime.mjs verify',
      'verify:json': 'node scripts/playbook-runtime.mjs verify --json'
    }
  }, null, 2) + '\n');
  run('git', ['add', 'package.json'], repoRoot);
  run('git', ['commit', '-m', 'expand contract'], repoRoot);

  const report = runVerify(repoRoot);
  const rule = report.rules.find((entry) => entry.id === 'contract-expansion-requires-release-plan');

  assert.equal(rule?.ok, false);
  assert.match(rule?.reason ?? '', /without a docs\/CHANGELOG\.md release-plan update/i);
});

test('docs-only changes do not fail release governance', () => {
  const repoRoot = createRepoFixture();
  writeRepoFile(repoRoot, 'docs/guide.md', '# docs only\n');
  run('git', ['add', 'docs/guide.md'], repoRoot);
  run('git', ['commit', '-m', 'docs'], repoRoot);

  const report = runVerify(repoRoot);

  assert.equal(report.docsOnly, true);
  assert.equal(report.ok, true);
});

test('version bump with mismatched changelog heading fails deterministically', () => {
  const repoRoot = createRepoFixture();
  writeRepoFile(repoRoot, 'package.json', JSON.stringify({
    name: 'fixture',
    version: '1.2.4',
    scripts: {
      verify: 'node scripts/playbook-runtime.mjs verify'
    }
  }, null, 2) + '\n');
  writeRepoFile(repoRoot, 'docs/CHANGELOG.md', '## [v1.2.3] – Fixture\n\n### WHAT\n- Still stale.\n');
  run('git', ['add', 'package.json', 'docs/CHANGELOG.md'], repoRoot);
  run('git', ['commit', '-m', 'version mismatch'], repoRoot);

  const report = runVerify(repoRoot);
  const rule = report.rules.find((entry) => entry.id === 'inconsistent-version-group');

  assert.equal(rule?.ok, false);
  assert.match(rule?.reason ?? '', /does not match/i);
});
