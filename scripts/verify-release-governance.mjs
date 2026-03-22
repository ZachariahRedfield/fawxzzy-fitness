#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function runGit(args, { allowFailure = false } = {}) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
  } catch (error) {
    if (allowFailure) {
      return '';
    }
    throw error;
  }
}

function parseArgs(argv) {
  const options = {
    json: false,
    summaryFile: '',
    artifactFile: '',
    baseRef: process.env.VERIFY_BASE_REF?.trim() ?? ''
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') {
      options.json = true;
    } else if (arg === '--summary-file') {
      options.summaryFile = argv[index + 1] ?? '';
      index += 1;
    } else if (arg === '--artifact-file') {
      options.artifactFile = argv[index + 1] ?? '';
      index += 1;
    } else if (arg === '--base-ref') {
      options.baseRef = argv[index + 1] ?? '';
      index += 1;
    }
  }

  return options;
}

function safeParseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function getBaseRef(explicitBaseRef) {
  if (explicitBaseRef) {
    return explicitBaseRef;
  }

  for (const candidate of ['origin/main', 'main', 'HEAD^']) {
    const resolved = runGit(['rev-parse', '--verify', candidate], { allowFailure: true });
    if (resolved) {
      return candidate;
    }
  }

  return 'HEAD';
}

function getMergeBase(baseRef) {
  const mergeBase = runGit(['merge-base', 'HEAD', baseRef], { allowFailure: true });
  return mergeBase || runGit(['rev-parse', '--verify', baseRef]);
}

function getChangedFiles(baseSha) {
  const output = runGit(['diff', '--name-only', '--diff-filter=ACMR', `${baseSha}...HEAD`], { allowFailure: true });
  return output ? output.split('\n').map((line) => line.trim()).filter(Boolean) : [];
}

function getFileAtRef(ref, filePath) {
  return runGit(['show', `${ref}:${filePath}`], { allowFailure: true });
}

function getCurrentFile(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
}

function isDocsOnlyFile(filePath) {
  return filePath.startsWith('docs/')
    || filePath === 'README.md'
    || filePath === 'AGENT.md'
    || filePath === 'CODEX.md'
    || filePath.endsWith('.md');
}

function isReleaseRelevantFile(filePath) {
  return !isDocsOnlyFile(filePath);
}

function extractPackageVersion(packageJsonText) {
  if (!packageJsonText) return '';
  const parsed = safeParseJson(packageJsonText, {});
  return typeof parsed.version === 'string' ? parsed.version : '';
}

function extractScriptNames(packageJsonText) {
  if (!packageJsonText) return [];
  const parsed = safeParseJson(packageJsonText, {});
  return Object.keys(parsed.scripts ?? {}).sort();
}

function extractCompatAliases(runtimeSource) {
  const match = runtimeSource.match(/const COMPAT_ALIASES = new Set\(\[(.*?)\]\);/s);
  if (!match) return [];
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]).sort();
}

function extractLatestChangelogVersion(changelogText) {
  if (!changelogText) return '';

  for (const line of changelogText.split('\n')) {
    const trimmed = line.trim();
    const bracketMatch = /^## \[v?(\d+\.\d+\.\d+)\]/.exec(trimmed);
    if (bracketMatch) return bracketMatch[1];

    const plainMatch = /^## v?(\d+\.\d+\.\d+)\b/.exec(trimmed);
    if (plainMatch) return plainMatch[1];
  }

  return '';
}

function buildRule({ id, ok, reason, evidence = [], nextActions = [] }) {
  return { id, ok, reason, evidence, nextActions };
}

