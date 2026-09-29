"use client";

import { useEffect, useState } from "react";

import ParticleImage from "@/components/hero/svg-particles";

/** Hover assembly and cursor repulsion are a pointer affordance. Touch has no hover to give,
 *  so on a phone or tablet the field would idle scattered and never resolve. Without a real
 *  pointer, or with reduced motion, the interaction is off and the mark renders assembled
 *  and static. */
const INTERACTIVE =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Tailwind's own sky, the one colour the mark samples — and only under the pointer. */
const SKY = "#38bdf8";

/**
 * The Tailwind mark, sampled into particles, set inline in the H1 where the word "Tailwind"
 * begins (docs/DESIGN.md § The hero contains no decorative filler). The wordmark beside it
 * stays type, so the headline still reads — and is announced — as a sentence.
 *
 * It sizes to its parent, which the hero sets in `em` so the mark tracks the headline across
 * every breakpoint instead of claiming a block of its own.
 *
 * It obeys the page thesis: the dots rest in --ink and take Tailwind's sky only while the
 * pointer is on the lockup. --ink is read off <html> because the canvas cannot resolve a
 * CSS variable, and re-read when the theme toggle flips the class, since --ink inverts.
 */
export const TailwindLogotype = () => {
  const [interactive, setInteractive] = useState(false);
  const [active, setActive] = useState(false);
  const [ink, setInk] = useState("#14150f");

  useEffect(() => {
    const mq = window.matchMedia(INTERACTIVE);
    const sync = () => setInteractive(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setInk(getComputedStyle(root).getPropertyValue("--ink").trim() || "#14150f");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <ParticleImage
      imageConfig={{
        image: "/tailwindcss-mark.svg",
        // "fit" contains the artwork at its own aspect. `scale` under 10 leaves a margin the
        // dots can roam and be repelled into without clipping at the canvas edge.
        mode: "fit",
        sizeUnit: "%",
        widthPct: 100,
        heightPct: 100,
        scale: 8,
      }}
      particleShape="square"
      // particleCount sets the sampling step (150 / count): 60 -> every 2.5px. The mark is
      // headline-sized now, so a coarser lattice would resolve too few dots to read as it.
      particleCount={60}
      // the rasteriser draws each dot at ceil(size / 4) device px
      particleSize={8}
      particleColor="single"
      singleColor={active ? SKY : ink}
      // Assembled at rest, always. The vendored "roam" hover idles the dots scattered across
      // the whole box and only assembles them under the pointer; at headline size that read
      // as noise in the middle of a sentence, so the mark must be legible before it is
      // touched. The cursor still deforms it — repulsion below — and recolours it.
      hoverEnabled={false}
      repulsionEnabled={interactive}
      // "random" nudges each dot in its own direction by its own amount, so the field
      // deforms rather than stamping a clean circular hole under the cursor. Scaled down
      // with the mark: at headline size a 60px radius covered all of it.
      repulsionConfig={{
        repulsionMode: "random",
        repulsionForce: 5,
        repulsionRadius: 26,
      }}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      className="size-full"
      // with the interaction off there is nothing to hover, so the canvas stops swallowing
      // taps and scroll gestures
      style={{ pointerEvents: interactive ? undefined : "none" }}
    />
  );
};
