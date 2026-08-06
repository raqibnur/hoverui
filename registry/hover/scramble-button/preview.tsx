"use client";

import { ScrambleButton } from "./scramble-button";

export default function Preview() {
  return (
    <ScrambleButton className="rounded-full border border-[var(--rule)] bg-[var(--surface)] px-6 py-3 font-mono text-sm font-medium text-[var(--ink)]">
      Add to project
    </ScrambleButton>
  );
}
