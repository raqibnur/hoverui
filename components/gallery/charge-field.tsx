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
 */
export function ChargeField() {
  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduce.matches || !fine.matches) return;

    const root = document.documentElement;
    let raf = 0;
    let x = 0;
    let y = 0;

    const write = () => {
      raf = 0;
      root.style.setProperty("--px", `${x}px`);
      root.style.setProperty("--py", `${y}px`);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(write);
    };

    // When the pointer leaves the window, retire the charge off-screen so it fades out.
    const onLeave = () => {
      x = -1000;
      y = -1000;
      if (!raf) raf = requestAnimationFrame(write);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(560px circle at var(--px) var(--py), color-mix(in oklch, var(--charge) 9%, transparent), transparent 62%)",
      }}
    />
  );
}
