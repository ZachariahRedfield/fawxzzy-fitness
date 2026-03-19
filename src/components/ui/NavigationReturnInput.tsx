"use client";

import { useReturnNavigation } from "@/components/ui/useReturnNavigation";

export function NavigationReturnInput({
  name = "returnTo",
  fallbackHref,
  preferredReturnHref,
}: {
  name?: string;
  fallbackHref?: string;
  preferredReturnHref?: string;
}) {
  const { returnHref } = useReturnNavigation({ fallbackHref, preferredReturnHref });

  return <input type="hidden" name={name} value={returnHref ?? ""} />;
}
