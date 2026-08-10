"use client";

import * as React from "react";

type SpotlightCardProps = React.ComponentPropsWithoutRef<"div"> & {
  /**
   * Colour of the light. Defaults to currentColor so the card works on any background
   * without a prop, and without depending on a design token a consumer project may not
   * have. Any valid CSS colour works.
   */
  glowColor?: string;
  /**
   * Diameter of the light, in px. SCOPE §5 asks for a large radius and low alpha — a
   * field the card sits in, not a torch aimed at it. Below roughly 240px the falloff gets
   * steep enough to read as a circle with an edge, which is the documented failure.
   */
  size?: number;
};

/**
 * Cursor tracking. G3's band for tracking is 100-140ms and this deliberately sits at the
 * top of it, because the lag IS the effect: SCOPE §5's "Not this" is a light that tracks
 * the cursor exactly. It is also what separates this from the site's own charge field
 * (components/gallery/charge-field.tsx), a 560px --charge radial that tracks the pointer
 * untransitioned. Same family of image, different behaviour — this one trails.
 */
const TRACK = "140ms";
const TRACK_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/** Release: slower, with slight overshoot. G3's 350-450ms band, G4's fast-in/slow-out. */
const RELEASE = "420ms";
const RELEASE_EASE = "cubic-bezier(0.34, 1.4, 0.64, 1)";

/** G6 — the light recedes to 96%, never to nothing. */
const REST_SCALE = "0.96";

/**
 * G3/G4 — the fade is split because a single 220ms value put the release inside the enter
 * band. Worse, it made REST_SCALE unobservable: the light hit opacity 0 at 220ms while its
 * transform was still travelling to 0.96 over 420ms, so the constant that exists to satisfy
 * G6 finished in an invisible layer. Out now matches the transform it rides on.
 */
const FADE_IN = "220ms";
const FADE_OUT = "420ms";

/**
 * Technique (G12, G14, G15):
 *
 * Three layers sit between the card's surface and its content, all clipped to the card by
 * overflow:hidden — the light is bounded by the material, which is what makes it read as
 * lit from within rather than as a wash thrown across the page.
 *
 *   1. the light  — one pre-painted radial-gradient span, moved ONLY by transform.
 *   2. the weave  — a static hairline grid, painted ABOVE the light.
 *   3. the border — the same radial inside a masked annulus, so the edge lifts locally.
 *
 * G12 note, and this is the whole reason for the structure: the obvious implementation is
 * `radial-gradient(... at var(--x) var(--y))` on a full-size layer, but moving a gradient's
 * position repaints that layer every frame. Instead the gradient is painted once into a
 * fixed-size span and the span is translated — transform only, so tracking is compositor
 * work. The two vars SCOPE §5 calls for are that translation, not the gradient's centre.
 *
 * The weave is genuinely static; it is not animated and does not move. It sits above the
 * light, and what it does there is the opposite of what this comment used to claim.
 *
 * Measured on canvas against the current palette (green channel, where the eye is most
 * sensitive): the weave is ink at 7%, so 245 -> 228 over the bare surface (delta 17) and
 * 208 -> 194 over the lit patch (delta 14). Because the light darkens the field rather
 * than brightening it, the hairlines under it LOSE about 18% of their contrast. The
 * texture recedes where the light passes; it does not lift.
 *
 * That is a real consequence of the unresolved G15 problem below, not a separate bug, and
 * it is recorded rather than papered over: on a surface at L 0.909 there is no headroom
 * for a light to brighten into, so every downstream claim about "lifting" is unavailable
 * until the surface question is settled. See the G15 note on `light`.
 */
