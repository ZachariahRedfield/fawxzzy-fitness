# Playbook command ladder

## Execution run aware commands

The CLI now maintains deterministic run artifacts in `.playbook/runs/<run-id>.json`.

- `playbook verify` starts a run or attaches with `--run-id`.
- `playbook plan` appends a planning step.
- `playbook apply` appends an apply step and references plan/apply artifacts.
- Follow-up `playbook verify --run-id <run-id>` appends verification evidence.
- `playbook query runs` lists known run artifacts.
- `playbook query run --id <run-id>` prints one run for inspection.
