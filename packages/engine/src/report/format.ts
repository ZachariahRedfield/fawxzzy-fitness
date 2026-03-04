import type { VerifyReport } from './types.js';

export function formatJson(report: VerifyReport): string {
  return JSON.stringify(report, null, 2);
}

export function formatHuman(report: VerifyReport): string {
  const lines: string[] = [];
  lines.push(report.ok ? '✅ verify passed' : '❌ verify failed');
  if (report.summary.baseRef || report.summary.baseSha) {
    lines.push(`Base: ${report.summary.baseRef ?? 'unknown'} (${report.summary.baseSha ?? 'n/a'})`);
  }
  if (report.failures.length > 0) {
    lines.push('Failures:');
    for (const failure of report.failures) {
      lines.push(`- [${failure.id}] ${failure.message}`);
      if (failure.evidence) lines.push(`  evidence: ${failure.evidence}`);
      if (failure.fix) lines.push(`  fix: ${failure.fix}`);
    }
  }
  if (report.warnings.length > 0) {
    lines.push('Warnings:');
    for (const warning of report.warnings) {
      lines.push(`- [${warning.id}] ${warning.message}`);
    }
  }
  return lines.join('\n');
}
