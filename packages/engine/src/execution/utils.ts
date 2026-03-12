import crypto from 'node:crypto';

export function nowIso(): string {
  return new Date().toISOString();
}

export function stableId(prefix: string, seed: string): string {
  const digest = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 12);
  return `${prefix}_${digest}`;
}

export function deterministicStringify(value: unknown): string {
  return JSON.stringify(sortRecursively(value), null, 2) + '\n';
}

function sortRecursively(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => sortRecursively(entry));
  }
  if (value && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortRecursively((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}
