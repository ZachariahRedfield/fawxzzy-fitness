# Workout exercise row card variant contract

This contract canonicalizes workout exercise rows and attached quick actions around one explicit variant model.

## Variants

- `pending`
  - Triggered when a quick-log or skip/unskip action is in-flight for the row.
  - Preserves current row status semantics while reducing action-row emphasis.
- `logged`
  - Default non-skipped state (including not-yet-logged and logged progress states).
  - Badge and card completion styling continue to come from logged set progress.
- `skipped`
  - Triggered when the exercise is skipped for the session.
  - Must keep an `Unskip` secondary action to preserve recoverability.

## Derived UI contract

`deriveWorkoutExerciseCardVariant` returns the canonical row contract:

- `variant`: `pending | logged | skipped`
- `cardState`: `default | completed` (derived from set progress)
- `badgeText`: stable top-right badge text
- `chips`: row metadata chips (`skipped`, optional `addedToday` when provided by consumer)
- `skipActionLabel`: `Skip` or `Unskip` for the secondary action
- `actionRowClassName`: action-row emphasis modifier
- `quickLogActionClassName`: quick-log button text emphasis modifier
- `skipActionClassName`: skip/unskip button text emphasis modifier (uses warning tone for `skipped`)

## Usage notes

- Session and Today exercise rows should render metadata chips through one shared placement component so badge/chip positions stay stable across variants and wrapped titles.
- Quick-action rows should derive skip/unskip labels and action emphasis from the variant contract without route-local styling branches.
- Scaffold and dock layout concerns are intentionally out of scope for this contract.

## Edit Day reorder row mobile layout contract

When Edit Day enters explicit reorder mode, row rendering switches from the normal interactive card to a dedicated reorder-only row to protect title legibility on narrow widths.

- **Column structure (left → right)**:
  1. **Fixed thumbnail column** (`44px` visual container).
  2. **Flexible text column** (`minmax(0, 1fr)`).
  3. **Compact order badge column** (`~40px`, tabular numerals).
  4. **Dedicated drag-handle column** (`~40px` touch target).
- **Reorder mode interaction scope**:
  - Disclosure/tap-to-expand behavior is disabled while reorder mode is active.
  - Drag is owned only by the dedicated handle column (`touch-none` drag affordance).
- **Text wrapping**:
  - Exercise names must allow natural multi-line wrapping (`whitespace-normal`, `break-words`) and must not force per-character fragmentation.
  - Metadata remains visible in the same flexible column while drag handle/badge remain fixed.
- **Order badge stability**:
  - Reorder numbering is rendered from current list index + 1 and remains visible throughout drag interactions.
