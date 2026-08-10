"use client";

import * as React from "react";

type LiquidFillButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  /**
   * Colour that floods in on hover. Defaults to the foreground token so it works on any
   * background without a prop. Pass any valid CSS colour value.
   */
  fillColor?: string;
  /**
   * Text colour when the fill is fully visible. Defaults to the background token.
   */
  fillTextColor?: string;
};

/**
 * Enter: fast enough to feel caused by the cursor, not a canned animation (G3).
 * The fill is the action; it gets the snappiest enter curve (G2: --ease-out).
 */
const ENTER_DURATION = "220ms";
const ENTER_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/**
 * Leave: slow, with a slight overshoot — the liquid feels like it has surface tension
 * and pulls back reluctantly. This is where the personality lives (G3, G4).
 */
const LEAVE_DURATION = "420ms";
const LEAVE_EASE = "cubic-bezier(0.34, 1.4, 0.64, 1)";

/**
 * Technique (G12, G15):
 * A full-size fill <span> sits inside the button, behind the label. Its background is
 * the fill colour. The reveal is driven by clip-path: circle(<r> at <x> <y>), where
 * --fill-x and --fill-y are the entry pixel expressed as % of the button box (set once
 * on pointer enter). clip-path is compositor-only (G12). The origin of the circle is
 * the exact entry pixel — circle(r at 0% 50%) floods from the left edge, circle(r at
 * 100% 50%) from the right edge, with no percentage-to-position inversion (G15).
 *
 * Radius % is resolved by CSS against sqrt((w²+h²)/2) (the RMS diagonal). A radius of
 * 150% therefore clears the full rectangle from any corner-anchored origin.
 *
 * G6: resting radius is 2% (non-zero — objects do not pop from nothing).
 */
const FILL_RADIUS_REST = "2%";
const FILL_RADIUS_FULL = "150%";

/**
 * G7's single query, subscribed rather than copied into state by an effect.
 *
 * The previous shape read the query in an effect body and called setState with the
 * result, which React 19 rejects (react-hooks/set-state-in-effect) and which rendered the
 * component twice on every mount: once inert, then again armed. useSyncExternalStore
 * subscribes to the same MediaQueryList with no intermediate render.
 *
 * These live at module scope because useSyncExternalStore compares the subscribe function
 * by identity — declared inside the component they would be new on every render and
 * resubscribe in a loop.
 */
