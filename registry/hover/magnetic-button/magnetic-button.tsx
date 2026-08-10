"use client";

import * as React from "react";

type MagneticButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  /**
   * How far the button travels toward the cursor.
   * 0 = inert, 1 = the cursor's exact offset. Past ~0.6 it stops reading as magnetism
   * and starts reading as a bug.
   */
  strength?: number;
};

/** Cursor tracking: fast enough to feel attached, slow enough to smooth pointer jitter. */
const TRACK = "120ms";
const TRACK_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/** Release: slower, with a slight overshoot. This is where the effect gets its character. */
const RELEASE = "420ms";
const RELEASE_EASE = "cubic-bezier(0.34, 1.4, 0.64, 1)";

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
const MAGNET_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const subscribeMagnet = (onStoreChange: () => void) => {
  const mq = window.matchMedia(MAGNET_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
};

const getMagnet = () => window.matchMedia(MAGNET_QUERY).matches;

// Inert on the server — there is no cursor there. This must equal the client's
// pre-hydration value or the first paint is a hydration mismatch, and false was already
// what useState was seeded with.
const getMagnetServer = () => false;

export function MagneticButton({
  strength = 0.4,
  className,
  children,
  ...props
}: MagneticButtonProps) {
  const target = React.useRef<HTMLButtonElement>(null);
  // Touch devices fire hover on tap and then keep it, which strands the effect
  // mid-travel. Only arm the magnet for a real cursor, and never under reduced motion —
  // the handler must not compute vars that CSS would only hide (G7 + G10).
  const magnetic = React.useSyncExternalStore(
    subscribeMagnet,
    getMagnet,
    getMagnetServer,
  );

  // Written straight to the node. A setState here would re-render at pointer frequency.
  const track = (event: React.PointerEvent<HTMLSpanElement>) => {
    const el = target.current;
    if (!el || !magnetic) return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - (box.left + box.width / 2)) * strength;
    const y = (event.clientY - (box.top + box.height / 2)) * strength;
    el.style.setProperty("--hui-x", `${x.toFixed(2)}px`);
    el.style.setProperty("--hui-y", `${y.toFixed(2)}px`);
    el.style.setProperty("--hui-duration", TRACK);
    el.style.setProperty("--hui-ease", TRACK_EASE);
  };

  const release = () => {
    const el = target.current;
    if (!el) return;
    el.style.setProperty("--hui-x", "0px");
    el.style.setProperty("--hui-y", "0px");
    el.style.setProperty("--hui-duration", RELEASE);
    el.style.setProperty("--hui-ease", RELEASE_EASE);
  };

  return (
    // Padding extends the magnetic field ~8px beyond the button; the negative margin
    // cancels its effect on layout, so dropping this in never shifts a page. The hit
    // area still reaches past the visual bounds — keep ~8px of clearance from other
    // interactive elements, or neighbours will fight over the pointer.
    <span
      className="inline-flex -m-2 p-2"
      onPointerMove={track}
      onPointerLeave={release}
    >
      <button
        ref={target}
        style={
          {
            "--hui-x": "0px",
            "--hui-y": "0px",
            "--hui-duration": RELEASE,
            "--hui-ease": RELEASE_EASE,
          } as React.CSSProperties
        }
        className={[
          "[transform:translate3d(var(--hui-x),var(--hui-y),0)]",
          "[transition:transform_var(--hui-duration)_var(--hui-ease)]",
          // Press feedback. Keeps the magnetic offset so the button doesn't jump.
          "active:[transform:translate3d(var(--hui-x),var(--hui-y),0)_scale(0.97)]",
          // Keyboard users have no cursor, so they get the arrival state, not tracking.
          // Two selector components, so this outranks the base transform under G16.
          "focus-visible:[transform:scale(1.04)] focus-visible:outline-none",
          // No ring offset: its default colour is white, which halos on any non-white
          // page background.
          "focus-visible:ring-2 focus-visible:ring-current",
          // A press with no prior pointer move would otherwise inherit the 420ms spring,
          // which reads as mushy. Own duration, inside the G3 press band.
          "active:[transition:transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
          // Suppresses the resting travel only. It cannot and need not override the
          // focus or active rules above — under reduced motion the magnet never arms,
          // so --hui-x/y stay 0px and those rules already resolve cleanly (G16).
          "motion-reduce:[transform:none]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </button>
    </span>
  );
}
