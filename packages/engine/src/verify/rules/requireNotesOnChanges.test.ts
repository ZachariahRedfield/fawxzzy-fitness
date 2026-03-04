import { describe, expect, it } from 'vitest';
import { requireNotesOnChanges } from './requireNotesOnChanges.js';

const rules = [
  {
    whenChanged: ['src/**', 'app/**', 'server/**', 'supabase/**'],
    mustTouch: ['docs/PLAYBOOK_NOTES.md']
  }
];

describe('requireNotesOnChanges', () => {
  it('triggers when src changes without notes', () => {
    const failures = requireNotesOnChanges(['src/foo.ts'], rules);
    expect(failures).toHaveLength(1);
  });

  it('passes when notes changed', () => {
    const failures = requireNotesOnChanges(['src/foo.ts', 'docs/PLAYBOOK_NOTES.md'], rules);
    expect(failures).toHaveLength(0);
  });

  it('does not trigger on unrelated files', () => {
    const failures = requireNotesOnChanges(['README.md'], rules);
    expect(failures).toHaveLength(0);
  });
});
