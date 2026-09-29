"use client";

import { SpotlightCard } from "./spotlight-card";

/**
 * A pricing tier, because pricing pages are one of the four surfaces HoverUI is for
 * (CLAUDE.md § Audience) and the one where a card most needs to feel like a material rather
 * than a box. The ruled feature list gives the light something to cross: it lifts the edge
 * and the weave as it passes, and the rules read the change at a glance.
 *
 * The stage (components/gallery/tile.tsx) is recessed to --paper inside a --surface bezel
 * whose nearest edge warms under the pointer. This card separates from that on material (a
 * --surface step up from the stage) and behaviour (its edge lifts locally, under the light).
 */
const features: [string, string][] = [
  ["Projects", "Unlimited"],
  ["Seats", "Up to 12"],
  ["Support", "Next day"],
];

export default function Preview() {
  return (
    <SpotlightCard
      glowColor="var(--charge)"
      className="w-full max-w-[400px] rounded-xl border border-[var(--rule)] bg-[var(--surface)] p-6"
    >
      <div className="flex items-baseline justify-between gap-4 font-mono text-[10px] uppercase tracking-widest text-[var(--mid)]">
        <span>Studio</span>
        <span>Billed yearly</span>
      </div>

      <p className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-[40px] font-medium leading-none tracking-[-0.04em] text-[var(--ink)] tabular-nums">
          $24
        </span>
        <span className="text-xs text-[var(--mid)]">per seat, per month</span>
      </p>

      <dl className="mt-5 border-t border-[var(--rule)] text-xs">
        {features.map(([term, value]) => (
          <div
            key={term}
            className="flex items-baseline justify-between border-b border-[var(--rule)] py-2"
          >
            <dt className="text-[var(--mid)]">{term}</dt>
            <dd className="font-mono text-[11px] text-[var(--ink)]">{value}</dd>
          </div>
        ))}
      </dl>

      {/*
       * G9 — the card is not focusable, and the component's focus()/blur() work by React's
       * onFocus bubbling from a child, so the keyboard path needs a focusable child to exist
       * on the gallery page at all.
       *
       * Not pinned to the bottom with mt-auto: SpotlightCard wraps its children in its own
       * z-index:1 div, so a flex column on the card root would lay out that wrapper instead.
       */}
      <a
        href="#spotlight-card"
        className={[
          "mt-5 inline-flex items-center gap-1.5 rounded-sm text-xs font-medium text-[var(--ink)]",
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
        Choose Studio
        <span aria-hidden>→</span>
      </a>
    </SpotlightCard>
  );
}
