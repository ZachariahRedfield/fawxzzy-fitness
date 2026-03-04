import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { detectNextjs } from './detectors/nextjs.js';
import { detectSupabase } from './detectors/supabase.js';
import { detectTailwind } from './detectors/tailwind.js';

export type AnalyzeResult = {
  detected: string[];
  summary: string;
};

export async function analyzeRepo(repoRoot: string): Promise<AnalyzeResult> {
  const packageJsonPath = join(repoRoot, 'package.json');
  let deps: string[] = [];
  try {
    const pkg = JSON.parse(await readFile(packageJsonPath, 'utf-8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    deps = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
  } catch {
    deps = [];
  }

  const files = [
    'next.config.js',
    'next.config.mjs',
    'next.config.ts',
    'app/',
    'pages/',
    'supabase/',
    'tailwind.config.js',
    'tailwind.config.ts',
    'tailwind.config.mjs'
  ].filter((path) => existsSync(join(repoRoot, path)));

  const detected: string[] = [];
  if (detectNextjs(files, deps)) detected.push('nextjs');
  if (detectSupabase(files, deps)) detected.push('supabase');
  if (detectTailwind(files, deps)) detected.push('tailwind');

  return {
    detected,
    summary: detected.length ? `Detected stack: ${detected.join(', ')}` : 'No known stack markers detected'
  };
}
