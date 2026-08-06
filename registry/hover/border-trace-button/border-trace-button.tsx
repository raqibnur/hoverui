"use client";

import * as React from "react";

type BorderTraceButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  /**
   * Colour of the travelling light and the low glow it hands off to. Defaults to
   * currentColor so it works on any background/text colour without a prop.
   */
  traceColor?: string;
};

/**
 * Technique (SCOPE.md §3, G5, G12):
 * A masked ring sits on the button's own box — padding + mask-composite:"exclude" knocks
 * out the interior, leaving only a border-width annulus (the classic gradient-border
 * trick). Two children live inside that mask, so both are clipped to the ring for free:
 *   - the lap: an oversized conic-gradient square, rotated exactly once by @keyframes
 *     (transform + opacity only — compositor-only, G12).
 *   - the glow: a flat fill of the same colour, held at a low opacity once the lap hands
 *     off (G4: the settle is the point, not the trip around).
 * `@keyframes hui-trace-lap` ships via registry.json's `css` field (AUTHORING.md §4) and
 * this repo's app/globals.css, so nothing here requires a manual stylesheet edit on
 * install (docs/AUTHORING.md §6 gate).
 *
 * G5's exception is named for this effect specifically: keyframes are correct here
 * because the lap is genuinely continuous, one-shot motion, not something a cursor
 * retargets — transitions only take over for the settle and the leave.
 *
 * Named group (G15/G16): `group/trace` — not a bare `group`. Tailwind's `group-hover:`
 * matches ANY ancestor carrying the `group` class, and components/gallery/tile.tsx puts
 * a bare `group` on the tile `<article>`. An unnamed group here would fire the lap the
 * moment the cursor enters the tile, ~100px before it reaches the button — in the one
 * place the effect is demonstrated, the lap would finish before the user arrives. The
 * `/trace` namespace scopes matching to this button specifically.
 */
