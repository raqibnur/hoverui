"use client";

import { ChaseBorderCard } from "./chase-border-card";

/**
 * The ring is left on `currentColor` — tonal, not accent. Two reasons. docs/DESIGN.md
 * §Thesis keeps the page achromatic at rest, and the ring is visible at rest on any device
 * without hover, so a charge-coloured ring would be a resting accent. And the tile this
 * renders inside already warms its own border to `--charge` under the pointer
 * (components/gallery/tile.tsx), so a second charge-coloured edge 24px away would read as
 * one doubled response rather than two effects. Boldness is spent on the motion here, which
 * is what DESIGN.md asks for.
 *
 * The card carries a real link so the keyboard path (`:focus-visible`) is reachable by
 * tabbing rather than only existing in the source.
 */
export default function Preview() {
  return (
    <ChaseBorderCard
      // An INSET ring, not the outset default: Tailwind v4's `ring-*` paints a box-shadow
      // outside the border box, while the annulus sits 1px inside it. The two would be
      // contiguous but not coincident, giving a 2px two-toned edge that reads as a dark
      // line travelling inside the border rather than as the border itself turning. Inset
      // puts the static hairline in the same 1px band, so the chase replaces it as it
      // passes.
      // Column layout so the link sits on the bottom edge instead of trailing the copy with
      // a dead third of the card beneath it. The extra height also lengthens the perimeter
      // the chase runs, which is the effect.
      className="flex min-h-[230px] w-full max-w-[400px] flex-col rounded-lg bg-[var(--surface)] p-5 inset-ring-1 inset-ring-[var(--rule)]"
      ringWidth={1}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--mid)]">
        Loop 08
      </p>
      <h4 className="mt-2 text-sm font-medium text-[var(--ink)]">Turning slowly</h4>
      <p className="mt-1 text-xs leading-relaxed text-[var(--mid)]">
        Seven seconds a revolution. It coasts to a stop rather than cutting.
      </p>
      <a
        href="#chase-border-card"
        className={[
          // mt-auto pins it to the bottom of the column; self-start keeps it shrink-to-fit,
          // because a flex item is blockified and would otherwise stretch the underline and
          // the focus ring across the full width of the card.
          "mt-auto self-start rounded-sm font-mono text-[11px] text-[var(--ink)]",
          // G1/G2/G3 — every property named, project curve, inside the enter band.
          // G4/G11 — transform sits on the BASE rule, not only under :active, or the
          // release would have no transform in its property list and would snap.
          "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),text-decoration-color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
          "underline decoration-[var(--rule)] underline-offset-4 hover:decoration-[var(--ink)]",
          "active:[transform:scale(0.97)]",
          "focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
        ].join(" ")}
      >
        Watch it stop
      </a>
    </ChaseBorderCard>
  );
}
