"use client";

import * as React from "react";

type ChaseBorderCardProps = React.ComponentPropsWithoutRef<"div"> & {
  /**
   * Colour of the travelling gradient. Defaults to currentColor so the card works on any
   * background without a prop and without depending on a token a consumer may not have.
   */
  chaseColor?: string;
  /**
   * Seconds for one full revolution. SCOPE §8 asks for "slow enough that it reads as
   * expensive", and the speed is the effect: the difference between this and the version
   * on every AI-generated landing page of the last two years is that this one is not in a
   * hurry. Below about 4s it starts to read as a loading spinner.
   */
  period?: number;
  /** Thickness of the ring in px. Named for the ring, not the card — it is not a width. */
  ringWidth?: number;
};

/**
 * The stop. G3's release band is 350-450ms.
 *
 * Deliberately the out-curve rather than the spring the band's note names: a spring
 * overshoots past its target and settles back, which on an angle means the gradient
 * briefly runs *backwards*. A chase that reverses reads as a glitch, not as momentum. G2
 * allows any of the three project curves and this is one of them.
 */
const STOP_MS = 420;
const STOP_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/**
 * Initial slope of STOP_EASE — for cubic-bezier(x1,y1,x2,y2) that is y1/x1, here 1/0.23.
 * A transition covering D degrees in T seconds on this curve *starts* at D·slope/T deg/s,
 * so the coast distance is not a free choice: it is whatever makes that opening velocity
 * equal the speed the ring was already turning at. Pick it by feel and the ring lurches —
 * 30° over 420ms opens at 310 deg/s against a 7s spin's 51 deg/s, a 6x flick forward,
 * which is the "cutting" SCOPE §8 rules out wearing an easing curve. Matched, the
 * transition picks up exactly where the animation left off and decays to nothing.
 */
const STOP_SLOPE = 1 / 0.23;
const coastDegrees = (period: number) =>
  ((360 / period) * (STOP_MS / 1000)) / STOP_SLOPE;

/** Ring opacity while the pointer or keyboard focus is on it. */
const RING_ACTIVE = "1";
/**
 * Ring opacity with nothing on it — on every device, not just the ones without hover.
 * docs/FIXES.md G8: let hover change emphasis rather than existence. SCOPE §8 gates the
 * *rotation* ("a gradient border rotates only while hovered"), not the border, so the
 * border is part of the card at rest and the chase is what hover adds. It also has to be
 * visible for the coast to be worth anything: fade the ring out on leave and the terminal
 * resting position — the entire point of stopping rather than cutting — is never seen.
 *
 * Written as the fallback inside `var()` rather than as a separate rule so there is no
 * declaration to lose: if the custom property is missing for any reason the ring rests at
 * this value instead of failing open to a fully lit border.
 */
const RING_REST = "0.55";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Technique (G5, G12, G13).
 *
 * A masked annulus holds an oversized conic-gradient square, and the square is *rotated*.
 *
 * SCOPE §8's technique note suggests keyframes on an angle var, which would mean
 * registering `--angle` with `@property` and animating it inside the gradient. That
 * produces the same picture and repaints the whole layer every frame for as long as the
 * pointer rests on the card — G12 restricts animation to transform, opacity, filter and
 * clip-path precisely to avoid that. Rotating a gradient that was painted once is
 * compositor work, so this rotates the element instead of the gradient. The visual is
 * identical; the deviation is the cost, not the look.
 *
 * G5 names this effect as one of the two legitimate uses of keyframes, because the motion
 * is genuinely continuous rather than cursor-tracked. The gate's actual worry — keyframes
 * restarting from frame zero when a user sweeps a grid — is handled by resuming with a
 * negative `animation-delay` computed from the angle the ring is already at, so re-entry
 * picks up exactly where the coast left off instead of snapping to 0deg.
 *
 * The stop is the part SCOPE cares about ("eases to a stop on leave rather than cutting").
 * A CSS animation cannot decelerate, so leaving reads the angle out of the computed
 * matrix, pins it, drops the animation, and hands the rest to a transition that carries it
 * `coastDegrees(period)` further and eases out. That handoff is why the angle has to be
 * recoverable at any instant, and it is the reason the rotation lives on `transform`
 * rather than on a custom property: a matrix can be decomposed, a mid-flight keyframed
 * variable cannot.
 */
