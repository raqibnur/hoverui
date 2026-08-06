"use client";

import * as React from "react";

type TiltCardProps = React.ComponentPropsWithoutRef<"div"> & {
  /**
   * Maximum rotation in degrees at the far corners. SCOPE §6 caps this at 8, and the cap
   * is the effect: 15-20 degrees is the dated version, and it is dated because a real
   * panel that far off-axis would show a completely different reflection.
   */
  maxTilt?: number;
  /**
   * Viewing distance in px. Larger is flatter and more expensive-looking; below about
   * 600 the perspective distortion starts to read as a video game.
   */
  perspective?: number;
  /**
   * The two ends of the sheen. They are props because the sheen is half the effect and
   * its legibility depends entirely on the surface underneath it — see the note above
   * the component. The defaults suit a light card carrying dark text.
   */
  sheenLight?: string;
  sheenShade?: string;
};

/** Cursor tracking. G3's band is 100-140ms; the panel should feel attached to the cursor. */
const TRACK = 120;
const TRACK_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/**
 * Focus arrival. A keyboard user is not tracking a cursor, so this is an enter, not a
 * track — G3's enter band is 180-260ms. At the tracking duration a 14px lift pops instead
 * of lifting, and G9's whole point is that the keyboard user receives the arrival.
 */
const ENTER = 220;

/** Release: slow, with overshoot, so the panel settles like it has mass (G3, G4). */
const RELEASE = 420;
const RELEASE_EASE = "cubic-bezier(0.34, 1.4, 0.64, 1)";

/**
 * The sheen's own fade, kept off the panel's timing on purpose. MOTION.md's easing note
 * says plain ease is correct for opacity, and the release spring is actively wrong here:
 * it crosses 1 at roughly half its duration, so an opacity run to 0 would finish around
 * 207ms of the 420ms and leave the specular gone while the panel is still overshooting
 * home. The two halves of the effect must land together.
 */
const FADE = 220;

/**
 * How far the sheen slides, as a share of its own box, opposite the tilt (SCOPE §6).
 *
 * This is bounded by SHEEN_INSET, not chosen freely. The sheen box is
 * `100 + 2*SHEEN_INSET` percent of the panel, so a travel of T% of that box moves it
 * `T * (100 + 2*SHEEN_INSET) / 100` percent of the panel. To keep the panel covered at
 * full deflection the leading edge must not cross the panel's edge:
 *
 *     SHEEN_INSET >= SHEEN_TRAVEL * (100 + 2*SHEEN_INSET) / 100
 *
 * At 60 and 18 that is 60 >= 39.6, which holds with room to spare. Raising the travel
 * without raising the inset uncovers a strip of the panel and exposes the hard start of
 * the gradient as an edge — the "flat highlight" failure, arrived at sideways.
 */
const SHEEN_INSET = 60;
const SHEEN_TRAVEL = 18;

/**
 * G8 — the sheen never fully leaves. Glass that only reflects while you point at it is a
 * glare switch, and a glare that switches on is the median tilt card. The resting value is
 * the effect arrived and settled, which is also what docs/DESIGN.md §Touch requires: on a
 * coarse pointer no handler ever runs, so this is the whole of what a phone sees, and it
 * has to look finished on its own. Hovering raises it and, more importantly, *moves* it —
 * the travel is what hover adds, not the reflection's existence.
 */
const SHEEN_REST = "0.4";

