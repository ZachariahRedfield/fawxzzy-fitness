# Goal schema matrix by exercise modality

This matrix defines the **minimum valid goal state** required before the Add Exercise CTA can be enabled.

| Modality | Required fields | Optional fields | Prominent fields | De-emphasized optional fields | Hidden fields | Rendered in form (Add + inline Edit + Exercise Log) | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Strength | `sets` (>=1), `repsMin` (>=1) | `repsMax`, `weight`, `time`, `calories` | `reps`, `weight` | `time`, `calories` | `distance` | Sets + reps (with optional min/max range), weight, time, calories | If weight is enabled, weight must be >= 0. |
| Bodyweight | `sets` (>=1), `repsMin` (>=1) | `repsMax`, `time`, `calories` | `reps` | `time`, `calories` | `weight`, `distance` | Sets + reps (with optional min/max range), time, calories | Weight target is hidden because bodyweight prescriptions are rep-driven. |
| Cardio (time) | `sets` (>=1), `duration` (>0 sec) | `calories` | `time` | `calories` | `reps`, `weight`, `distance` | Sets + time, calories | Duration accepts seconds or `mm:ss`. |
| Cardio (distance) | `sets` (>=1), `distance` (>0) | `time`, `calories` | `distance` | `time`, `calories` | `reps`, `weight` | Sets + distance, optional time + calories | Distance uses selected distance unit. |
| Cardio (time + distance) | `sets` (>=1), at least one of `duration` or `distance` | `calories` | `time`, `distance` | `calories` | `reps`, `weight` | Goal mode switcher controls Time / Distance / Time + Distance cards | UI exposes explicit goal mode choices: Time, Distance, or Time + Distance. |

## Validation UX contract

- Add Exercise is disabled until the minimum valid goal state is met.
- Validation state is communicated in text directly under goal fields and under the CTA.
- Goal mode only renders relevant metric cards for the chosen modality mode to improve mobile readability.
- Exercise Log reuses the same modality visibility helpers as Add/Edit so time/cardio entries no longer render irrelevant strength-first fields.
- Empty goal previews use explicit guidance text instead of a visual-only "Goal missing" badge.
- Add and inline Edit flows both mount the same shared `SharedExerciseGoalForm` wrapper so modality logic does not drift.
