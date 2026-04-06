import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  getAppButtonClassName,
  type AppButtonSize,
  type AppButtonState,
  type AppButtonVariant,
} from "@/components/ui/appButtonClasses";
import type { SemanticButtonIntent } from "@/components/ui/buttonSemanticIntents";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  state?: AppButtonState;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  intent?: SemanticButtonIntent;
};

export function AppButton({
  children,
  variant = "primary",
  size = "md",
  state = "default",
  fullWidth = false,
  loading = false,
  intent,
  className,
  icon,
  disabled,
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={getAppButtonClassName({ variant, size, state, fullWidth, intent, className })}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

export function PrimaryButton(props: Omit<AppButtonProps, "variant">) {
  return <AppButton variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<AppButtonProps, "variant">) {
  return <AppButton variant="secondary" {...props} />;
}

export function DestructiveButton(props: Omit<AppButtonProps, "variant">) {
  return <AppButton variant="destructive" {...props} />;
}

export function GhostButton(props: Omit<AppButtonProps, "variant">) {
  return <AppButton variant="ghost" {...props} />;
}
