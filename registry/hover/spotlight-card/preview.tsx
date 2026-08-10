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
      {/*
       * G9 — the card is not focusable, and the component's focus()/blur() work by React's
       * onFocus bubbling from a child. Without a focusable child the keyboard path existed
       * only in the source: nothing in the gallery could ever reach it. The other three
       * card previews all carry one.
       *
       * Not pinned to the bottom with mt-auto the way tilt-card's is: SpotlightCard wraps
       * its children in its own z-index:1 div, so a flex column on the card root would lay
       * out that wrapper rather than this link.
       */}
      <a
        href="#spotlight-card"
        className={[
          "mt-4 inline-block rounded-sm font-mono text-[11px] text-[var(--ink)]",
          "underline decoration-[var(--rule)] underline-offset-4",
          // G1/G2/G3 — every property named, project curve, inside the enter band.
          // G4/G11 — transform sits on the BASE rule, not only under :active, or the
          // release would have no transform in its property list and would snap.
          "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),text-decoration-color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
          "hover:decoration-[var(--ink)]",
          "active:[transform:scale(0.97)]",
          "focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
        ].join(" ")}
      >
        Read the spec
      </a>
    </SpotlightCard>
  );
}
