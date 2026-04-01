"use client";

import { GoalSummaryInline } from "@/components/ui/measurements/GoalSummaryInline";
import { MeasurementConfigurator } from "@/components/ui/measurements/MeasurementConfigurator";
import { cn } from "@/lib/cn";
import {
  getVisibleMetricsForModality,
  resolveGoalModality,
  validateGoalConfiguration,
  type GoalModality,
  type MeasurementSelection,
} from "@/lib/exercise-goal-validation";
import { buildGoalSummaryText, parseDurationInput, type GoalFormMetric, type GoalFormValues } from "@/lib/exercise-goal-form-model";
import { sanitizeEnabledMeasurementValues } from "@/lib/measurement-sanitization";

export function SharedExerciseGoalForm({
  measurementType,
  equipment,
  tags,
  values,
  selectedGoalMode,
  onSelectedGoalModeChange,
  onValuesChange,
  names,
  summaryEmptyLabel,
  includeSetsInSummary = false,
  className,
}: {
  measurementType: "reps" | "time" | "distance" | "time_distance";
  equipment?: string | null;
  tags?: Set<string>;
  values: GoalFormValues;
  selectedGoalMode?: GoalModality | null;
  onSelectedGoalModeChange?: (mode: GoalModality | null) => void;
  onValuesChange: (patch: Partial<GoalFormValues>) => void;
  names: {
    sets: string;
    repsMin: string;
    repsMax: string;
    weight: string;
    duration: string;
    distance: string;
    calories: string;
    weightUnit: string;
    distanceUnit: string;
    measurementSelections: string;
  };
  summaryEmptyLabel: string;
  includeSetsInSummary?: boolean;
  className?: string;
}) {
  const goalModality = resolveGoalModality({ measurementType, equipment, tags });
  const effectiveGoalModality: GoalModality = goalModality === "cardio_time_distance"
    ? (selectedGoalMode ?? "cardio_time")
    : goalModality;
  const visibleMetrics = getVisibleMetricsForModality(effectiveGoalModality);
  const goalModeChoices: Array<{ value: GoalModality; label: string }> = goalModality === "cardio_time_distance"
    ? [
      { value: "cardio_time", label: "Time" },
      { value: "cardio_distance", label: "Distance" },
      { value: "cardio_time_distance", label: "Time + Distance" },
    ]
    : [];

  const goalValidation = validateGoalConfiguration({
    modality: effectiveGoalModality,
    sets: values.sets,
    repsMin: values.repsMin,
    repsMax: values.repsMax,
    weight: values.weight,
    duration: values.duration,
    distance: values.distance,
    calories: values.calories,
    measurementSelections: new Set(values.selectedMeasurements as MeasurementSelection[]),
  });

  return (
    <div className={cn("space-y-3", className)}>
      {values.selectedMeasurements.map((metric) => (
        <input key={`selected-measurement-${metric}`} type="hidden" name={names.measurementSelections} value={metric} />
      ))}

      {goalModeChoices.length ? (
        <div className="space-y-1">
          <p className="px-0.5 text-xs text-muted">Goal mode</p>
          <div className="flex flex-wrap gap-2">
            {goalModeChoices.map((choice) => {
              const active = effectiveGoalModality === choice.value;
              return (
                <button
                  key={choice.value}
                  type="button"
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-emerald-300/45 bg-emerald-400/16 text-text"
                      : "border-border/40 bg-[rgb(var(--bg)/0.35)] text-muted hover:text-text",
                  )}
                  onClick={() => {
                    onSelectedGoalModeChange?.(choice.value);
                    if (choice.value === "cardio_time") onValuesChange({ selectedMeasurements: ["time"] });
                    else if (choice.value === "cardio_distance") onValuesChange({ selectedMeasurements: ["distance"] });
                    else onValuesChange({ selectedMeasurements: ["time", "distance"] });
                  }}
                >
                  {choice.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <MeasurementConfigurator
        values={{
          reps: values.repsMin,
          repsMax: values.repsMax,
          weight: values.weight,
          duration: values.duration,
          distance: values.distance,
          calories: values.calories,
          weightUnit: values.weightUnit,
          distanceUnit: values.distanceUnit,
        }}
        activeMetrics={{
          reps: values.selectedMeasurements.includes("reps"),
          weight: values.selectedMeasurements.includes("weight"),
          time: values.selectedMeasurements.includes("time"),
          distance: values.selectedMeasurements.includes("distance"),
          calories: values.selectedMeasurements.includes("calories"),
        }}
        isExpanded
        onExpandedChange={() => undefined}
        visibleMetrics={visibleMetrics}
        onMetricToggle={(metric) => {
          const nextMeasurements = values.selectedMeasurements.includes(metric)
            ? values.selectedMeasurements.filter((value) => value !== metric)
            : [...values.selectedMeasurements, metric as GoalFormMetric];
          const sanitizedValues = sanitizeEnabledMeasurementValues(
            {
              reps: nextMeasurements.includes("reps"),
              weight: nextMeasurements.includes("weight"),
              time: nextMeasurements.includes("time"),
              distance: nextMeasurements.includes("distance"),
              calories: nextMeasurements.includes("calories"),
            },
            {
              reps: values.repsMin,
              weight: values.weight,
              duration: values.duration,
              distance: values.distance,
              calories: values.calories,
            },
          );
          onValuesChange({
            selectedMeasurements: nextMeasurements,
            repsMin: sanitizedValues.reps,
            repsMax: nextMeasurements.includes("reps") ? values.repsMax : "",
            weight: sanitizedValues.weight,
            duration: sanitizedValues.duration,
            distance: sanitizedValues.distance,
            calories: sanitizedValues.calories,
          });
        }}
        onChange={(patch) => {
          onValuesChange({
            repsMin: patch.reps,
            repsMax: patch.repsMax,
            weight: patch.weight,
            duration: patch.duration,
            distance: patch.distance,
            calories: patch.calories,
            weightUnit: patch.weightUnit,
            distanceUnit: patch.distanceUnit,
          });
        }}
        names={{
          reps: names.repsMin,
          repsMax: names.repsMax,
          weight: names.weight,
          duration: names.duration,
          distance: names.distance,
          calories: names.calories,
          weightUnit: names.weightUnit,
          distanceUnit: names.distanceUnit,
        }}
        showHeader={false}
        description={undefined}
        topField={{
          title: "Sets",
          suffix: "target",
          input: (
            <input
              type="number"
              min={1}
              name={names.sets}
              value={values.sets}
              onChange={(event) => onValuesChange({ sets: event.target.value })}
              placeholder="Sets"
              required
              className="input-no-spinner h-10 w-full rounded-lg border border-emerald-300/30 bg-[rgb(var(--bg)/0.48)] px-3 text-base font-semibold tabular-nums text-text placeholder:text-[rgb(var(--text)/0.24)] focus-visible:border-emerald-300/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/25"
            />
          ),
        }}
      />

      <GoalSummaryInline
        includeSets={includeSetsInSummary}
        values={{
          ...sanitizeEnabledMeasurementValues(
            {
              reps: values.selectedMeasurements.includes("reps"),
              weight: values.selectedMeasurements.includes("weight"),
              time: values.selectedMeasurements.includes("time"),
              distance: values.selectedMeasurements.includes("distance"),
              calories: values.selectedMeasurements.includes("calories"),
            },
            {
              reps: values.repsMin ? Number(values.repsMin) : null,
              weight: values.weight ? Number(values.weight) : null,
              durationSeconds: parseDurationInput(values.duration),
              distance: values.distance ? Number(values.distance) : null,
              calories: values.calories ? Number(values.calories) : null,
            },
          ),
          sets: values.sets ? Number(values.sets) : null,
          repsMax: values.selectedMeasurements.includes("reps") && values.repsMax ? Number(values.repsMax) : null,
          weightUnit: values.weightUnit,
          distanceUnit: values.distanceUnit,
          emptyLabel: summaryEmptyLabel,
        }}
      />
      <p className={cn("text-xs", goalValidation.isValid ? "text-emerald-200/90" : "text-amber-200/95")}>
        {goalValidation.isValid ? "Goal valid. You can save this exercise." : goalValidation.message}
      </p>
      <input type="hidden" name="defaultUnit" value={values.selectedMeasurements.includes("distance") ? values.distanceUnit : "mi"} />
      <input type="hidden" name="goalSummaryPreview" value={buildGoalSummaryText(values, summaryEmptyLabel)} />
    </div>
  );
}
