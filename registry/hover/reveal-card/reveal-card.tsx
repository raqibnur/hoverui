"use client";

import * as React from "react";

type RevealCardProps = React.ComponentPropsWithoutRef<"div"> & {
  /**
   * Rises into the space the media vacates. Required — the exchange needs both halves.
   *
   * For the keyboard path to exist, put something focusable in here (a link or a button).
   * `:has(:focus-visible)` is what drives the exchange for keyboard users, so a card whose
   * caption is plain text and whose media is an image has no keyboard affordance at all.
   */
  caption: React.ReactNode;
  /**
   * How far the media recedes, as a fraction of its own height. Leave it unset: by default
   * the component measures the caption and matches the two, which is the only relationship
   * that makes the effect work.
   *
   * With transform-origin at the top edge the media's bottom rises by
   * `recede * mediaHeight`, and that strip is the space the caption arrives into. Any value
   * smaller than the caption's own height lands the caption on top of media that never
   * moved — SCOPE §7's "Not this" verbatim, and invisible to whoever caused it, which is
   * why this is measured rather than left to a default that is only correct at one ratio.
   * Passing a number here opts out of the measurement.
   *
   * DESIGN CONSTRAINT, because the measurement cannot rescue you from it: the recession is
   * whatever the caption demands, so a tall caption demands a large one. SCOPE §7 asks the
   * media to scale down *slightly*, and a caption at 20% of the media's height gives a
   * recession to 80% — slight. At 40% it gives 60%, which no longer reads as receding; it
   * reads as a separate zoom-out. Keep the caption to roughly a quarter of the media or
   * less. If it must be taller, the honest fix is a taller media, not a smaller `recede`.
   */
  recede?: number;
  /** Saturation the media falls to while revealed. 1 keeps colour; 0 is fully grey. */
  saturation?: number;
};

/**
 * Ceiling on the derived recession. Set at the constraint the `recede` prop doc already
 * states in prose: past roughly a quarter of the media height the recession stops reading
 * as receding and starts reading as a separate zoom-out (SCOPE §7 asks for "slightly").
 */
const MAX_RECEDE = 0.28;

/**
 * Technique.
 *
 * The root sets custom properties under its trigger conditions and the children derive
 * transform and opacity from them. Custom properties do not themselves transition, but the
 * values derived from them do, so the interpolation is real. That indirection is what keeps
 * this file free of the failure modes pointer handlers bring: nothing to strand on touch,
 * no rect to go stale, no listener a consumer can replace, and — because the root is never
 * transformed — no way for the card's own motion to move its hit area out from under the
 * cursor.
 *
 * `--hui-duration` and `--hui-ease` ride the same trigger rules, which buys G4's asymmetry
 * without a second set of selectors: a transition uses the timing of the state it is
 * heading toward, so entering gets 220ms with the out-curve and leaving gets 420ms with the
 * spring.
 *
 * The exchange is ordered in both directions. Entering, the caption waits 60ms so the media
 * has visibly begun to leave before it arrives. Leaving, the *media* waits 60ms so the
 * caption clears first. Each delay is written as a calc that is only non-zero in the
 * direction it applies to.
 *
 * G16 — the exchange's transforms are `motion-safe:` only, so reduced motion runs no
 * exchange; the media's receded geometry is restated in a `motion-reduce:` class so the
 * branch actually rests where it claims to, instead of leaving the caption on top of an
 * image that never moved (SCOPE §7's "Not this"). The two sit in exclusive media
 * queries, so neither has to outrank the other. Reduced motion still desaturates on
 * hover or focus: `filter: saturate()` is colour, not movement, so it stays ungated and
 * is what the card has left to acknowledge the pointer. A device with no hover has no
 * pointer to acknowledge — there the filter is reachable only through `:focus-visible`.
 *
 * G12 — transform, filter and opacity only. G13 — the filter is applied only while
 * revealed, never at rest, so the media carries no standing stacking context.
 */
