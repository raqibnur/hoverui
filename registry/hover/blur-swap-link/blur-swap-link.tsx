import * as React from "react";

type BlurSwapLinkProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  /** The label at rest. This is the real text — the one assistive technology reads. */
  children: string;
  /** The label that racks into focus. Hidden from assistive technology; see below. */
  swap: string;
  /**
   * How far out of focus each label travels. Relative by default so it scales with the
   * type it is set in: a fixed 5px obliterates 14px body copy and is barely perceptible at
   * hero scale, which would make "rack focus" mean two different effects at two sizes.
   */
  depth?: string;
};

/**
 * The lead, as a fraction of the whole exchange.
 *
 * This constant IS the effect. SCOPE §11's "Not this" is an opacity crossfade with a
 * defocus bolted on, and the only thing separating the two is which channel moves first:
 * the departing label goes soft while still fully opaque, and the arriving one becomes
 * visible while still soft. At 0 the channels move in lockstep and it reads as a fade with
 * an artifact, which is the failure named in the spec.
 *
 * What that means per label depends on the direction, not on which span it is — see the
 * note above `timing()`. Whichever channel leads runs from zero delay for
 * `duration - 0`, and the trailing one waits out `LEAD * duration` and runs the remainder,
 * so both land together.
 *
 * Two figures, because they are easy to conflate: on the out-curve, 0.375 of the DURATION
 * has already burned ~91% of the radius. The "70% soft with opacity still exactly 1"
 * reading from the browser samples is at ~52ms ELAPSED of a 240ms exchange, which is a
 * different point on the same curve.
 *
 * The 0.375 lives literally in the `--hui-lead` class strings below and is not named as a
 * constant here: Tailwind scans source text, so a class assembled by interpolation is never
 * generated and the declaration silently goes missing. Naming it as well would only leave a
 * second source of truth to drift.
 */

/**
 * G3 — 240ms sits in the 180-260ms enter band, 400ms in the 350-450ms release band, and
 * G4's asymmetry is carried by those two numbers. Both live literally in the class strings
 * below rather than as constants: Tailwind scans source text, so a class assembled by
 * interpolation is never generated and the declaration silently goes missing.
 *
 * Both directions take the out-curve rather than the spring the release band's note pairs
 * with. A spring overshoots past its target, and past a zero radius the value is invalid
 * and clamps, so the overshoot is spent sitting still rather than reading as momentum.
 *
 * KNOWN GAP, raised rather than solved again: this is the third effect in this library to
 * need an evenly-decaying decelerator that the three project curves do not offer —
 * `draw-underline` and `chase-border-card` made the same deviation for the same reason.
 * Three effects now quietly contradict G3's stated curve pairing, which is a question for
 * docs/MOTION.md rather than a fourth private workaround.
 */

/**
 * Technique — no JavaScript ships. A server component with no hooks and no handlers.
 *
 * Both labels occupy one cell of an inline-level layout, so the box is the wider of the
 * two and neither state can shift anything: SCOPE §11 asks for identical space, and a
 * single shared cell is the only way to get it without measuring.
 *
 * The host publishes four custom properties and each label derives its own optics from
 * them, in opposite directions. The optical pair is expressed as whole values — `none` on
 * the idle side rather than a zero radius — because a non-`none` optical declaration is a
 * permanent stacking context and takes text off the subpixel-antialiasing path, so a
 * resting link would render fractionally lighter than the sentence around it (G13). `none`
 * interpolates against a radius as the identity, so nothing about the exchange changes.
 *
 * Custom properties do not themselves interpolate, but the values derived from them do. A
 * change uses the timing of the state it is heading toward, which is what buys the
 * asymmetry without a second set of selectors.
 *
 * G12 — the optical property and `opacity`, both on its list. G13 — no `will-change`, and
 * nothing paints through an effect layer at rest.
 *
 * G10 — reduced motion keeps the exchange and drops the animation, by zeroing the duration
 * rather than by removing a channel. The label still swaps, so every bit of information
 * survives; what goes is the 400ms of animated defocus. That matches how the rest of this
 * library reads the gate — `draw-underline` commits its rule fully drawn, `reveal-card`
 * rests in the arrived geometry — and it corrects an earlier claim in this file that G10
 * names the optical channel as one it keeps. It does not; it names opacity and colour.
 *
 * G8 — on touch and anywhere without hover the link rests showing `children`, sharp and
 * fully opaque, and the exchange never runs. That is the finished state rather than an
 * absent one: the label a reader needs is the one on screen. Nothing can strand, because
 * no handler exists to leave the pair half-swapped.
 *
 * G6 — the arriving label starts fully sized and fully soft rather than scaled down, so it
 * resolves out of a defocus instead of popping into existence.
 */
