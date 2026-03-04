import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defaultConfig, type PlaybookConfig } from './schema.js';

export async function loadConfig(repoRoot: string): Promise<{ config: PlaybookConfig; warning?: string }> {
  const configPath = join(repoRoot, 'playbook.config.json');
  try {
    const raw = await readFile(configPath, 'utf-8');
    return { config: JSON.parse(raw) as PlaybookConfig };
  } catch {
    return {
      config: defaultConfig,
      warning: 'playbook.config.json not found; using defaults'
    };
  }
}
