import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AppShell } from "@/components/ui/app/AppShell";

type MainTabScreenProps = {
  children: ReactNode;
  className?: string;
  topNavMode?: "main" | "none";
};

export function MainTabScreen({ children, className, topNavMode = "main" }: MainTabScreenProps) {
  return (
    <AppShell className={cn("space-y-3", className)} topNavMode={topNavMode}>
      {children}
    </AppShell>
  );
}
