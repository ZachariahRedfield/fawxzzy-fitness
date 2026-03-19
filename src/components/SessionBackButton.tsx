"use client";

import { TopRightBackButton } from "@/components/ui/TopRightBackButton";

export function SessionBackButton({ returnHref }: { returnHref?: string | null }) {
  return (
    <TopRightBackButton
      href="/today"
      preferredReturnHref={returnHref}
      ariaLabel="Back to Today"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("session-exercise-focus:close-request"),
        );
      }}
    />
  );
}
