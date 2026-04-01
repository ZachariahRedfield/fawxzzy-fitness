import { formatGoalInlineSummaryText } from "@/lib/measurement-display";
import { sanitizeEnabledMeasurementValues } from "@/lib/measurement-sanitization";

export type GoalFormMetric = "reps" | "weight" | "time" | "distance" | "calories";

export type GoalFormValues = {
  sets: string;
  repsMin: string;
  repsMax: string;
  weight: string;
  duration: string;
  distance: string;
  calories: string;
  weightUnit: "lbs" | "kg";
  distanceUnit: "mi" | "km" | "m";
  selectedMeasurements: GoalFormMetric[];
};

export function parseDurationInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const match = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function buildGoalSummaryText(values: GoalFormValues, emptyLabel: string) {
  const selectedMetrics = {
    reps: values.selectedMeasurements.includes("reps"),
    weight: values.selectedMeasurements.includes("weight"),
    time: values.selectedMeasurements.includes("time"),
    distance: values.selectedMeasurements.includes("distance"),
    calories: values.selectedMeasurements.includes("calories"),
  };
  const sanitized = sanitizeEnabledMeasurementValues(selectedMetrics, {
    reps: values.repsMin ? Number(values.repsMin) : null,
    weight: values.weight ? Number(values.weight) : null,
    durationSeconds: parseDurationInput(values.duration),
    distance: values.distance ? Number(values.distance) : null,
    calories: values.calories ? Number(values.calories) : null,
  });

  return formatGoalInlineSummaryText({
    sets: values.sets ? Number(values.sets) : null,
    reps: sanitized.reps,
    repsMax: selectedMetrics.reps && values.repsMax ? Number(values.repsMax) : null,
    weight: sanitized.weight,
    durationSeconds: sanitized.durationSeconds,
    distance: sanitized.distance,
    calories: sanitized.calories,
    weightUnit: values.weightUnit,
    distanceUnit: values.distanceUnit,
    emptyLabel,
  });
}
