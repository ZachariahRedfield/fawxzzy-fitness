# Playbook v0.1.0

Playbook is a lightweight governance CLI for engineering teams.

## 2-minute quickstart

```bash
pnpm install
pnpm build
pnpm -C packages/cli playbook --help
pnpm -C packages/cli playbook init
pnpm -C packages/cli playbook verify
```

## What v0.1.0 enforces

- `requireNotesOnChanges`: if `src/**`, `app/**`, `server/**`, or `supabase/**` changed,
  `docs/PLAYBOOK_NOTES.md` must be part of the same change.
- CI-friendly verification with non-zero exit on rule failure.
- Idempotent project initialization using templates.

## Example verify failure

```text
❌ verify failed
Failures:
- [requireNotesOnChanges] Code changes require a Playbook notes update.
  evidence: src/foo.ts (triggered by 1 changed file(s))
  fix: Update docs/PLAYBOOK_NOTES.md with a note describing WHAT changed and WHY.
```

## Templates and CI integration

- `templates/repo` contains bootstrap docs and a GitHub Action template for consumers.
- Run `playbook init` in a repository to copy those files without overwriting existing ones.
- Consumer workflow template runs `npx playbook verify --ci`.
