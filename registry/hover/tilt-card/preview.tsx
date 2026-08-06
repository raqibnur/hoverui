"use client";

import { TiltCard } from "./tilt-card";

/**
 * The card carries a real link, so the keyboard path (G9 — lift, no tilt) is reachable by
 * tabbing on the gallery page rather than only existing in the source. Everything rests
 * achromatic: --charge is forbidden at rest (docs/DESIGN.md § Tokens), so the only accent
 * here appears on :focus-visible, which is under the user's own pointer or caret.
 */
export default function Preview() {
  return (
    <TiltCard className="w-full max-w-[264px] rounded-lg border border-[var(--rule)] bg-[var(--surface)] p-5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--mid)]">
        Panel
      </p>
      <h4 className="mt-2 text-sm font-medium text-[var(--ink)]">Behind glass</h4>
      <p className="mt-1 text-xs leading-relaxed text-[var(--mid)]">
        Eight degrees, no more. The sheen travels against the turn.
      </p>
      <a
        href="#tilt-card"
        className={[
          "mt-3 inline-block rounded-sm font-mono text-[11px] text-[var(--ink)]",
          "underline decoration-[var(--rule)] underline-offset-4",
          // G1/G2/G3 — one arbitrary transition naming every property, so nothing depends
          // on which utility Tailwind happens to emit last. A bare colour-transition
          // utility would resolve the default ease-in-out (the ramp G2 rules out) at
          // 150ms, under the 180-260ms enter band.
          //
          // G4/G11 — transform is on the BASE rule, not only inside the press. Declaring
          // it solely under :active means the after-change property list on release has no
          // transform in it, so the press returns with a snap. That is the part of
          // magnetic-button's pattern that makes its own press-only rule safe.
          "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),text-decoration-color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
          "hover:decoration-[var(--ink)]",
          "active:[transform:scale(0.97)]",
          "focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
        ].join(" ")}
      >
        Read the spec
      </a>
    </TiltCard>
  );
}