/** G9 — a keyboard user gets the arrival, not the tracking: it lifts, it does not tilt. */
const FOCUS_LIFT = 14;

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Technique (G12, G14):
 *
 * One element. The viewing distance lives inside the panel's own transform as
 * `perspective()` rather than on a parent, so the vanishing point is the panel's own
 * transform-origin. An ancestor `perspective` property would key the projection to the
 * ancestor's centre, and an ancestor sized by layout does not track a panel sized by the
 * consumer's own width — the panel would shear and drift sideways instead of pivoting.
 * Dropping the wrapper also puts the listeners on the thing the user is actually pointing
 * at, so there is no strip of dead space beside the panel where enter fires and the
 * clamp paints a frozen full deflection.
 *
 * The panel's rotation and the sheen's travel are written as direct inline style
 * assignments rather than through shared custom properties. That is a performance
 * decision: a custom property set on an ancestor invalidates style for everything beneath
 * it, and a card's children are arbitrary consumer content, so on a busy card that would
 * mean re-resolving a whole subtree at pointer rate. Writing the two values directly
 * touches only the two elements that move.
 *
 * Nothing animates a property off G12's list — the panel rotates, the sheen slides and
 * fades, and that is all.
 *
 * SHEEN LEGIBILITY, and the limit of this component: the sheen carries a light end and a
 * shaded end rather than one bright band, because on a near-white surface there is almost
 * no headroom above the paper. Measured over #F4F5F2 the light end tops out near +8/255
 * while the shade reaches about -18/255, so the shaded end is what a viewer actually
 * registers. That balance depends on `sheenShade` resolving to something darker than the
 * card. It defaults to currentColor, which is right for a light card with dark text and
 * wrong for a dark card or one with pale text — there the shade collapses and the light
 * end blows out, leaving a single unmoving band, which is SCOPE §6's "flat highlight".
 * On any surface that is not light-with-dark-text, pass both props explicitly.
 *
 * The travel itself is unconditional: the light/shade boundary sweeps corner to corner
 * across the deflection range and it sweeps against the rotation, because a reflection is
 * a function of viewing angle and must not ride along with the panel.
 */
