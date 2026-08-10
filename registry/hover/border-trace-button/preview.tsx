"use client";

import { BorderTraceButton } from "./border-trace-button";

export default function Preview() {
  return (
    <BorderTraceButton
      // The token, not a literal. This was a hardcoded #2E2BE8 and went on glowing indigo
      // after the palette moved to the brand hue — the one tile on the page still lit in the
      // old accent. Previews render on the site, so the var resolves here.
      traceColor="var(--charge)"
      className="rounded-full border border-[#14150F]/15 bg-transparent px-6 py-3 text-sm font-medium text-[#14150F]"
    >
      Turn it on
    </BorderTraceButton>
  );
}