export function SpotlightCard({
  glowColor = "currentColor",
  size = 360,
  className,
  children,
  ...props
}: SpotlightCardProps) {
  const root = React.useRef<HTMLDivElement>(null);

  /**
   * G7 — read once per enter, not per move, and never held in state: the value only gates
   * handler work, so it must not influence what renders. Keeping it out of state is also
   * what keeps this component free of the server/client snapshot problem that a
   * capability-driven render would introduce.
   */
  const hoverCapable = React.useRef(false);
  const motionOk = React.useRef(false);

  /**
   * G14 — the card's rectangle, measured once per enter instead of once per move. The
   * move handler writes inline custom properties to this same node, so a
   * getBoundingClientRect() on the next move forced a style-and-layout flush at pointer
   * rate. tilt-card.tsx:96-101 rejected per-event measurement for this exact reason;
   * both effects now measure on enter and invalidate on scroll or resize.
   */
  const box = React.useRef<DOMRect | null>(null);
  const detach = React.useRef<(() => void) | null>(null);

  const invalidate = () => {
    box.current = null;
  };

  const boxOf = (el: HTMLDivElement) =>
    (box.current ??= el.getBoundingClientRect());

  // Scroll is capture-phase because an ancestor scroll container moves the card without
  // the window ever scrolling; passive because neither listener touches the event.
  const watchGeometry = () => {
    if (detach.current) return;
    const opts = { passive: true, capture: true } as const;
    window.addEventListener("scroll", invalidate, opts);
    window.addEventListener("resize", invalidate, { passive: true });
    detach.current = () => {
      window.removeEventListener("scroll", invalidate, { capture: true });
      window.removeEventListener("resize", invalidate);
      detach.current = null;
    };
  };

  // A card unmounted while hovered — a filtered gallery, a route change — would otherwise
  // leave both listeners on window for the life of the page.
  React.useEffect(() => () => detach.current?.(), []);

  const setVars = (
    el: HTMLDivElement,
    vars: Record<string, string>,
  ) => {
    for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  };

  const enter = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = root.current;
    if (!el) return;

    hoverCapable.current = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    motionOk.current = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    ).matches;
    if (!hoverCapable.current) return;

    box.current = el.getBoundingClientRect();
    watchGeometry();

    // Place the light at the entry point with tracking suppressed, commit that position,
    // then re-arm. Without the reflow the light slides in from wherever it was left, which
    // reads as a second cursor arriving late rather than the card lighting up.
    if (motionOk.current) {
      const rect = boxOf(el);
      setVars(el, { "--hui-duration": "0ms" });
      setVars(el, {
        "--hui-x": `${(event.clientX - (rect.left + rect.width / 2)).toFixed(1)}px`,
        "--hui-y": `${(event.clientY - (rect.top + rect.height / 2)).toFixed(1)}px`,
      });
      void el.offsetWidth;
      setVars(el, { "--hui-duration": TRACK, "--hui-ease": TRACK_EASE });
    }

    // G10 — under reduced motion the light never leaves centre, so the card still tells
    // you it is under the pointer; only the travel is gone.
    setVars(el, { "--hui-on": "1", "--hui-scale": "1", "--hui-fade": FADE_IN });
  };

  // G14 — straight to the node. A setState here would re-render at pointer frequency.
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = root.current;
    if (!el || !hoverCapable.current || !motionOk.current) return;
    const rect = boxOf(el);
    setVars(el, {
      "--hui-x": `${(event.clientX - (rect.left + rect.width / 2)).toFixed(1)}px`,
      "--hui-y": `${(event.clientY - (rect.top + rect.height / 2)).toFixed(1)}px`,
    });
  };

  const leave = () => {
    const el = root.current;
    if (!el) return;
    detach.current?.();
    // The light stays where it was and fades from there; sliding it home would animate a
    // position nobody is pointing at any more.
    setVars(el, {
      "--hui-on": "0",
      "--hui-scale": REST_SCALE,
      "--hui-duration": RELEASE,
      "--hui-ease": RELEASE_EASE,
      "--hui-fade": FADE_OUT,
    });
  };

  /**
   * G9 — a card is not focusable, so keyboard parity comes from whatever the card
   * contains. React's onFocus bubbles, so this fires when a child is focused. Keyboard
   * users get the arrival state, not tracking: the light holds at centre. The
   * :focus-visible test matters because plain focus also fires on mouse click, which
   * would otherwise light the card from a click rather than from the pointer.
   */
  const focus = (event: React.FocusEvent<HTMLDivElement>) => {
    const el = root.current;
    if (!el) return;
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches(":focus-visible")) return;
    setVars(el, {
      "--hui-x": "0px",
      "--hui-y": "0px",
      "--hui-duration": TRACK,
      "--hui-ease": TRACK_EASE,
      "--hui-on": "1",
      "--hui-scale": "1",
      "--hui-fade": FADE_IN,
    });
  };

  const blur = (event: React.FocusEvent<HTMLDivElement>) => {
    const el = root.current;
    if (!el) return;
    // Only rest when focus leaves the card entirely, not when it moves between children.
    if (event.relatedTarget instanceof Node && el.contains(event.relatedTarget)) return;
    leave();
  };

  /**
   * G15 — OPEN, and not fixable by tuning this value. On --surface (#F4F5F2, L 0.909) a
   * 20% mix of --charge (#B83A00, L 0.132) composites to about (232,208,194), L 0.662: the
   * "light" is a 25-point luminance DROP. Re-measured when the palette moved from an
   * electric indigo to the brand hue; the numbers shifted, the conclusion did not, because
   * any token dark enough to carry text is far below the surface it is mixed into. The
   * indigo drop was 31 points. That is arithmetic, not craft. #F4F5F2 leaves
   * +11/255 R, +10 G, +13 B of headroom, so any colour that is not near-white must darken
   * it, and near-white is invisible at that ceiling; screen/plus-lighter with a dark
   * colour is close to a no-op. tilt-card.tsx:105-112 hit the same wall independently.
   *
   * SCOPE §5's "lit from within" is therefore unreachable on a light surface. Resolving it
   * means choosing one of: a dark surface for this card, a re-scope onto a channel the
   * surface does have room for, or cutting the effect (docs/FIXES.md § "When the fix is
   * cut it"). All three change what the effect IS, so none is a repair — it is a decision
   * taken with all twelve effects in view, and it has not been taken yet.
   */
  const light = `color-mix(in oklch, var(--hui-glow) 20%, transparent)`;
  const edge = `color-mix(in oklch, var(--hui-glow) 65%, transparent)`;
  /**
   * The weave is painted unconditionally, so it must not carry the glow colour. With
   * glowColor="var(--charge)" it put --charge on screen with no pointer anywhere near the
   * card, and docs/DESIGN.md § Tokens is explicit: "if it is visible without the pointer
   * nearby, it is a bug." currentColor keeps the texture in the card's own ink — visually
   * near-identical at 7% — and leaves --charge to the light, which only exists under the
   * pointer.
   */
  const weave = `color-mix(in oklch, currentColor 7%, transparent)`;

  return (
    <div
      // G8/props — the spread comes first so a consumer's own handlers run (composed
      // below) but can never replace the ones the effect needs to reach its rest state.
      {...props}
      ref={root}
      onPointerEnter={(e) => {
        props.onPointerEnter?.(e);
        enter(e);
      }}
      onPointerMove={(e) => {
        props.onPointerMove?.(e);
        move(e);
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
      style={
        {
          "--hui-glow": glowColor,
          "--hui-size": `${size}px`,
          "--hui-x": "0px",
          "--hui-y": "0px",
          "--hui-on": "0",
          "--hui-scale": REST_SCALE,
          "--hui-duration": RELEASE,
          "--hui-ease": RELEASE_EASE,
          "--hui-fade": FADE_OUT,
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          ...props.style,
        } as React.CSSProperties
      }
      // `position: relative` is declared inline above, so a "relative" class here could
      // never win anyway — it only looked like it was doing something.
      className={className}
    >
      {/*
       * 1. The light. Painted once, moved by transform only (G12). left/top centre it, so
       * --hui-x/--hui-y are offsets from the card's centre and rest at 0 — the same frame
       * of reference magnetic-button uses.
       *
       * G8 — this span used to hold a static 0.55 on coarse pointers, so that touch had a
       * rest state rather than nothing. With glowColor="var(--charge)" that painted the
       * charge permanently on every phone, which docs/DESIGN.md § Tokens forbids outright,
       * and it lit only this layer: the border annulus below never joined the coarse rest,
       * so touch got the half that darkens the surface and none of the half that reads as
       * an edge. The weave carries the touch rest state instead — always painted, static,
       * and now in the card's own ink rather than the glow colour.
       */}
      <span
        aria-hidden="true"
        // G10 — pinning the scale here removes the only movement left on the reduced-motion
        // path: the light never travels (the move handler is gated), so without this the
        // 0.96 -> 1 swell would be the one transform still running.
        className="motion-reduce:[--hui-scale:1]"
        style={
          {
            position: "absolute",
            left: "50%",
            top: "50%",
            height: "var(--hui-size)",
            width: "var(--hui-size)",
            borderRadius: "9999px",
            zIndex: 0,
            pointerEvents: "none",
            background: `radial-gradient(circle closest-side, ${light}, transparent)`,
            opacity: "var(--hui-on)",
            transform:
              "translate3d(calc(var(--hui-x) - 50%), calc(var(--hui-y) - 50%), 0) scale(var(--hui-scale))",
            // G1 — both properties named. Opacity takes plain ease per MOTION.md's easing
            // note; the travel takes the project curve carried in --hui-ease.
            transition:
              "transform var(--hui-duration) var(--hui-ease), opacity var(--hui-fade) ease",
          } as React.CSSProperties
        }
      />

      {/*
       * 2. The weave. Static, always painted, never animated — it is the card's own
       * material, and it is what the rest state has instead of nothing. Painted above the
       * light so its hairlines gain contrast against the brighter field as the light
       * passes under them.
       */}
      <span
        aria-hidden="true"
        style={
          {
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: `repeating-linear-gradient(0deg, ${weave} 0 1px, transparent 1px 14px), repeating-linear-gradient(90deg, ${weave} 0 1px, transparent 1px 14px)`,
          } as React.CSSProperties
        }
      />

      {/*
       * 3. The border. A one-pixel annulus knocked out with the two-layer mask trick, with
       * the same travelling radial inside it, so the edge lifts where the light passes
       * rather than lighting uniformly. The mask itself is static and never animates.
       *
       * Both shorthands are written before both composites on purpose: React writes inline
       * styles in key order, and in engines that alias -webkit-mask to the standard
       * shorthand, a shorthand landing after mask-composite resets it to `add` — which
       * drops the knockout and floods the card's interior with the edge colour.
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
            padding: "1px",
            pointerEvents: "none",
            opacity: "var(--hui-on)",
            transition: "opacity var(--hui-fade) ease",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          } as React.CSSProperties
        }
      >
        <span
          aria-hidden="true"
          className="motion-reduce:[--hui-scale:1]"
          style={
            {
              position: "absolute",
              left: "50%",
              top: "50%",
              height: "var(--hui-size)",
              width: "var(--hui-size)",
              borderRadius: "9999px",
              background: `radial-gradient(circle closest-side, ${edge}, transparent)`,
              transform:
                "translate3d(calc(var(--hui-x) - 50%), calc(var(--hui-y) - 50%), 0) scale(var(--hui-scale))",
              transition: "transform var(--hui-duration) var(--hui-ease)",
            } as React.CSSProperties
          }
        />
      </span>

      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
