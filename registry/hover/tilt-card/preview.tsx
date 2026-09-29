"use client";

import { TiltCard } from "./tilt-card";

/**
 * An admission ticket: the most physical object a landing page routinely draws, which is
 * what SCOPE §6 asks the panel to feel like. The perforation and its two notches make it an
 * object with edges rather than a rectangle of copy, so eight degrees of turn reads as a
 * thing being handled.
 *
 * The notches are --paper discs centred on the card's side walls. TiltCard pins
 * `overflow: hidden` on its root, so each is clipped to a half-circle and reads as cut out
 * of the card down to the stage beneath. They use the tokens, not literal hex, so they stay
 * cut-outs on the sheet's light and dark stages as well (docs/DESIGN.md § Dark theme).
 *
 * The card carries a real link, so the keyboard path (G9 — lift, no tilt) is reachable by
 * tabbing on the gallery page rather than only existing in the source.
 */
const stub: [string, string][] = [
  ["Date", "14.11"],
  ["Doors", "19:00"],
  ["Gate", "B"],
];

export default function Preview() {
  // TiltCard deliberately does not wrap its children, so the layout classes here apply to
  // them directly — see the note above `children` in tilt-card.tsx.
  return (
    <TiltCard className="flex w-full max-w-[400px] flex-col rounded-xl border border-[var(--rule)] bg-[var(--surface)]">
      <div className="px-5 pb-5 pt-5">
        <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--mid)]">
          <span>Admit one</span>
          <span className="tabular-nums">No. 0412</span>
        </div>
        <p className="mt-4 font-display text-[32px] font-medium leading-[0.95] tracking-[-0.04em] text-[var(--ink)]">
          Open studio,
          <br />
          after hours
        </p>
        <p className="mt-2.5 text-xs text-[var(--mid)]">Warehouse 9, Leith</p>
      </div>

      <div aria-hidden className="relative">
        <div className="mx-4 border-t border-dashed border-[var(--rule)]" />
        <span className="absolute -left-[10px] top-1/2 size-5 -translate-y-1/2 rounded-full border border-[var(--rule)] bg-[var(--paper)]" />
        <span className="absolute -right-[10px] top-1/2 size-5 -translate-y-1/2 rounded-full border border-[var(--rule)] bg-[var(--paper)]" />
      </div>

      <div className="flex items-end justify-between gap-4 px-5 pb-5 pt-4">
        <dl className="flex gap-6">
          {stub.map(([term, value]) => (
            <div key={term}>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-[var(--mid)]">
                {term}
              </dt>
              <dd className="mt-1 text-sm font-medium tabular-nums text-[var(--ink)]">{value}</dd>
            </div>
          ))}
        </dl>
        <a
          href="#tilt-card"
          className={[
            "shrink-0 rounded-sm text-xs font-medium text-[var(--ink)]",
            "underline decoration-[var(--rule)] underline-offset-4",
            // G1/G2/G3 — one arbitrary transition naming every property, so nothing depends
            // on which utility Tailwind happens to emit last. A bare colour-transition
            // utility would resolve the default ease-in-out (the ramp G2 rules out) at
            // 150ms, under the 180-260ms enter band.
            //
            // G4/G11 — transform is on the BASE rule, not only inside the press. Declaring
            // it solely under :active means the after-change property list on release has
            // no transform in it, so the press returns with a snap.
            "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),text-decoration-color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
            "hover:decoration-[var(--ink)]",
            "active:[transform:scale(0.97)]",
            "focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
          ].join(" ")}
        >
          Add to wallet
        </a>
      </div>
    </TiltCard>
  );
}
