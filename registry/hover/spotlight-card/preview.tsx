"use client";

import { SpotlightCard } from "./spotlight-card";

/**
 * The stage this renders on (components/gallery/tile.tsx) is recessed to --paper and the
 * tile itself is a --surface card whose border warms to --charge uniformly on hover. Two
 * nested cards both lighting their edge would read as one doubled response, so this card
 * separates from its container on two axes: material (it sits at --surface on the --paper
 * stage, so there is a step between them) and behaviour (its edge lifts locally, under the
 * light, while the tile's warms evenly across all four sides).
 */
export default function Preview() {
  return (
    <SpotlightCard
      glowColor="var(--charge)"
      // The copy sits at the top and the rest is left open on purpose: the empty surface is
      // the part of the card the light actually travels across, so height is not padding
      // here, it is stage.
      className="min-h-[230px] w-full max-w-[400px] rounded-lg border border-[var(--rule)] bg-[var(--surface)] p-5"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--mid)]">
        Surface
      </p>
      <h4 className="mt-2 text-sm font-medium text-[var(--ink)]">Lit from within</h4>
      <p className="mt-1 text-xs leading-relaxed text-[var(--mid)]">
        The light trails the cursor and lifts the edge as it passes.
      </p>
    </SpotlightCard>
  );
}
