"use client";

import { RevealCard } from "./reveal-card";

/**
 * The media is drawn in CSS rather than loaded, so the registry item stays a single file
 * with no asset to fetch. It carries real chroma on purpose: SCOPE §7 makes desaturation
 * half the effect, and a near-neutral swatch cannot show a saturation drop — at the palette's
 * own spread the change lands under the just-noticeable threshold and only the recession
 * reads. docs/DESIGN.md keeps the page achromatic at rest, but that rule governs chrome and
 * accent colour; this is standing in for a consumer's photograph, which is content.
 *
 * The caption is one compact line at 32px against a 228px media, so the measured recession
 * lands near 0.14 — the media settles at 86%, comfortably inside the "slightly" SCOPE §7
 * asks for. The height is also what buys the headroom: against the 140px media this stood at
 * before, a two-line caption measured 54px, ran past MAX_RECEDE and clamped at 0.28, landing
 * the caption on ~15px of media that never moved. At 228px the same caption derives 0.24 and
 * is still matched exactly, so the clamp is no longer anywhere near. See the note on the
 * `recede` prop — the component measures both boxes itself, so the ratio follows the media.
 */
export default function Preview() {
  return (
    <RevealCard
      className="w-full max-w-[400px] rounded-lg border border-[var(--rule)] bg-[var(--surface)]"
      caption={
        <div className="flex h-8 items-center gap-2.5 border-t border-[var(--rule)] bg-[var(--surface)] px-4">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-[var(--mid)]">
            plate 07
          </span>
          <a
            href="#reveal-card"
            className={[
              "block truncate rounded-sm text-xs font-medium text-[var(--ink)]",
              // G1/G2/G3 — every property named, project curve, inside the enter band.
              // G4/G11 — transform sits on the BASE rule, not only under :active, or the
              // release would have no transform in its property list and would snap.
              "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),text-decoration-color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
              // Strengthens on hover. Fading it toward --mid would weaken the caption in
              // the same frame the card's exchange delivers it.
              "underline decoration-transparent underline-offset-4 hover:decoration-[var(--ink)]",
              "active:[transform:scale(0.97)]",
              "focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
            ].join(" ")}
          >
            Chlorophyll assay
          </a>
        </div>
      }
    >
      <div
        className="h-[228px] w-full"
        style={{
          backgroundColor: "#6f8f4f",
          backgroundImage: [
            "radial-gradient(130% 95% at 20% 12%, #b9cf92 0%, transparent 58%)",
            "radial-gradient(95% 85% at 82% 88%, #33502c 0%, transparent 60%)",
            "repeating-linear-gradient(90deg, rgba(20,21,15,0.08) 0 1px, transparent 1px 13px)",
            "repeating-linear-gradient(0deg, rgba(20,21,15,0.08) 0 1px, transparent 1px 13px)",
          ].join(","),
        }}
      />
    </RevealCard>
  );
}
