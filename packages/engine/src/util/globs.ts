import { minimatch } from 'minimatch';

export function matchesAnyGlob(filePath: string, globs: string[]): boolean {
  return globs.some((glob) => minimatch(filePath, glob, { dot: true }));
}
