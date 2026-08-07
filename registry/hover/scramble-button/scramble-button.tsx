"use client";

import * as React from "react";

type ScrambleButtonProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "children"
> & {
  /**
   * The button's real label, as a plain string. The technique writes straight to a DOM
   * text node (SCOPE.md §4: "JS character cycling on a ref"), so it needs a string to
   * cycle character by character rather than an arbitrary node tree. TypeScript enforces
   * this: a consumer cannot pass JSX/ReactNode children — it is a compile error.
   */
  children: string;
  /**
   * Characters drawn from while a position is still unresolved. Dense on purpose, so the
   * cycling reads as noise resolving into signal rather than a few repeating glyphs.
   */
  scrambleChars?: string;
  /**
   * Time for the wavefront to cross the whole label — the last character locks at this
   * mark (SCOPE.md §4: "roughly 400ms"). Earlier characters lock proportionally sooner;
   * the first locks at duration / length.
   */
  duration?: number;
};

const DEFAULT_SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?";

/**
 * Time for the whole word to decode, left to right.
 *
 * SCOPE §4 says "roughly 400ms" and this is 700, which is a deliberate departure on the
 * strength of testing it on real hardware: at 400 the wavefront is over before the eye can
 * follow it across the word, which is the one thing §4 asks the number to buy ("so the eye
 * can follow a wavefront across the word"). The spec's figure describes the intent, and at
 * 400 the intent is not met. Worth reconciling in SCOPE.md rather than leaving the file and
 * the spec disagreeing silently.
 */
const DECODE_DURATION = 700;

/**
 * How far ahead of a position's own lock time the noise band starts (G15). Only
 * positions inside this window actually cycle; everything further out already shows its
 * own final glyph, so the word reads as mostly-legible text with a narrow travelling
 * front, not a majority-noise block for the first ~200ms.
 *
 * Scaled with DECODE_DURATION — it is a share of the sweep, not an absolute. Left at 100
 * against a 700ms decode the noise band would be a quarter as wide in proportion, and the
 * front would read as a hard edge rather than a wavefront.
 */
const LEAD_MS = 170;

const getServerSnapshot = () => false;