const CAPABLE_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const subscribeCapable = (onStoreChange: () => void) => {
  const mq = window.matchMedia(CAPABLE_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
};

const getCapable = () => window.matchMedia(CAPABLE_QUERY).matches;

// Inert on the server — there is no cursor there. This must equal the client's
// pre-hydration value or the first paint is a hydration mismatch, and false was already
// what useState was seeded with.
const getCapableServer = () => false;

export function LiquidFillButton({
  fillColor = "currentColor",
  fillTextColor,
  className,
  children,
  ...props
}: LiquidFillButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const fillRef = React.useRef<HTMLSpanElement>(null);
  const labelRef = React.useRef<HTMLSpanElement>(null);

  /**
   * Gate: only arm pointer handlers for real cursors, and never under reduced motion
   * (G7). Changes arrive at human frequency, so a re-render on each one is acceptable
   * (G14). When capable is false (touch or reduced motion), the fill still appears but
   * snaps without animation, preserving meaning (G10).
   *
   * Subscribed rather than copied into state by an effect — see the note on the module
   * constants above.
   */
  const capable = React.useSyncExternalStore(
    subscribeCapable,
    getCapable,
    getCapableServer,
  );

  /**
   * Write clip-path vars and transition directly onto the fill span (G14).
   * The button element never receives an inline transition, so Tailwind active:
   * and focus-visible: variants on the button always win (G16, G11).
   */
  const applyFill = (
    fill: HTMLSpanElement,
    label: HTMLSpanElement | null,
    opts: {
      x: string;
      y: string;
      radius: string;
      transitionDuration: string;
      transitionEase: string;
      animated: boolean;
    },
  ) => {
    // G15 fix: strict ordering guarantees the origin mutation is committed while the
    // clip-path transition is `none`, so only the radius change interpolates.
    // Order: removeProperty("transition") → set --fill-x/--fill-y → force reflow →
    //        set transition → set --fill-radius.
    // Setting the origin AFTER removing the transition — and BEFORE the reflow — ensures
    // the browser records the new origin as the transition start-state. Any previous
    // armed transition is cancelled first, so the origin can never slide from a prior
    // entry/exit point. Applies on both enter and leave (G15).
    fill.style.removeProperty("transition");

    // Position vars are set on the button so they cascade into the fill span.
    const btn = buttonRef.current;
    if (btn) {
      btn.style.setProperty("--fill-x", opts.x);
      btn.style.setProperty("--fill-y", opts.y);
    }

    if (opts.animated) {
      // `void` is already an allowed expression statement, so the disable directive that
      // used to sit here reported as unused.
      void fill.offsetWidth; // force reflow: pins origin before transition is re-armed
      fill.style.setProperty(
        "transition",
        `clip-path ${opts.transitionDuration} ${opts.transitionEase}`,
      );
    }
    // Reduced-motion path: transition stays removed — fill snaps instantly.
    // The colour transition on the label is kept (movement removed, meaning stays — G10).

    fill.style.setProperty("--fill-radius", opts.radius);

    if (label && fillTextColor) {
      if (opts.animated) {
        label.style.setProperty(
          "transition",
          `color ${opts.transitionDuration} ease`,
        );
      } else {
        // Reduced motion keeps a colour transition so meaning is never absent (G10).
        label.style.setProperty("transition", "color 200ms ease");
      }
      if (opts.radius === FILL_RADIUS_FULL) {
        label.style.setProperty("color", fillTextColor);
      } else {
        label.style.removeProperty("color");
      }
    }
  };

  /**
   * On pointer enter: record where the cursor crossed the button edge as % of the
   * button's own bounding box. These become the clip-path origin, so the circle provably
   * originates at the entry pixel (G15). Left-edge entry → --fill-x ≈ 0% → circle
   * anchored at left → fills from left. Right-edge entry → --fill-x ≈ 100% → fills from
   * right. No background-position inversion, no coordinate system mismatch.
   *
   * Under reduced motion (capable = false): jump to filled state with no animation.
   * Movement is removed; colour change is kept so meaning survives (G10).
   */
  const enter = (e: React.PointerEvent<HTMLButtonElement>) => {
    const fill = fillRef.current;
    if (!fill) return;
    const btn = buttonRef.current;
    if (!btn) return;

    const box = btn.getBoundingClientRect();
    const fx = (((e.clientX - box.left) / box.width) * 100).toFixed(2) + "%";
    const fy = (((e.clientY - box.top) / box.height) * 100).toFixed(2) + "%";

    applyFill(fill, labelRef.current, {
      x: fx,
      y: fy,
      radius: FILL_RADIUS_FULL,
      transitionDuration: ENTER_DURATION,
      transitionEase: ENTER_EASE,
      // G7/G10: no clip-path animation under reduced motion; fill still appears.
      animated: capable,
    });
  };

  /**
   * On pointer leave: record the exit point and retract the circle toward it.
   * Setting the origin to the exit point makes the collapse directionally honest — the
   * flood retreats toward where the cursor left (G15).
   */
  const leave = (e: React.PointerEvent<HTMLButtonElement>) => {
    const fill = fillRef.current;
    if (!fill) return;
    const btn = buttonRef.current;
    if (!btn) return;

    if (capable) {
      const box = btn.getBoundingClientRect();
      const fx =
        (((e.clientX - box.left) / box.width) * 100).toFixed(2) + "%";
      const fy =
        (((e.clientY - box.top) / box.height) * 100).toFixed(2) + "%";

      applyFill(fill, labelRef.current, {
        x: fx,
        y: fy,
        radius: FILL_RADIUS_REST,
        transitionDuration: LEAVE_DURATION,
        transitionEase: LEAVE_EASE,
        animated: true,
      });
    } else {
      // Reduced motion: collapse immediately, no animation (G10).
      applyFill(fill, labelRef.current, {
        x: "50%",
        y: "50%",
        radius: FILL_RADIUS_REST,
        transitionDuration: LEAVE_DURATION,
        transitionEase: LEAVE_EASE,
        animated: false,
      });
    }
  };

  /**
   * G9 — Keyboard arrival state.
   * A keyboard user has no cursor position, so the fill appears centred and fully
   * covering — the same visual result a mouse user sees, without directional tracking.
   * Written via style.setProperty (G14). Focus fires for both mouse and keyboard; the
   * fill is idempotent if already shown by the pointer enter handler.
   * Animation is omitted on focus: keyboard users do not watch an approach, so the
   * animated entry adds no meaning and could be distracting.
   */
  const onFocus = () => {
    const fill = fillRef.current;
    const btn = buttonRef.current;
    if (!fill || !btn) return;

    // Centre the origin; radius grows to full coverage (G9).
    btn.style.setProperty("--fill-x", "50%");
    btn.style.setProperty("--fill-y", "50%");
    // No transition on focus — fill appears instantly (keyboard users expect no animation).
    fill.style.removeProperty("transition");
    fill.style.setProperty("--fill-radius", FILL_RADIUS_FULL);

    const label = labelRef.current;
    if (label && fillTextColor) {
      label.style.removeProperty("transition");
      label.style.setProperty("color", fillTextColor);
    }
  };

  /**
   * G9 continued — collapse the fill when keyboard focus leaves.
   */
  const onBlur = () => {
    const fill = fillRef.current;
    if (!fill) return;

    fill.style.removeProperty("transition");
    fill.style.setProperty("--fill-radius", FILL_RADIUS_REST);

    const label = labelRef.current;
    if (label && fillTextColor) {
      label.style.removeProperty("transition");
      label.style.removeProperty("color");
    }
  };

  return (
    <button
      ref={buttonRef}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={onFocus}
      onBlur={onBlur}
      style={
        {
          "--fill-x": "50%",
          "--fill-y": "50%",
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          /**
           * NO inline transition on the button element. Keeping the button's inline
           * style transition-free means the Tailwind active:[transition:...] class is
           * never overridden by a higher-specificity inline rule, so the press
           * animates at the correct 140ms curve (G11, G16).
           */
        } as React.CSSProperties
      }
      className={[
        // Base layout
        "inline-flex items-center justify-center",
        // Press feedback: compositor-only scale (G11, G12).
        // Written as an arbitrary transform, not the `scale-*` shorthand: in Tailwind v4
        // that utility emits the standalone `scale` property, which neither transition
        // below names, so it would make both rules dead code and snap the press at 0ms.
        // (Spelling the class out literally here would also make Tailwind emit it.)
        // Base transition handles the spring-back when :active ends (G4, G3).
        // active:[transition:...] overrides it during the press (active: adds specificity).
        // G16: these two rules touch the same property (transform); active: wins because
        // :active pseudo-class adds one selector component over the bare utility.
        "[transition:transform_420ms_cubic-bezier(0.34,1.4,0.64,1)]",
        "active:[transform:scale(0.97)]",
        "active:[transition:transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
        /**
         * G9 — :focus-visible ring. The filled state is applied via onFocus/onBlur
         * handlers (JS-driven, same as pointer handlers), so only the ring is needed
         * here. G16: focus-visible: and active: touch different properties (ring vs
         * transform), so they never compete. The base [transition:transform...] class and
         * active:[transition:transform...] class both target transform; focus-visible
         * targets outline/ring — three separate properties, zero conflicts.
         */
        // G9: ring-offset-2 draws the ring outside the flooded surface so it stays
        // visible over the fill regardless of fillColor. ring-current picks up the
        // button's text colour which is the inverse of the fill, providing contrast.
        // With offset the ring renders against the page background, never dark-on-dark.
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {/*
       * Fill layer: absolutely positioned, full-size, z-index below the label.
       * Background is the fill colour. clip-path grows from a 2% circle at the entry
       * pixel to a 150% circle covering the whole button (G6, G12, G15).
       *
       * The fill is NOT the button's background-image. It is a child element behind the
       * label. This means any consumer bg-* class on the button sets the button's own
       * background-color, which shows through wherever clip-path leaves the fill layer
       * absent — robustness: fill works above any consumer background (G8 resting state
       * still shows the button's own background colour through the tiny 2% circle).
       *
       * Transition is written by applyFill() via style.setProperty() (G14). It is never
       * set here as a Tailwind class so it cannot conflict with the button element's
       * active:[transition:transform...] — different elements, different transition lists.
       */}
      <span
        ref={fillRef}
        aria-hidden="true"
        style={
          {
            "--fill-radius": FILL_RADIUS_REST,
            position: "absolute",
            inset: 0,
            background: fillColor,
            // clip-path is compositor-only (G12). Radius starts at 2% (G6: not from 0).
            // Origin reads --fill-x / --fill-y inherited from the button element (G15).
            clipPath:
              "circle(var(--fill-radius) at var(--fill-x) var(--fill-y))",
            // z-index: -1 would put it below the button's own background-color layer if
            // background-color is set; 0 sits above background-color but below the label
            // (which has position:relative and therefore its own stacking context above
            // non-positioned elements). Using isolation:isolate on the button and
            // position:relative on the label is sufficient — no z-index juggling needed.
            zIndex: 0,
            pointerEvents: "none",
          } as React.CSSProperties
        }
      />
      {/*
       * Label: position:relative creates a stacking context above the fill span (z:0),
       * so the text always sits on top of the flood. Colour transition uses plain ease
       * per the G2 note ("Colour and opacity: plain ease is fine"). The transition is
       * overridden per-event by applyFill() via style.setProperty() (G14).
       */}
      <span
        ref={labelRef}
        style={
          {
            position: "relative",
            zIndex: 1,
            pointerEvents: "none",
          } as React.CSSProperties
        }
      >
        {children}
      </span>
    </button>
  );
}
