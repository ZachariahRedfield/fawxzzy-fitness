# FawxzzyFitness

## Playbook Learning Status

This repository uses an automated Playbook Learning system to capture reusable engineering patterns and guardrails.

PRs display a live Playbook Learning Status comment showing:

- Draft notes detected from recent changes
- Proposed notes waiting promotion
- Promoted doctrine entries

Example metrics:

Drafts | Proposed | Promoted | Upstreamed

Status is automatically computed in CI and visible in pull request checks.

Typical workflow:

While coding:
`npm run playbook:guardian`

PR feedback:
CI automatically reports Playbook Learning status.

Batch promotion:
`npm run playbook:sync-and-update`

Quick maintenance:
`npm run playbook:maintain`

## Deterministic Execution Runs

Playbook now tracks full remediation/agent workflows as deterministic run artifacts in `.playbook/runs/<run-id>.json`.

This run-state model provides:

- ordered step history across verify → plan → apply → verify;
- evidence linkage to findings, plan, and apply artifacts;
- inspectable partial and failed runs for resume/audit/learning;
- stable checkpoints and deterministic JSON serialization.
