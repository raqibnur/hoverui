"use client";

import { useEffect, useState } from "react";

import ParticleImage from "@/components/hero/svg-particles";

/** Hover assembly and cursor repulsion are a pointer affordance. Touch has no
 *  hover to give, so on a phone or tablet the field would idle scattered and
 *  never resolve. Below 1024 — and on any width without a real pointer, which
 *  is what keeps a tap from standing in for a hover — the interaction is off
 *  and the skyline renders assembled and static. */
const INTERACTIVE =
  "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** The dotted skyline: buildings.svg rasterised into particles that scatter
 *  away from the cursor. */
export const TailwindLogotype = () => {
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(INTERACTIVE);
    const sync = () => setInteractive(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <ParticleImage
      imageConfig={{
        // buildings.svg tiled three times across the band; the sheet is
        // bottom-aligned and padded to the band aspect so nothing stretches
        image: "/tailwindcss-mark.svg",
        // "fit" contains the artwork at its own aspect. The previous "stretch" is not a mode
        // this component implements, so it fell through to the percentage branch and drew the
        // mark at 100%x100% of the box — which re-proportioned it at every breakpoint, worst
        // in the stacked layout where the box is far wider than the mark. `scale` under 10
        // leaves a margin the dots can roam and be repelled into without clipping at the edge.
        mode: "fit",
        sizeUnit: "%",
        widthPct: 100,
        heightPct: 100,
        scale: 9,
      }}
      particleShape="square"
      // particleCount sets the sampling step (150 / count): 25 -> every 6px
      particleCount={25}
      // the rasteriser draws each dot at ceil(size / 4) device px, so a value of
      // 5 was a 2px block; 20 gives a 5px dot that actually reads as a circle
      particleSize={16}
      // at rest each dot drifts within roamRadius px of where it sits in the
      // skyline, so the band reads as a loosened version of the artwork rather
      // than a cloud; it snaps back into the image while the cursor is over the
      // black part of the hero (the white nav / trust bar are excluded)
      hoverEnabled={interactive}
      // hoverTargetSelector / hoverExcludeSelector were removed: this component implements
      // neither, so they were spread straight onto the container div and React logged two
      // "does not recognize the prop on a DOM element" errors on every load. There is no
      // [data-hero] element on the page either — they were carried over from elsewhere.
      hoverConfig={{
        hoverType: "roam",
        transition: { duration: 1.1, ease: "easeInOut" },
        roamRadius: 18,
        roamShape: "rectangle",
        roamOpacity: 0.55,
      }}
      repulsionEnabled={interactive}
      // section-24's values exactly. "random" nudges each dot in its own
      // direction by its own amount, so the field deforms; "outside" pushed
      // every dot in the radius out to the rim, which is what stamped a clean
      // circular hole under the cursor.
      repulsionConfig={{
        repulsionMode: "random",
        repulsionForce: 10,
        repulsionRadius: 60,
      }}
      // with the interaction off there is nothing to hover, click or drag, so
      // the canvas stops swallowing taps and scroll gestures
      // Sized by class rather than by the inline width/height props, so it can respond. A
      // fixed 300px height against a 75% width meant the box aspect changed at every
      // viewport: on a phone that resolved to roughly 115x300, a tall slot the mark could
      // never sit in sensibly. An aspect ratio holds the box's proportions steady while its
      // width tracks the column, and the max-width stops it dominating the stacked layout
      // where it has the whole measure to itself.
      // Sized by class instead of the inline width/height props, so the box can respond. A
      // fixed 300px height against a 75% width meant the box's proportions changed at every
      // viewport — on a phone it resolved to roughly 115x300, a tall slot the mark could
      // never sit in. A fixed aspect keeps the composition steady while the width tracks the
      // column, and the max-width stops it dominating the stacked layout where it has the
      // whole measure to itself.
      className="mx-auto aspect-[16/10] w-full max-w-[22rem] sm:max-w-[26rem] lg:max-w-none"
      style={{
        pointerEvents: interactive ? undefined : "none",
      }}
    />
  );
};
