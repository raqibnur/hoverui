"use client";

import { ChaseBorderCard } from "./chase-border-card";

/**
 * A release card — the one on a landing page that says "this just shipped". A slow turn
 * suits it: something is live, and it is expensive enough not to hurry. The figures are the
 * product's own (twelve effects, one file each, no dependencies), so the demo makes no
 * claim the registry does not.
 *
 * The ring is left on `currentColor` — tonal, not accent. docs/DESIGN.md § Thesis keeps the
 * page achromatic at rest, and the ring is visible at rest on any device without hover, so a
 * charge-coloured ring would be a resting accent. The tile around it already lights its
 * nearest edge under the pointer, so a second charge-coloured edge would read as one doubled
 * response rather than two effects. Boldness is spent on the motion.
 *
 * The card carries a real link so the keyboard path (`:focus-visible`) is reachable by
 * tabbing rather than only existing in the source.
 */
const figures: [string, string][] = [
  ["12", "effects"],
  ["1", "file each"],
  ["0", "dependencies"],
];

export default function Preview() {
  return (
    <ChaseBorderCard
      // An INSET ring, not the outset default: Tailwind v4's `ring-*` paints a box-shadow
      // outside the border box, while the annulus sits 1px inside it. Inset puts the static
      // hairline in the same 1px band, so the chase replaces it as it passes.
      className="flex w-full max-w-[400px] flex-col rounded-xl bg-[var(--surface)] p-6 inset-ring-1 inset-ring-[var(--rule)]"
      ringWidth={1}
    >
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--mid)]">
        <span>Release</span>
        <span className="tabular-nums">v1.0</span>
      </div>
      <p className="mt-3 font-display text-[26px] font-medium leading-[1.02] tracking-[-0.035em] text-[var(--ink)]">
        The full set is out.
      </p>

      <dl className="mt-6 grid grid-cols-3 border-y border-[var(--rule)]">
        {figures.map(([figure, label], i) => (
          <div
            key={label}
            className={`flex flex-col-reverse py-3 ${i > 0 ? "border-l border-[var(--rule)] pl-4" : ""}`}
          >
            <dt className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--mid)]">
              {label}
            </dt>
            <dd className="font-display text-[28px] font-medium leading-none tracking-[-0.04em] tabular-nums text-[var(--ink)]">
              {figure}
            </dd>
          </div>
        ))}
      </dl>

      <a
        href="#chase-border-card"
        className={[
          // self-start keeps it shrink-to-fit; a flex item is blockified and would otherwise
          // stretch the underline and the focus ring across the full width of the card.
          "mt-5 self-start rounded-sm text-xs font-medium text-[var(--ink)]",
          // G1/G2/G3 — every property named, project curve, inside the enter band.
          // G4/G11 — transform sits on the BASE rule, not only under :active, or the
          // release would have no transform in its property list and would snap.
          "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),text-decoration-color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
          "underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--ink)]",
          "active:[transform:scale(0.97)]",
          "focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
        ].join(" ")}
      >
        Read the release notes
      </a>
    </ChaseBorderCard>
  );
}