/**
 * Subscribes to a media query without ever calling setState synchronously inside an
 * effect body — the exact pattern eslint's react-hooks/set-state-in-effect flags as an
 * error on magnetic-button.tsx and liquid-fill-button.tsx in this repo (both call
 * `setCapable(mq.matches)` directly in a useEffect). useSyncExternalStore is React's
 * primitive for reading + subscribing to a value that lives outside React, and it never
 * touches state during render or inside an effect body, so it never trips that rule.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = React.useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function ScrambleButton({
  children,
  scrambleChars = DEFAULT_SCRAMBLE_CHARS,
  duration = DECODE_DURATION,
  className,
  ...props
}: ScrambleButtonProps) {
  const textRef = React.useRef<HTMLSpanElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number | null>(null);

  /**
   * G7, split into two independent checks instead of the single combined query
   * magnetic-button.tsx and liquid-fill-button.tsx use:
   * - pointerCapable gates the POINTER trigger only, so a touch tap's synthetic hover
   *   (which never fires a matching pointerleave) can never call startDecode at all.
   * - reducedMotion gates the ANIMATION itself, inside startDecode, independent of
   *   pointer capability, because keyboard focus must still reach the decode's arrival
   *   state (G9) even on a device that fails the pointer:fine check — e.g. a touchscreen
   *   laptop driven by a real keyboard. Folding both into one flag would silence the
   *   keyboard path there too, which is correct for magnetic-button (focus only needs a
   *   static arrival state) but wrong here, where focus must run the same decode a mouse
   *   hover does.
   * A third, separate gate — :focus-visible, checked directly on the focus event below —
   * keeps a mouse-click focus (which fires onFocus in every evergreen browser) from
   * calling startDecode at all.
   */
  const pointerCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const leadMs = Math.min(LEAD_MS, duration);

  // Settles the label without ever interrupting an in-flight decode (G4/G5): if a loop is
  // already running, this is a no-op, so a leave/blur can only ever land on the same exact
  // final string the loop was already going to reach on its own — never a hard cut to a
  // half-scrambled frame. While idle it's an idempotent safety net that guarantees the
  // node reads `children` (used directly by the reduced-motion path, where rafRef is
  // always null because no loop is ever started).
  const resolveToFinal = () => {
    if (rafRef.current !== null) return;
    startRef.current = null;
    const el = textRef.current;
    if (el) el.textContent = children;
  };

  const startDecode = () => {
    // G10: reduced motion jumps straight to the final text — no cycling at all, not a
    // faster version of it.
    if (reducedMotion) {
      resolveToFinal();
      return;
    }
    // G4/G5: a decode already in flight keeps running untouched — re-entering (or
    // refocusing) mid-word must never restart it, or a rapid enter/leave/enter would
    // replay scramble → cut → scramble, the exact re-trigger flicker G5 exists to prevent.
    if (rafRef.current !== null) return;

    const finalChars = Array.from(children);

    const step = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;

      let settled = true;
      let out = "";
      for (let i = 0; i < finalChars.length; i++) {
        const ch = finalChars[i];
        if (ch === " ") {
          out += " ";
          continue;
        }
        // Left-to-right wavefront: position i locks at (i+1)/length of the total
        // duration, so index 0 resolves almost immediately and the last index resolves
        // at `duration` — a straight linear ramp across the string.
        const resolveAt = ((i + 1) / finalChars.length) * duration;
        const remaining = resolveAt - elapsed;
        if (remaining <= 0) {
          out += ch; // locked
        } else {
          settled = false;
          if (remaining < leadMs) {
            // G15: only the ~100ms band immediately ahead of a position's own lock time
            // actually cycles — a handful of characters at once, not everything still
            // unresolved. That is what makes this a wavefront sweeping the word rather
            // than SCOPE.md's explicit "Not this": every character cycling randomly at
            // once, unreadable for the whole duration.
            out +=
              scrambleChars[Math.floor(Math.random() * scrambleChars.length)] ?? ch;
          } else {
            // Not yet reached by the front: shows its own final glyph early, exactly like
            // an already-locked position, until the noise band sweeps over it.
            out += ch;
          }
        }
      }

      const el = textRef.current;
      if (el) el.textContent = out;

      if (settled) {
        rafRef.current = null;
        startRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  };

  // Every handler below composes with whatever the consumer already passed in `props`
  // (spread first on the button, see the JSX) instead of letting `{...props}` silently
  // replace it — a consumer's own onPointerLeave (a tooltip, an analytics wrapper) would
  // otherwise delete the only path that lets the label finish, and a consumer's own
  // onFocus would silently delete G9's keyboard parity.

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    props.onPointerEnter?.(e);
    // G8 — touch resting state (part 1 of 2, see handleFocus for the other trigger):
    // pointerCapable requires pointer:fine, so a tap's synthetic hover never reaches
    // startDecode through this path.
    if (!pointerCapable) return;
    startDecode();
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    props.onPointerLeave?.(e);
    resolveToFinal();
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    props.onFocus?.(e);
    // G9 — onFocus fires for every focus, not just keyboard focus: a mouse click focuses
    // a <button> in every evergreen browser, so without this check, clicking the button
    // would replay the full decode under the :active press. :focus-visible is the
    // browser's own input-modality heuristic — checking it here is the only way to get
    // "fires on :focus-visible" (registry.json's own description) without a fake
    // React.FocusEvent.
    //
    // G8 — touch resting state (part 2 of 2): a tap-focused button does not match
    // :focus-visible in current browsers either, so this path is also closed to touch.
    // Combined with the pointerCapable guard above, touch matches neither trigger — the
    // label is always the finished string on touch, with no in-flight decode for a
    // leave/blur to ever interrupt.
    if (!e.currentTarget.matches(":focus-visible")) return;
    startDecode();
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    props.onBlur?.(e);
    resolveToFinal();
  };

  // Cancels any in-flight loop on unmount only (G4/G5 removed every other cancellation
  // path). Reads rafRef directly rather than through a function recreated every render,
  // so this has no dependency to go stale.
  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <button
      {...props}
      aria-label={props["aria-label"] ?? children}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={[
        "relative inline-flex items-center justify-center",
        // Press feedback (G11, G12): written as an arbitrary `transform` property, not
        // the `scale-*` utility — in Tailwind v4 that utility emits the standalone
        // `scale` property, which neither transition below names, so it would snap
        // instead of animate on both press and release.
        "[transition:transform_420ms_cubic-bezier(0.34,1.4,0.64,1)]",
        "active:[transform:scale(0.97)]",
        "active:[transition:transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
        // G9 — visible on its own even before the decode text catches up. No
        // ring-offset: there is no flood on this button for an offset to clear
        // (magnetic-button.tsx documents the same call).
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/*
       * Layout lock (G12): equal character COUNT is not equal character WIDTH in a
       * proportional face — Geist Sans (app/layout.tsx) spans roughly 0.26em (`i`, `l`,
       * `!`) to 0.95em (`W`, `M`, `@`), so a same-length character swap still walks the
       * button's rendered width every frame, ~24 times over 400ms. Fixed with two spans
       * sharing one grid cell instead of one mutated span:
       *   - the sizer: invisible (visibility:hidden — out of the accessibility tree,
       *     same as display:none, but keeps its box), holding `children` in NORMAL FLOW.
       *     It is the only element ever consulted for the cell's size, and its content
       *     never changes, so the box never moves.
       *   - the cycling label: absolute inset-0 in the SAME cell (col-start-1
       *     row-start-1). CSS Grid excludes absolutely positioned items from track
       *     sizing entirely, so mutating its textContent every frame — however wide the
       *     scrambled glyphs are — can never resize the box. overflow-hidden on the
       *     wrapper clips the rare frame where it is wider than the locked box.
       * Both spans are aria-hidden (belt-and-braces on top of the sizer's own
       * visibility:hidden); the button's aria-label above is the sole accessible name,
       * so nothing here is ever read twice.
       */}
      <span className="relative inline-grid overflow-hidden">
        <span aria-hidden="true" className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {children}
        </span>
        <span
          ref={textRef}
          aria-hidden="true"
          className="absolute inset-0 col-start-1 row-start-1 whitespace-nowrap"
        >
          {children}
        </span>
      </span>
    </button>
  );
}
