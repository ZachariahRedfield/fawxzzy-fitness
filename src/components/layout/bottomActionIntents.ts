import type { AppButtonVariant } from "@/components/ui/appButtonClasses";
import type { SemanticButtonIntent } from "@/components/ui/buttonSemanticIntents";

export type BottomActionIntent = SemanticButtonIntent;
export type BottomDockButtonVariant = "primary" | "secondary" | "destructive";

const LEGACY_VARIANT_TO_INTENT: Record<BottomDockButtonVariant, BottomActionIntent> = {
  primary: "positive",
  secondary: "info",
  destructive: "danger",
};

const INTENT_TO_APP_BUTTON_VARIANT: Record<BottomActionIntent, AppButtonVariant> = {
  positive: "primary",
  info: "secondary",
  toggleInactive: "secondary",
  toggleActive: "secondary",
  danger: "destructive",
};

export function resolveBottomActionIntent({
  intent,
  variant,
}: {
  intent?: BottomActionIntent;
  variant?: BottomDockButtonVariant;
}): BottomActionIntent {
  if (intent) return intent;
  return LEGACY_VARIANT_TO_INTENT[variant ?? "primary"];
}

export function getBottomActionAppButtonVariant(intent: BottomActionIntent): AppButtonVariant {
  return INTENT_TO_APP_BUTTON_VARIANT[intent];
}