export function TiltCard({
  maxTilt = 8,
  perspective = 900,
  sheenLight = "white",
  sheenShade = "currentColor",
  className,
  children,
  ...props
}: TiltCardProps) {
  const panel = React.useRef<HTMLDivElement>(null);
  const sheen = React.useRef<HTMLSpanElement>(null);

  const box = React.useRef<DOMRect | null>(null);
  const tracking = React.useRef(false);
  /** Hover and focus are held apart so neither one's exit cancels the other. */
  const hovering = React.useRef(false);
  const focused = React.useRef(false);
  /** Last pointer position, so focus and blur can repaint in place rather than snapping. */
  const at = React.useRef({ x: 0, y: 0 });

  /** Detach for the document-level move listener; null when not tracking. */
  const release = React.useRef<(() => void) | null>(null);

  /**
   * The panel's UNTRANSFORMED box, read by neutralising the transform for the duration of
   * the measurement.
   *
   * `getBoundingClientRect` reports the projected box, so reading it while the panel is
   * turned maps the cursor against the wrong rectangle — and a press makes it worse, since
   * `:active` scales the panel too. Reconstructing the flat box from the projected one is
   * tempting and does not work: with `perspective()` in the same transform the near edge
   * grows by more than the far edge shrinks, so the projected centre is not the flat centre
   * either. Measured at 8 degrees on the shipped preview, that error is 2.67px — larger
   * than the 2.1px edge recession this box exists to defend against.
   *
   * So the transform comes off, the rect is read, and it goes straight back on. Reading
   * between the two writes forces a synchronous layout, which is why this is only ever
   * called on enter, scroll and resize — all human-frequency (G14). Nothing paints in
   * between, so there is no flicker to see.
   */
  const measure = () => {
    const p = panel.current;
    if (!p) {
      box.current = null;
      return;
    }
    const transform = p.style.transform;
    const transition = p.style.transition;
    p.style.transition = "none";
    p.style.transform = "none";
    box.current = p.getBoundingClientRect();
    p.style.transform = transform;
    p.style.transition = transition;
  };

  /** A scroll under a held hover moves the box the pointer is being mapped against. */
  React.useEffect(() => {
    const onShift = () => {
      if (hovering.current) measure();
    };
    window.addEventListener("scroll", onShift, true);
    window.addEventListener("resize", onShift);
    return () => {
      window.removeEventListener("scroll", onShift, true);
      window.removeEventListener("resize", onShift);
      // The document listener outlives this component otherwise — it is attached on enter,
      // and an unmount mid-hover never reaches stopHover().
      release.current?.();
      release.current = null;
    };
  }, []);

  /**
   * G1 — every property named. The sheen's opacity keeps its own duration and plain ease
   * via positional lists, so `setMotion` can retime the travel without dragging the fade
   * onto the release spring.
   */
  const setMotion = (ms: number, ease: string) => {
    const p = panel.current;
    const s = sheen.current;
    if (p) {
      p.style.transitionDuration = `${ms}ms`;
      p.style.transitionTimingFunction = ease;
    }
    if (s) {
      s.style.transitionDuration = `${ms}ms, ${FADE}ms`;
      s.style.transitionTimingFunction = `${ease}, ease`;
    }
  };

  const paint = (nx: number, ny: number, lifted: boolean) => {
    const p = panel.current;
    const s = sheen.current;
    if (!p || !s) return;
    // Positive rotateY sends the right edge away, positive rotateX sends the top away —
    // so the panel yields where the cursor pushes it, which is the read SCOPE §6 asks for.
    p.style.transform = `perspective(${perspective}px) rotateX(${(-ny * maxTilt).toFixed(2)}deg) rotateY(${(nx * maxTilt).toFixed(2)}deg) translateZ(${lifted ? FOCUS_LIFT : 0}px)`;
    s.style.transform = `translate3d(${(-nx * SHEEN_TRAVEL).toFixed(2)}%, ${(-ny * SHEEN_TRAVEL).toFixed(2)}%, 0)`;
    s.style.opacity = "1";
  };

  const rest = () => {
    const p = panel.current;
    const s = sheen.current;
    if (!p || !s) return;
    setMotion(RELEASE, RELEASE_EASE);
    p.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    s.style.transform = "translate3d(0%, 0%, 0)";
    s.style.opacity = SHEEN_REST;
    at.current = { x: 0, y: 0 };
  };

  const enter = () => {
    hovering.current = true;
    // G7 — read capability here rather than holding it in state: it only gates handler
    // work, so it must never decide what renders, and keeping it out of the render path
    // is also what keeps this component free of a server/client snapshot mismatch.
    tracking.current =
      window.matchMedia(FINE_POINTER).matches && window.matchMedia(MOTION_OK).matches;

    if (!tracking.current) {
      // G10 — under reduced motion the panel never turns and the sheen never travels. It
      // still brightens, so the card acknowledges the pointer without moving.
      if (window.matchMedia(FINE_POINTER).matches && sheen.current) {
        setMotion(ENTER, TRACK_EASE);
        sheen.current.style.opacity = "1";
      }
      return;
    }

    measure();
    setMotion(TRACK, TRACK_EASE);

    /**
     * G5 — the hover is tracked from the document, not from the panel, and this is the
     * only arrangement that does not fight itself.
     *
     * The panel yields where the cursor pushes it, so the edge nearest the cursor is always
     * the one that recedes: measured on the shipped preview, 2.1px at full deflection.
     * Hit testing runs on the projected box, so a cursor resting inside that band leaves
     * the element without moving — `pointerleave` fires, the panel springs flat, the edge
     * comes back under the cursor, `pointerenter` fires, and it oscillates for as long as
     * the hand is still. Listening on the document and deciding against the FLAT box makes
     * the panel's own motion unable to end the hover.
     */
    const onDocMove = (event: PointerEvent) => {
      const b = box.current;
      if (!b || b.width === 0 || b.height === 0) return;
      const inside =
        event.clientX >= b.left &&
        event.clientX <= b.right &&
        event.clientY >= b.top &&
        event.clientY <= b.bottom;
      if (!inside) {
        stopHover();
        return;
      }
      // -1..1 from the centre, clamped so a fast diagonal entry cannot exceed the cap.
      const nx = Math.max(-1, Math.min(1, (event.clientX - (b.left + b.width / 2)) / (b.width / 2)));
      const ny = Math.max(-1, Math.min(1, (event.clientY - (b.top + b.height / 2)) / (b.height / 2)));
      at.current = { x: nx, y: ny };
      // No media query here: G14 keeps pointer-rate work minimal, and reaching this line at
      // all already proves motion is allowed — the listener is only attached when it did.
      paint(nx, ny, focused.current);
    };

    document.addEventListener("pointermove", onDocMove);
    release.current = () => document.removeEventListener("pointermove", onDocMove);
  };

  /** End the hover, however it ended: outside the flat box, or the pointer leaving the page. */
  const stopHover = () => {
    if (!hovering.current) return;
    hovering.current = false;
    tracking.current = false;
    release.current?.();
    release.current = null;
    // Focus outlives the pointer: tabbing to a card and then sweeping the mouse past it
    // must not strip the keyboard state.
    if (focused.current) {
      setMotion(RELEASE, RELEASE_EASE);
      paint(0, 0, window.matchMedia(MOTION_OK).matches);
      return;
    }
    rest();
  };

  /**
   * `pointerleave` is now only a fallback — for the reduced-motion path, which never
   * attaches the listener, and for a pointer that leaves the window entirely. While
   * tracking, it is ignored: it fires exactly when the receding edge slips past a stationary
   * cursor, which is the thing this effect must not treat as an exit.
   */
  const leave = () => {
    if (release.current) return;
    hovering.current = false;
    tracking.current = false;
    if (focused.current) {
      setMotion(RELEASE, RELEASE_EASE);
      paint(0, 0, window.matchMedia(MOTION_OK).matches);
      return;
    }
    rest();
  };

  /**
   * G9 — React's focus events bubble, so this fires for a focusable child. The
   * :focus-visible test matters because plain focus also fires on a mouse click, which
   * would otherwise lift the card on every click.
   *
   * G10 — the lift is a translation under perspective, so it is movement and is gated. A
   * reduced-motion keyboard user still gets the sheen, which is the non-moving half.
   */
  const focus = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches(":focus-visible")) return;
    focused.current = true;
    const lift = window.matchMedia(MOTION_OK).matches;
    // Arriving into a held hover keeps the tracking timing so the tilt stays continuous;
    // arriving cold is an enter and takes the enter band (G3).
    setMotion(tracking.current ? TRACK : ENTER, TRACK_EASE);
    // Repaint where the pointer already is, so tabbing into a card the cursor is resting
    // on does not flatten it and then re-tilt on the next move.
    paint(at.current.x, at.current.y, lift);
    if (!lift && sheen.current) sheen.current.style.opacity = "1";
  };

  const blur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    focused.current = false;
    // Guarded on hover alone, not on `tracking`: under reduced motion `tracking` is always
    // false, so testing it here would drop a still-hovered reduced-motion user back to the
    // resting sheen — removing the only feedback they get — with nothing to restore it
    // until the pointer left and came back.
    if (hovering.current) {
      setMotion(TRACK, TRACK_EASE);
      if (tracking.current) {
        paint(at.current.x, at.current.y, false);
      } else if (sheen.current) {
        sheen.current.style.opacity = "1";
      }
      return;
    }
    rest();
  };

  return (
    <div
      // G8/props — the spread comes first so a consumer's own handlers run (composed
      // below) but can never replace the ones the effect needs to reach its rest state.
      {...props}
      ref={panel}
      onPointerEnter={(e) => {
        props.onPointerEnter?.(e);
        enter();
      }}
      // No tracking handler here — the document listener attached on enter does it, so the
      // panel's own receding edge cannot interrupt the stream. A consumer's own handler is
      // still forwarded.
      onPointerMove={props.onPointerMove}
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
        transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px)`,
        transitionProperty: "transform",
        transitionDuration: `${RELEASE}ms`,
        transitionTimingFunction: RELEASE_EASE,
        // G13 — no will-change. It would hold a compositor layer for every card on the
        // page permanently, and the panel is cheap enough without it.
        ...props.style,
        // Pinned after the consumer's style: these three are what the effect is made of,
        // and the panel stops being a panel without them. Everything above remains
        // overridable through `style` — not through `className`, which cannot beat an
        // inline declaration at all (G16). The clipping is a real constraint on what can
        // go inside the card, so it is stated in the registry item description too.
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
      }}
      className={className}
    >
      {/*
       * The sheen. Painted once and only ever moved and faded, so it stays compositor
       * work (G12). It rests part-lit rather than absent (G6, G8) — a reflection does not
       * switch on, and on touch this resting value is the entire effect.
       *
       * A negative stacking index keeps it above the panel's own background but beneath
       * the children, which is why the children need no wrapper of their own: wrapping
       * them would silently defeat any layout class the consumer puts on the card, since
       * every child would collapse into one box. `isolation` above contains it.
       */}
      <span
        ref={sheen}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: `-${SHEEN_INSET}%`,
          zIndex: -1,
          opacity: SHEEN_REST,
          pointerEvents: "none",
          transitionProperty: "transform, opacity",
          transitionDuration: `${RELEASE}ms, ${FADE}ms`,
          transitionTimingFunction: `${RELEASE_EASE}, ease`,
          backgroundImage: `linear-gradient(115deg, color-mix(in oklch, ${sheenLight} 78%, transparent) 0%, transparent 42%, transparent 58%, color-mix(in oklch, ${sheenShade} 9%, transparent) 100%)`,
        }}
      />
      {children}
    </div>
  );
}
