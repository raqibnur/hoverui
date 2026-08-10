"use client";

import * as React from "react";

/**
 * The page signature (docs/DESIGN.md § Signature). A single throttled pointermove listener
 * writes --px/--py to <html>; a fixed, very low-alpha radial of --charge tracks them. This
 * is the only place --charge is ever visible, and only while the pointer is on the page.
 *
 * Rules this component keeps:
 *  - One listener for the whole page. Never per tile.
 *  - No React state on pointer movement. style.setProperty only, inside rAF.
 *  - prefers-reduced-motion parks the field off-screen and attaches nothing.
 *
 * Two sources can drive the same two vars, and only ever one at a time: the pointer on a
 * fine-pointer device, and scroll position on a touch one (docs/DESIGN.md § Touch).
 */
export function ChargeField() {
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    let raf = 0;
    const schedule = (write: () => void) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        write();
      });
    };
    const put = (x: number, y: number) => {
      root.style.setProperty("--px", `${x}px`);
      root.style.setProperty("--py", `${y}px`);
    };

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let x = 0;
      let y = 0;
      const onMove = (e: PointerEvent) => {
        x = e.clientX;
        y = e.clientY;
        schedule(() => put(x, y));
      };

      // When the pointer leaves the window, retire the charge off-screen so it fades out.
      const onLeave = () => {
        x = -1000;
        y = -1000;
        schedule(() => put(x, y));
      };

      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      return () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
        if (raf) cancelAnimationFrame(raf);
      };
    }

    /*
     * Touch. There is no cursor, so scroll stands in for one: the charge anchors to whichever
     * tile is nearest the viewport centre and travels as that answer changes (docs/DESIGN.md
     * § Touch). Same two vars, same single listener, still no React state — a phone gets the
     * page's signature rather than an achromatic page that never explains its own thesis.
     *
     * Reading twelve rects inside the frame is the cost of not caching offsets that a font
     * swap, an orientation change, or a wrapped grid would silently invalidate.
     */
    const anchors = Array.from(
      document.querySelectorAll<HTMLElement>("[data-charge-anchor]"),
    );
    if (!anchors.length) return;

    const anchor = () => {
      const mid = window.innerHeight / 2;
      let best: DOMRect | null = null;
      let bestDistance = Infinity;
      for (const el of anchors) {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - mid);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = rect;
        }
      }
      if (best) put(best.left + best.width / 2, best.top + best.height / 2);
    };

    // Eases the handoff between anchors; see `.charge-eased` in app/globals.css for why the
    // pointer path above deliberately does without it. Written once, not per event.
    root.classList.add("charge-eased");

    const onScroll = () => schedule(anchor);
    anchor();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.classList.remove("charge-eased");
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        // --brand, not --charge: this is the one place the brand colour is seen as colour
        // rather than as ink. At 9% alpha over a whole screen it carries no text and draws no
        // boundary, so the contrast floor that forces --charge to be the darker tone does not
        // apply, and the field gets to be the actual brand orange.
        background:
          "radial-gradient(560px circle at var(--px) var(--py), color-mix(in oklch, var(--brand) 9%, transparent), transparent 62%)",
      }}
    />
  );
}