export function BorderTraceButton({
  traceColor = "currentColor",
  className,
  children,
  ...props
}: BorderTraceButtonProps) {
  return (
    <button
      style={{ "--hui-trace-color": traceColor } as React.CSSProperties}
      className={[
        "group/trace relative isolate inline-flex items-center justify-center",
        // Press feedback (G11, G12): compositor-only scale, written as an arbitrary
        // `transform` property (magnetic-button.tsx's form) rather than the `scale-*`
        // utility. In Tailwind v4, `scale-[0.97]` emits the standalone `scale` property,
        // not `transform` — neither transition below names `scale`, so a `scale-*`
        // utility here would snap on both press and release instead of animating.
        // Only :active ever sets a `transform` value; the base rule only supplies the
        // release transition, so when :active stops matching, this 420ms spring picks up
        // the change back to rest (G3, G4).
        "[transition:transform_420ms_cubic-bezier(0.34,1.4,0.64,1)]",
        "active:[transform:scale(0.97)]",
        "active:[transition:transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
        // G9 — a keyboard user has no cursor, so :focus-visible below drives the exact
        // same lap-then-glow arrival as :hover. This ring just makes the focus itself
        // legible on top of it. No ring-offset: its default colour is white and halos on
        // non-white backgrounds (magnetic-button.tsx documents the same call) — and
        // there's no flood here for an offset to clear in the first place.
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/*
       * Ring mask: static, never animated, so it costs nothing at rest (G12/G13 only
       * constrain what actually moves). padding controls the visible band's thickness;
       * the two-layer content-box/border-box mask XORed with "exclude" leaves only that
       * band opaque. Both the unprefixed `mask*` and `-webkit-mask*` pairs are set
       * explicitly — without the unprefixed pair, an engine that doesn't alias
       * `-webkit-mask` renders no mask at all, i.e. a filled rectangle under a colour
       * wash, not a degraded ring. border-radius: inherit keeps it locked to whatever
       * shape the consumer's className puts on the button. overflow: hidden confines the
       * oversized children below to this box before the mask even applies.
       */}
      <span
        aria-hidden="true"
        style={
          {
            position: "absolute",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
            borderRadius: "inherit",
            padding: "1.5px",
            pointerEvents: "none",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
          } as React.CSSProperties
        }
      >
        {/*
         * The hold: a flat fill of the ring. Rest: invisible. Armed (hover/focus-visible,
         * motion allowed): rises to a low opacity, delayed ~450ms so it starts climbing
         * before the lap's own tail (keyframe 88%-100% of a 600ms lap = 528ms-600ms) has
         * finished fading — the handoff reads as one gesture, not a cut (G4). At a 600ms
         * lap + ~450ms delay the hold is reachable within a normal pass over a button, not
         * only after a full second of held-still hovering (G15: "holding" has to actually
         * be reachable). Leave: an un-gated, un-delayed opacity transition always sits on
         * the base rule, so whatever state the glow is in when the pointer/focus leaves,
         * it eases cleanly back to 0 — no stranded state, mid-lap or fully settled (G3:
         * 350-450ms release band; plain ease is correct for opacity per G2).
         *
         * `pointer-fine:` (built-in variant) gates every hover-triggered rule here,
         * including the reduced-motion one — `group-hover:` already supplies
         * `@media (hover: hover)` itself (Tailwind v4's default), so stacking
         * `pointer-fine:` on top reproduces G7's full
         * `(hover: hover) and (pointer: fine)` on both the motion-safe AND
         * motion-reduce branches symmetrically. Focus-visible rules stay ungated — a real
         * keyboard has no hover capability to check (G9).
         */}
        <span
          aria-hidden="true"
          className={[
            "absolute inset-0 opacity-0",
            "[transition:opacity_400ms_ease]",
            "motion-safe:pointer-fine:group-hover/trace:opacity-40",
            "motion-safe:pointer-fine:group-hover/trace:[transition:opacity_260ms_ease_450ms]",
            "motion-safe:group-focus-visible/trace:opacity-40",
            "motion-safe:group-focus-visible/trace:[transition:opacity_260ms_ease_450ms]",
            // G10 — reduced motion keeps the information (the glow still appears) and
            // drops the delay along with the lap: it jumps straight to settled.
            "motion-reduce:pointer-fine:group-hover/trace:opacity-40",
            "motion-reduce:pointer-fine:group-hover/trace:[transition:opacity_180ms_ease]",
            "motion-reduce:group-focus-visible/trace:opacity-40",
            "motion-reduce:group-focus-visible/trace:[transition:opacity_180ms_ease]",
          ].join(" ")}
          style={{ background: "var(--hui-trace-color)" } as React.CSSProperties}
        />

        {/*
         * The lap: one point of light, one rotation, then it fades into the glow above.
         * Oversized (300% of the ring, recentred) so a full rotation clears every corner
         * of any reasonable aspect ratio.
         *
         * The gradient head/tail below is wide on purpose. Rotating one conic-gradient
         * behind a rectangular mask does not move at a uniform pixel speed: local speed
         * is proportional to the distance from the rotation centre to the ring at that
         * point, and on a wide pill that distance is far smaller at the top/bottom-centre
         * than at the rounded ends — on this preview's ~2.5:1 pill the difference is
         * roughly an order of magnitude, not "slight". A narrow gradient stop all but
         * disappears along the slow straight edges. Widening it keeps the core legible
         * there; the cost is a longer streak through the fast corners, which reads as a
         * motion-blur trail rather than a glitch. Fully equalising the speed would mean
         * tracing the actual border path (an SVG stroke-dashoffset redesign) instead of a
         * rotated conic-gradient — a different technique, out of scope for this fix.
         *
         * Base rule carries the leave transition for opacity ONLY — no `transform` in the
         * list. Leaving mid-rotation removes the `animation` rule, which reverts
         * `transform` to the base `rotate(0deg)` outright — there is no other value for
         * it to hold. Putting `transform` in the transition would have driven that revert
         * through every intermediate angle, i.e. sent the light backwards around the
         * ring, with spring overshoot on top, and is also engine-dependent (some engines
         * don't start a transition off a value change caused by an animation being
         * removed, which would make it a hard cut instead). Dropping it trades a
         * theoretical one-frame position reset for an honest, always-smooth fade: the
         * reset is masked by the opacity transition starting on the very same frame, and
         * the layer is already mostly transparent for anyone who left during the hold
         * (the common case) or fading fast for anyone who left mid-lap.
         */}
        <span
          aria-hidden="true"
          className={[
            "absolute top-1/2 left-1/2 h-[300%] w-[300%] opacity-0",
            "[transform:translate(-50%,-50%)_rotate(0deg)]",
            "[transition:opacity_380ms_ease]",
            // Capable pointer + motion allowed: exactly one lap (G5, G7, G15 — reachable
            // in well under a second; see the glow comment above for the retiming math).
            "motion-safe:pointer-fine:group-hover/trace:[animation:hui-trace-lap_600ms_linear_1]",
            // Keyboard arrival: same single lap, no pointer/touch gate (G9).
            "motion-safe:group-focus-visible/trace:[animation:hui-trace-lap_600ms_linear_1]",
            // G10 — under reduced motion the lap never runs; only the glow (above) marks
            // the arrival. Movement is removed, the meaning (something is armed) stays.
          ].join(" ")}
          style={
            {
              background:
                "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 255deg, color-mix(in oklch, var(--hui-trace-color) 45%, transparent) 300deg, var(--hui-trace-color) 344deg, var(--hui-trace-color) 360deg)",
            } as React.CSSProperties
          }
        />
      </span>

      <span className="relative z-[1]">{children}</span>
    </button>
  );
}
