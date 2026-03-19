"use client";

import { useReturnNavigation } from "@/components/ui/useReturnNavigation";

type NavigationReturnInputProps = {
  name?: string;
  fallbackHref?: string;
  preferredReturnHref?: string | null;
};

export function NavigationReturnInput({ name = "returnTo", fallbackHref, preferredReturnHref }: NavigationReturnInputProps) {
  const { returnHref } = useReturnNavigation(fallbackHref, preferredReturnHref);

  return <input type="hidden" name={name} value={returnHref ?? ""} />;
}