export function BlurSwapLink({
  children,
  swap,
  depth = "0.32em",
  className,
  ...props
}: BlurSwapLinkProps) {
  /**
   * The lead is derived from the STATE, not bound to a span — and that distinction is the
   * whole correctness argument.
   *
   * Which label is departing and which is arriving swaps with the direction: on the way in
   * `children` leaves and `swap` arrives; on the way out those roles invert. Bind the two
   * timing objects to the spans and the mirroring is right in one direction and exactly
   * backwards in the other — the departing label fading while still sharp, the arriving one
   * appearing already resolved, both of them SCOPE §11's "Not this", on the longer 400ms
   * half that the eye ends on.
   *
   * So each channel's delay is written as a function of `--hui-swap`. Transitions read
   * `transition-*` from the after-change style, where that variable already holds the
   * TARGET state, so the same declaration means "optics lead" heading one way and "opacity
   * lead" heading the other. Departing always leads with optics; arriving always leads with
   * opacity; nothing has to know which is which.
   *
   * Each channel runs `duration - its own delay`, so both land together whichever way the
   * exchange is going.
   */
  const OPTICS_FIRST = "var(--hui-lead) * (1 - var(--hui-swap))";
  const OPACITY_FIRST = "var(--hui-lead) * var(--hui-swap)";

  const timing = (opticsDelay: string, opacityDelay: string) =>
    ({
      transitionProperty: "filter, opacity",
      transitionDelay: `calc(${opticsDelay}), calc(${opacityDelay})`,
      transitionDuration: `calc(var(--hui-duration) - ${opticsDelay}), calc(var(--hui-duration) - ${opacityDelay})`,
      // Plain ease on opacity per MOTION.md's easing note; the project out-curve on the
      // channel doing the work.
      transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1), ease",
    }) as const;

  /** `children`: optics lead while it departs (swap -> 1), opacity leads while it arrives. */
  const baseTiming = timing(OPTICS_FIRST, OPACITY_FIRST);
  /** `swap`: the mirror — opacity leads while it arrives, optics lead while it departs. */
  const swapTiming = timing(OPACITY_FIRST, OPTICS_FIRST);

  return (
    <span
      {...props}
      style={{ ...props.style, ["--hui-depth" as string]: depth }}
      className={[
        "inline-grid",
        // Resting state, and the timing a leave uses.
        "[--hui-swap:0] [--hui-duration:400ms] [--hui-lead:calc(400ms*0.375)] [--hui-out:none] [--hui-in:blur(var(--hui-depth))]",
        // Pointer trigger on the label itself. G7 — `pointer-fine` supplies (pointer: fine)
        // and Tailwind's hover variant supplies (hover: hover), so a tap cannot latch it.
        "pointer-fine:hover:[--hui-swap:1] pointer-fine:hover:[--hui-duration:240ms] pointer-fine:hover:[--hui-lead:calc(240ms*0.375)] pointer-fine:hover:[--hui-out:blur(var(--hui-depth))] pointer-fine:hover:[--hui-in:none]",
        // The host itself, when a consumer makes it focusable.
        "focus-visible:[--hui-swap:1] focus-visible:[--hui-duration:240ms] focus-visible:[--hui-lead:calc(240ms*0.375)] focus-visible:[--hui-out:blur(var(--hui-depth))] focus-visible:[--hui-in:none]",
        // The ordinary case: this sits inside a link or button with padding around it. The
        // media query is written out rather than left to `pointer-fine:`, because a literal
        // hover pseudo-class inside an arbitrary variant bypasses Tailwind's own wrapper, so
        // (hover: hover) would never be emitted and a pen — a fine pointer with no hover —
        // would latch the exchange on tap (G7).
        "[@media(hover:hover)_and_(pointer:fine)]:[:is(a,button,[role=button],summary):hover_&]:[--hui-swap:1] [@media(hover:hover)_and_(pointer:fine)]:[:is(a,button,[role=button],summary):hover_&]:[--hui-duration:240ms] [@media(hover:hover)_and_(pointer:fine)]:[:is(a,button,[role=button],summary):hover_&]:[--hui-lead:calc(240ms*0.375)] [@media(hover:hover)_and_(pointer:fine)]:[:is(a,button,[role=button],summary):hover_&]:[--hui-out:blur(var(--hui-depth))] [@media(hover:hover)_and_(pointer:fine)]:[:is(a,button,[role=button],summary):hover_&]:[--hui-in:none]",
        // G9 — keyboard parity, ungated by pointer since a keyboard has none to qualify.
        // Scoped to the same interactive ancestors as the hover rule above, deliberately:
        // an unscoped focus-visible ancestor selector also matches a container focused
        // programmatically — a `main` with tabindex="-1" reached by a skip link, or an open
        // dialog — which would strand every instance inside it in the swapped state with no
        // pointer involved and no way to clear it.
        "[:is(a,button,[role=button],summary):focus-visible_&]:[--hui-swap:1] [:is(a,button,[role=button],summary):focus-visible_&]:[--hui-duration:240ms] [:is(a,button,[role=button],summary):focus-visible_&]:[--hui-lead:calc(240ms*0.375)] [:is(a,button,[role=button],summary):focus-visible_&]:[--hui-out:blur(var(--hui-depth))] [:is(a,button,[role=button],summary):focus-visible_&]:[--hui-in:none]",
        // G10 — see the note above the component. Quadrupled, and the count is not
        // arbitrary: :is() takes the specificity of its most specific argument, and
        // [role=button] is an attribute selector, so :is(a,button,[role=button],summary)
        // is (0,1,0) — making the ancestor rules (0,1,0)+(0,1,0)+(0,1,0) = (0,3,0), an
        // exact tie with a tripled class that source order would then decide. A media
        // query adds no specificity of its own (G16), so the class count is the only
        // lever. Measured: tripled loses to the ancestor rule, quadrupled wins.
        "motion-reduce:[&&&&]:[--hui-duration:0ms]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/*
       * At rest. Real text, so this is the accessible name and what find-in-page matches.
       * It racks out: sharp and opaque idle, soft and gone once engaged.
       */}
      <span
        className="col-start-1 row-start-1"
        style={{ ...baseTiming, filter: "var(--hui-out)", opacity: "calc(1 - var(--hui-swap))" }}
      >
        {children}
      </span>

      {/*
       * The replacement, racking in as the other racks out — the mirror of the values above.
       *
       * Hidden from assistive technology because the swap is decorative: the link's identity
       * is `children`, and announcing both would describe one destination as two things.
       * Note this is a deliberate choice and NOT a claim that the swapped state is
       * unreachable without a pointer — the keyboard rules above rack it on focus, so a
       * sighted keyboard user does see this label while the link announces the other.
       *
       * Opted out of selection for the same reason. Both labels are real text in one cell,
       * so without this a drag across the link copies both — aria-hidden governs the
       * accessibility tree, not the selection. A copy now always yields `children`.
       */}
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1"
        style={{
          ...swapTiming,
          filter: "var(--hui-in)",
          opacity: "var(--hui-swap)",
          userSelect: "none",
        }}
      >
        {swap}
      </span>
    </span>
  );
}