export function ChaseBorderCard({
  chaseColor = "currentColor",
  period = 7,
  ringWidth = 1,
  className,
  children,
  ...props
}: ChaseBorderCardProps) {
  const rotor = React.useRef<HTMLSpanElement>(null);
  const ring = React.useRef<HTMLSpanElement>(null);
  /** Hover and focus are held apart so neither one's exit cancels the other. */
  const hovering = React.useRef(false);
  const focused = React.useRef(false);

  /**
   * Current rotation, decomposed from the live matrix so a coast can start mid-flight.
   * The rotor's transform also carries translate(-50%,-50%), but a translation only ever
   * lands in the matrix's e/f components — atan2 reads a and b, which are rotation alone.
   */
  const angleNow = (el: HTMLElement) => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    const deg = (Math.atan2(m.b, m.a) * 180) / Math.PI;
    return deg < 0 ? deg + 360 : deg;
  };

  const spin = () => {
    const el = rotor.current;
    if (!el) return;
    const from = angleNow(el);
    el.style.transition = "none";
    el.style.transform = "";
    // Negative delay starts the animation at the phase it is already at, so re-entering
    // mid-coast continues the rotation instead of restarting it (G5).
    el.style.animation = `hui-chase-spin ${period}s linear infinite`;
    el.style.animationDelay = `-${(from / 360) * period}s`;
  };

  /**
   * Stop turning. The cancel is unconditional and the easing is not: if a user turns on
   * reduced motion while the card is hovered, the only thing that ever clears an infinite
   * animation is this call, so gating the whole function would leave the rotor spinning
   * forever behind the ring.
   */
  const stop = (eased: boolean) => {
    const el = rotor.current;
    if (!el) return;
    const from = angleNow(el);
    el.style.animation = "none";
    el.style.transition = "none";
    el.style.transform = `translate(-50%, -50%) rotate(${from}deg)`;
    if (!eased) return;
    // Pin the live angle with no transition and commit it before re-arming; without the
    // reflow the browser coalesces both writes and nothing animates.
    void el.offsetWidth;
    el.style.transition = `transform ${STOP_MS}ms ${STOP_EASE}`;
    el.style.transform = `translate(-50%, -50%) rotate(${from + coastDegrees(period)}deg)`;
  };

  const show = (on: boolean) => {
    const el = ring.current;
    if (!el) return;
    // Removing rather than writing "0": the rest value lives in the var() fallback, so
    // clearing the property restores it. Writing 0 here would pin the ring dark on any
    // device whose only "leave" is a touch pointer being destroyed.
    if (on) el.style.setProperty("--hui-ring", RING_ACTIVE);
    else el.style.removeProperty("--hui-ring");
  };

  const enter = () => {
    // G7 — read capability here rather than holding it in state: it only gates handler
    // work, so it must never decide what renders. A tap fires pointerenter and then keeps
    // it, so without this the ring would latch lit and spin forever on a phone.
    if (!window.matchMedia(FINE_POINTER).matches) return;
    hovering.current = true;
    show(true);
    // G10 — under reduced motion the ring brightens and holds still. The information (the
    // card is under the pointer) survives; only the movement goes.
    if (window.matchMedia(MOTION_OK).matches) spin();
  };

  const leave = () => {
    // A touch pointer being destroyed fires pointerleave even though enter() bailed.
    // Without this guard the first tap would clear the resting ring and coast a rotor that
    // never turned.
    if (!hovering.current) return;
    hovering.current = false;
    if (focused.current) return;
    show(false);
    stop(window.matchMedia(MOTION_OK).matches);
  };

  /**
   * G9 — a card is not focusable, so this fires for a focusable child (React's focus
   * events bubble). The :focus-visible test matters because plain focus also fires on a
   * mouse click, which would otherwise start the chase on every press.
   */
  const focus = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches(":focus-visible")) return;
    focused.current = true;
    show(true);
    if (window.matchMedia(MOTION_OK).matches) spin();
  };

  const blur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!focused.current) return;
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    focused.current = false;
    if (hovering.current) return;
    show(false);
    stop(window.matchMedia(MOTION_OK).matches);
  };

  return (
    <div
      // G8/props — the spread comes first so a consumer's own handlers run (composed
      // below) but can never replace the ones the effect needs to reach its rest state.
      {...props}
      onPointerEnter={(e) => {
        props.onPointerEnter?.(e);
        enter();
      }}
      onPointerLeave={(e) => {
        props.onPointerLeave?.(e);
        leave();
      }}
      onFocus={(e) => {
        props.onFocus?.(e);
        focus(e);
      }}
      onBlur={(e) => {
        props.onBlur?.(e);
        blur(e);
      }}
      style={{
        ...props.style,
        // Pinned after the consumer's style: the effect is these three, and the card stops
        // working without them. Everything above stays overridable through `style` — not
        // through `className`, which cannot outrank an inline declaration at all (G16).
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
      }}
      className={className}
    >
      {/*
       * The ring. A thin annulus knocked out with the two-layer mask trick, holding the
       * rotor below. The mask itself never animates, so it costs nothing at rest.
       *
       * Both shorthands are written before both composites on purpose: React writes inline
       * styles in key order, and in engines that alias -webkit-mask to the standard
       * shorthand, a shorthand landing after mask-composite resets it to `add` — which
       * drops the knockout and floods the card's interior with the gradient.
       */}
      <span
        ref={ring}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          overflow: "hidden",
          borderRadius: "inherit",
          padding: `${ringWidth}px`,
          pointerEvents: "none",
          opacity: `var(--hui-ring, ${RING_REST})`,
          transition: "opacity 260ms ease",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      >
        {/*
         * The rotor. Square, and sized off whichever card edge is longer: the annulus is
         * covered only where the rotor's inscribed circle reaches, so the bound is
         * 1.3·max(w,h) against the card's half-diagonal ½√(w²+h²). A 260% box built from
         * each axis separately gives 1.3·min(w,h) and silently drops out at the corners
         * past about 2.4:1 — min-width/min-height with a 1:1 aspect ratio squares it off
         * the long edge instead, which holds at any ratio.
         *
         * Two soft lobes rather than a single bright point — a point completing a circuit
         * is `border-trace-button` (SCOPE §3); this is a gradient border turning, and the
         * broad falloff is what keeps the two from reading as the same effect.
         *
         * The saturation is deliberately low and the colour single-hue. SCOPE §8's "Not
         * this" is a fast multi-hue spin, and it names speed and saturation as the two
         * things that separate this from the median. Both are spent here, not on colour.
         */}
        <span
          ref={rotor}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            minWidth: "260%",
            minHeight: "260%",
            aspectRatio: "1",
            transform: "translate(-50%, -50%) rotate(0deg)",
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${chaseColor} 70deg, transparent 150deg, transparent 210deg, color-mix(in oklch, ${chaseColor} 55%, transparent) 280deg, transparent 350deg)`,
          }}
        />
      </span>
      {children}
    </div>
  );
}