export function RevealCard({
  caption,
  recede,
  saturation = 0.25,
  className,
  children,
  ...props
}: RevealCardProps) {
  const root = React.useRef<HTMLDivElement>(null);
  const media = React.useRef<HTMLDivElement>(null);
  const cap = React.useRef<HTMLDivElement>(null);

  /**
   * Match the recession to the caption. A resize is human-frequency, so this is nowhere
   * near G14's concern — that gate is about per-pointer-event work, and there are no
   * pointer events in this component at all.
   */
  React.useEffect(() => {
    if (recede !== undefined) return;
    const r = root.current;
    const m = media.current;
    const c = cap.current;
    if (!r || !m || !c) return;
    const sync = () => {
      const mh = m.offsetHeight;
      const ch = c.offsetHeight;
      if (mh <= 0 || ch <= 0) return;
      const wanted = ch / mh;
      const next = String(Math.min(MAX_RECEDE, wanted));
      // Below the dedupe, never above it. This is a ResizeObserver callback on a full-width
      // media and an edge-to-edge caption, so a width drag runs it every frame — and once
      // the ratio is past the ceiling the clamped value stops changing, so the guard below
      // is already the latch. Warning above it logs at frame rate for the whole drag.
      if (r.style.getPropertyValue("--hui-recede") === next) return;
      if (process.env.NODE_ENV !== "production" && wanted > MAX_RECEDE) {
        console.warn(
          `[RevealCard] caption is ${Math.round(wanted * 100)}% of the media height; the ` +
            `recession is capped at ${Math.round(MAX_RECEDE * 100)}%, so the caption lands on ` +
            `${Math.round(ch - MAX_RECEDE * mh)}px of media that never moved. Use a taller ` +
            `media or a shorter caption.`,
        );
      }
      // A measurement is not an interaction. Applied hot, the first one plays a 420ms
      // spring on load wherever the card rests arrived (touch, no-hover).
      r.style.setProperty("--hui-duration", "0ms");
      r.style.setProperty("--hui-recede", next);
      void m.offsetHeight;
      r.style.removeProperty("--hui-duration");
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(m);
    ro.observe(c);
    return () => ro.disconnect();
  }, [recede]);

  return (
    <div
      {...props}
      ref={root}
      className={[
        "group/reveal",
        // Resting state, and the timing a leave uses (G3's 350-450ms release band).
        // `--hui-reveal` drives the caption; `--hui-recede` drives the media. They are
        // separate because the static branches below want one without the other.
        "[--hui-reveal:0] [--hui-duration:420ms] [--hui-ease:cubic-bezier(0.34,1.4,0.64,1)]",
        // Pointer trigger. G7 — `pointer-fine` supplies (pointer: fine) and Tailwind's
        // hover variant supplies (hover: hover), so a tap can never latch this on.
        "motion-safe:pointer-fine:hover:[--hui-reveal:1] pointer-fine:hover:[--hui-duration:220ms] pointer-fine:hover:[--hui-ease:cubic-bezier(0.23,1,0.32,1)]",
        // G9 — keyboard parity, deliberately not behind the pointer gate, since a keyboard
        // has no pointer to qualify. `:has(:focus-visible)` rather than `:focus-within`,
        // because focus-within also matches a mouse click and would fire this on press.
        "motion-safe:has-[:focus-visible]:[--hui-reveal:1] has-[:focus-visible]:[--hui-duration:220ms] has-[:focus-visible]:[--hui-ease:cubic-bezier(0.23,1,0.32,1)]",
        // G8/G10 — the two static branches: no hover available, or movement declined.
        // Both rest in the ARRIVED state, so the caption is present and readable without
        // any interaction (docs/DESIGN.md § Touch).
        //
        // The media recedes on BOTH branches, because the caption needs the vacated strip
        // to land in — the `motion-safe:` scale supplies it where movement is allowed, and
        // the media's own `motion-reduce:` scale restates the same geometry where it is
        // not. Neither branch applies the desaturation: that rides the hover and focus
        // selectors rather than this variable, so it stays an affordance rather than a
        // resting style.
        //
        // Written as the exact complement of the pointer trigger rather than
        // `pointer-coarse`, which is not its complement: a pen reports a fine pointer with
        // no hover and would match neither.
        //
        // G16 — doubled so these outrank the resting declaration above. A media query adds
        // no specificity, so without this the winner would be decided by emission order.
        "[@media_not_all_and_(hover:hover)_and_(pointer:fine)]:[&&]:[--hui-reveal:1]",
        "motion-reduce:[&&]:[--hui-reveal:1]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...(recede !== undefined
          ? ({ "--hui-recede": recede } as React.CSSProperties)
          : null),
        ...props.style,
        // Pinned after the consumer's style. Nothing in this component writes to the node
        // after mount except the measured `--hui-recede`, so these genuinely hold. They are
        // not overridable through `className` either — no class outranks an inline
        // declaration (G16); see AUTHORING's className caveat.
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
      }}
    >
      {/*
       * The media. transform-origin at the top edge pins the media's top, so the whole
       * vertical recession is spent at the bottom — recede * height, which is exactly the
       * strip the caption arrives into. The scale is uniform, so the media also insets
       * recede * width / 2 at each side: ≈29px per side at the preview's 262×140. That side
       * inset is decorative, not load-bearing, and it is the reason recede has to stay
       * small — it grows with media *width*, which nothing here measures.
       *
       * The saturation drop is applied only by the trigger rules, so at rest there is no
       * filter property at all and therefore no stacking context (G13).
       */}
      <div
        ref={media}
        className={[
          "motion-safe:[transform:scale(calc(1-var(--hui-recede,0.22)*var(--hui-reveal)))]",
          // G10 — a static scale is not movement. --hui-reveal is forced to 1 here, so this is
          // the same arrived geometry the no-hover branch rests in. Exclusive media query with
          // the line above, so no specificity contest (G16).
          "motion-reduce:[transform:scale(calc(1-var(--hui-recede,0.22)))]",
          "pointer-fine:group-hover/reveal:[filter:saturate(var(--hui-saturation))]",
          "group-has-[:focus-visible]/reveal:[filter:saturate(var(--hui-saturation))]",
        ].join(" ")}
        style={
          {
            "--hui-saturation": saturation,
            transformOrigin: "50% 0%",
            transitionProperty: "transform, filter",
            transitionDuration: "var(--hui-duration)",
            transitionTimingFunction: "var(--hui-ease), ease",
            // Leaving, the media waits for the caption to clear; entering, it goes first.
            transitionDelay: "calc(60ms * (1 - var(--hui-reveal)))",
          } as React.CSSProperties
        }
      >
        {children}
      </div>

      {/*
       * The caption. Clipped by the root's overflow at rest rather than merely transparent,
       * so it is genuinely outside the card and genuinely arrives — SCOPE §7's "Not this"
       * is a caption that fades in on top of an image that never moved.
       */}
      <div
        ref={cap}
        className="motion-safe:[transform:translateY(calc(100%-100%*var(--hui-reveal)))]"
        style={{
          position: "absolute",
          insetInline: 0,
          bottom: 0,
          zIndex: 1,
          opacity: "var(--hui-reveal)",
          transitionProperty: "transform, opacity",
          transitionDuration: "var(--hui-duration)",
          transitionTimingFunction: "var(--hui-ease), ease",
          // Entering, the caption waits for the media to move; leaving, it goes first.
          transitionDelay: "calc(60ms * var(--hui-reveal))",
        }}
      >
        {caption}
      </div>
    </div>
  );
}