export function buildReleaseGovernanceReport(options = {}) {
  const baseRef = getBaseRef(options.baseRef);
  const baseSha = getMergeBase(baseRef);
  const changedFiles = getChangedFiles(baseSha);
  const docsOnly = changedFiles.length > 0 && changedFiles.every(isDocsOnlyFile);
  const releaseRelevantFiles = changedFiles.filter(isReleaseRelevantFile);

  const basePackageJson = getFileAtRef(baseSha, 'package.json');
  const headPackageJson = getCurrentFile('package.json');
  const baseChangelog = getFileAtRef(baseSha, 'docs/CHANGELOG.md');
  const headChangelog = getCurrentFile('docs/CHANGELOG.md');
  const baseRuntime = getFileAtRef(baseSha, 'scripts/playbook-runtime.mjs');
  const headRuntime = getCurrentFile('scripts/playbook-runtime.mjs');

  const baseVersion = extractPackageVersion(basePackageJson);
  const headVersion = extractPackageVersion(headPackageJson);
  const versionChanged = Boolean(baseVersion && headVersion && baseVersion !== headVersion);
  const changelogTouched = changedFiles.includes('docs/CHANGELOG.md');

  const baseScriptNames = extractScriptNames(basePackageJson);
  const headScriptNames = extractScriptNames(headPackageJson);
  const addedScripts = headScriptNames.filter((name) => !baseScriptNames.includes(name));

  const baseAliases = extractCompatAliases(baseRuntime);
  const headAliases = extractCompatAliases(headRuntime);
  const addedCompatAliases = headAliases.filter((name) => !baseAliases.includes(name));

  const latestChangelogVersion = extractLatestChangelogVersion(headChangelog);
  const releasePlanApplied = changelogTouched;
  const publicContractExpansion = addedScripts.length > 0 || addedCompatAliases.length > 0;

  const rules = [
    buildRule({
      id: 'missing-required-version-bump',
      ok: docsOnly || releaseRelevantFiles.length === 0 || versionChanged,
      reason: docsOnly || releaseRelevantFiles.length === 0
        ? 'No release-relevant source changes were detected.'
        : versionChanged
          ? `package.json version changed from ${baseVersion || '(missing)'} to ${headVersion || '(missing)'}.`
          : `Release-relevant files changed without a package.json version bump (${headVersion || '(missing version)'}).`,
      evidence: releaseRelevantFiles,
      nextActions: docsOnly || releaseRelevantFiles.length === 0 || versionChanged
        ? []
        : ['Bump package.json version to match the release intent for these source changes.']
    }),
    buildRule({
      id: 'inconsistent-version-group',
      ok: !versionChanged || !latestChangelogVersion || latestChangelogVersion === headVersion,
      reason: !versionChanged
        ? 'Version group is unchanged in this diff.'
        : !latestChangelogVersion
          ? 'Unable to find a release heading in docs/CHANGELOG.md.'
          : latestChangelogVersion === headVersion
            ? `package.json and the latest changelog release heading both resolve to ${headVersion}.`
            : `package.json version (${headVersion}) does not match the latest changelog release heading (${latestChangelogVersion}).`,
      evidence: ['package.json', 'docs/CHANGELOG.md'],
      nextActions: !versionChanged || latestChangelogVersion === headVersion
        ? []
        : ['Align package.json version and the latest docs/CHANGELOG.md release heading to the same SemVer value.']
    }),
    buildRule({
      id: 'contract-expansion-requires-release-plan',
      ok: !publicContractExpansion || releasePlanApplied,
      reason: !publicContractExpansion
        ? 'No public contract expansion was detected.'
        : releasePlanApplied
          ? 'Public contract expansion is paired with a changelog/release-plan update.'
          : 'Public contract expansion was detected without a docs/CHANGELOG.md release-plan update.',
      evidence: [
        ...addedScripts.map((name) => `package.json script added: ${name}`),
        ...addedCompatAliases.map((name) => `scripts/playbook-runtime.mjs alias added: ${name}`)
      ],
      nextActions: !publicContractExpansion || releasePlanApplied
        ? []
        : ['Document the operator-facing release impact in docs/CHANGELOG.md before merging.']
    })
  ];

  const failedRules = rules.filter((rule) => !rule.ok);

  return {
    ok: failedRules.length === 0,
    generatedAt: new Date().toISOString(),
    baseRef,
    baseSha,
    headSha: runGit(['rev-parse', '--verify', 'HEAD']),
    changedFiles,
    docsOnly,
    releaseRelevantFiles,
    version: {
      base: baseVersion,
      head: headVersion,
      changed: versionChanged,
      latestChangelogVersion
    },
    contractExpansion: {
      addedScripts,
      addedCompatAliases,
      releasePlanApplied
    },
    rules,
    nextActions: [...new Set(failedRules.flatMap((rule) => rule.nextActions))]
  };
}

export function renderReleaseGovernanceTextSummary(report) {
  const status = report.ok ? 'PASS' : 'FAIL';
  const lines = [`release-governance verify: ${status}`];

  if (report.changedFiles.length === 0) {
    lines.push('- No changed files detected against the selected base.');
  } else {
    lines.push(`- Changed files: ${report.changedFiles.length}`);
    lines.push(`- Release-relevant files: ${report.releaseRelevantFiles.length}`);
    if (report.docsOnly) {
      lines.push('- Docs-only diff detected; release governance stays closed but does not fail.');
    }
  }

  for (const rule of report.rules) {
    lines.push(`- [${rule.ok ? 'ok' : 'fail'}] ${rule.id}: ${rule.reason}`);
  }

  if (report.nextActions.length > 0) {
    lines.push('- Next actions:');
    for (const action of report.nextActions) {
      lines.push(`  • ${action}`);
    }
  }

  return lines.join('\n');
}

export function renderReleaseGovernanceMarkdownSummary(report) {
  const status = report.ok ? '✅ Pass' : '❌ Fail';
  const lines = [
    '## Release governance verify',
    '',
    `**Status:** ${status}`,
    `**Changed files:** ${report.changedFiles.length}`,
    `**Release-relevant files:** ${report.releaseRelevantFiles.length}`,
    ''
  ];

  for (const rule of report.rules) {
    lines.push(`- ${rule.ok ? '✅' : '❌'} \`${rule.id}\` — ${rule.reason}`);
  }

  if (report.nextActions.length > 0) {
    lines.push('', '**Next actions**');
    for (const action of report.nextActions) {
      lines.push(`- ${action}`);
    }
  }

  lines.push('', '_Artifact-backed by `.playbook/reports/release-governance.json`._');
  return lines.join('\n');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const report = buildReleaseGovernanceReport(options);

  if (options.artifactFile) {
    mkdirSync(path.dirname(options.artifactFile), { recursive: true });
    writeFileSync(options.artifactFile, `${JSON.stringify(report, null, 2)}\n`);
  }

  if (options.summaryFile) {
    mkdirSync(path.dirname(options.summaryFile), { recursive: true });
    writeFileSync(options.summaryFile, `${renderReleaseGovernanceMarkdownSummary(report)}\n`);
  }

  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    process.stdout.write(`${renderReleaseGovernanceTextSummary(report)}\n`);
  }

  process.exit(report.ok ? 0 : 1);
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (entryPath && fileURLToPath(import.meta.url) === entryPath) {
  main();
}
