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
 * light so that where the light passes, its hairlines stand against a brighter field and
 * gain contrast. That contrast change is what "lifting a faint texture" is here — an
 * honest description of a layer that never itself changes.
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

    // Place the light at the entry point with tracking suppressed, commit that position,
    // then re-arm. Without the reflow the light slides in from wherever it was left, which
    // reads as a second cursor arriving late rather than the card lighting up.
    if (motionOk.current) {
      const box = el.getBoundingClientRect();
      setVars(el, { "--hui-duration": "0ms" });
      setVars(el, {
        "--hui-x": `${(event.clientX - (box.left + box.width / 2)).toFixed(1)}px`,
        "--hui-y": `${(event.clientY - (box.top + box.height / 2)).toFixed(1)}px`,
      });
      void el.offsetWidth;
      setVars(el, { "--hui-duration": TRACK, "--hui-ease": TRACK_EASE });
    }

    // G10 — under reduced motion the light never leaves centre, so the card still tells
    // you it is under the pointer; only the travel is gone.
    setVars(el, { "--hui-on": "1", "--hui-scale": "1" });
  };

  // G14 — straight to the node. A setState here would re-render at pointer frequency.
  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = root.current;
    if (!el || !hoverCapable.current || !motionOk.current) return;
    const box = el.getBoundingClientRect();
    setVars(el, {
      "--hui-x": `${(event.clientX - (box.left + box.width / 2)).toFixed(1)}px`,
      "--hui-y": `${(event.clientY - (box.top + box.height / 2)).toFixed(1)}px`,
    });
  };

  const leave = () => {
    const el = root.current;
    if (!el) return;
    // The light stays where it was and fades from there; sliding it home would animate a
    // position nobody is pointing at any more.
    setVars(el, {
      "--hui-on": "0",
      "--hui-scale": REST_SCALE,
      "--hui-duration": RELEASE,
      "--hui-ease": RELEASE_EASE,
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
    });
  };

  const blur = (event: React.FocusEvent<HTMLDivElement>) => {
    const el = root.current;
    if (!el) return;
    // Only rest when focus leaves the card entirely, not when it moves between children.
    if (event.relatedTarget instanceof Node && el.contains(event.relatedTarget)) return;
    leave();
  };

  const light = `color-mix(in oklch, var(--hui-glow) 20%, transparent)`;
  const edge = `color-mix(in oklch, var(--hui-glow) 65%, transparent)`;
  const weave = `color-mix(in oklch, var(--hui-glow) 7%, transparent)`;

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
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          ...props.style,
        } as React.CSSProperties
      }
      className={["relative", className].filter(Boolean).join(" ")}
    >
      {/*
       * 1. The light. Painted once, moved by transform only (G12). left/top centre it, so
       * --hui-x/--hui-y are offsets from the card's centre and rest at 0 — the same frame
       * of reference magnetic-button uses.
       *
       * G8 — on a coarse pointer the card never receives a usable hover, so the light
       * holds at a low static value instead of sitting invisible: the rest state is the
       * effect arrived and settled, not the effect absent. Set as a variable on this span
       * so it outranks the 0 inherited from the root without JS deciding what renders.
       */}
      <span
        aria-hidden="true"
        // G10 — pinning the scale here removes the only movement left on the reduced-motion
        // path: the light never travels (the move handler is gated), so without this the
        // 0.96 -> 1 swell would be the one transform still running.
        className="pointer-coarse:[--hui-on:0.55] motion-reduce:[--hui-scale:1]"
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
              "transform var(--hui-duration) var(--hui-ease), opacity 220ms ease",
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
            transition: "opacity 220ms ease",
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
