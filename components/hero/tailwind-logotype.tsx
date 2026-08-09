"use client";

import * as React from "react";

import SvgParticles from "@/components/hero/svg-particles";

/**
 * The word "Tailwind" in the hero H1, set as the Tailwind lockup: the mark is sampled into
 * particles the cursor can push around (components/hero/svg-particles.tsx), the wordmark
 * beside it stays crisp type.
 *
 * WHY ONLY THE MARK IS PARTICLES
 *
 * A particle field can only resolve detail down to its sampling lattice, and the lattice here
 * is 2-3px. The mark is two fat strokes and survives that comfortably. The wordmark at this
 * size has stems around 4px, so sampling it spent most of its particles reconstructing an
 * outline the eye already reads better as a solid — it looked like a slightly broken font
 * rather than like an effect. Splitting the lockup gives the animation the shape that can
 * carry it and leaves the type alone.
 *
 * This file is the typed, gated boundary around vendored code that has no gates of its own.
 * Three decisions are made here rather than in the vendored component:
 *
 * 1. RESTING STATE — `hoverEnabled: false`, not the component's default `roam`.
 *    Upstream's default rests with the particles scattered and assembles the image on hover.
 *    In a gallery that is fine; in an H1 it is not, because it leaves the sentence reading
 *    "Hover effects for React and ." until someone points at it, and on a phone forever.
 *    MOTION.md G8 asks for a resting state that looks finished on its own, so the mark rests
 *    ASSEMBLED and the cursor's job is to disturb it: `repulsionEnabled` pushes the particles
 *    aside as the pointer crosses them and they drift home behind it.
 *
 * 2. COLOUR — achromatic at rest, brand colour under the pointer. docs/DESIGN.md's thesis is
 *    that colour on this page is a function of the cursor, so the mark sits in `--ink` until
 *    the pointer is on the lockup and only then samples the real #38BDF8 out of the source
 *    SVG. The switch is a state change at human frequency, not per pointer event (G14):
 *    `physicsRef` is rebuilt on render, so the draw loop picks it up on the next frame
 *    without re-sampling the image. The wordmark stays `--ink` throughout — Tailwind's own
 *    wordmark colour is #0F172A, which is within a hair of `--ink` anyway, so animating it
 *    would cost a repaint to show nothing.
 *
 * 3. CAPABILITY — the vendored loop is a permanent rAF that ignores
 *    `prefers-reduced-motion` entirely, so it is never mounted unless there is a fine pointer
 *    AND motion is allowed (G7/G10). Everything else gets `<Static>` below: the whole lockup,
 *    masked to `--ink`, costing one request and no JavaScript. That is also the keyboard
 *    path — nothing here is focusable, and the accessible name comes from the sibling
 *    `sr-only` text in the H1, so a keyboard user loses no information by not getting physics.
 */

/** Full lockup. Feeds the static fallback and, cropped, the wordmark. */
const SRC = "/tailwind-logotype.svg";
/** Mark on its own, 54x33. Feeds the particle sampler. */
const MARK_SRC = "/tailwindcss-mark.svg";

/**
 * Geometry, derived rather than eyeballed.
 *
 * Everything inside the box is expressed as a PERCENTAGE of the box, not in `em`. The box
 * itself is a clamp() that does not track the H1's font size one-to-one at every breakpoint
 * — at the small end the clamp floor wins — so em-based offsets would drift out of the
 * lockup on mobile while percentages cannot.
 *
 * Source units: the lockup is 262 x 33, the mark occupies x 0-54, and the wordmark starts at
 * x 68. The artwork is inset inside the box by a bleed on all sides, which is the room the
 * particles have to be pushed into before they would clip at the canvas edge.
 */
const ART = { w: 262, h: 33, markEnd: 54, wordStart: 68 };
const BOX_ASPECT = 4.26;
/** Artwork width as a fraction of the box width. `scale` on the sampler is this x10. */
const ART_FRACTION = 0.876;

/** Artwork units → percent of the box WIDTH. */
const w = (units: number) => (units / ART.w) * ART_FRACTION * 100;
/** The inset on each side, in percent of box width. */
const BLEED = ((1 - ART_FRACTION) / 2) * 100;

// Horizontal bands.
const MARK_BOX_W = BLEED + w(ART.markEnd) + BLEED;
const MARK_FRACTION = w(ART.markEnd) / MARK_BOX_W;
const WORD_LEFT = BLEED + w(ART.wordStart);
const WORD_W = w(ART.w - ART.wordStart);
/** Scale the full lockup so its wordmark alone fills the wordmark box; the mark then falls
 *  outside that box to the left and is simply never painted. */
const WORD_MASK = (ART.w / (ART.w - ART.wordStart)) * 100;

// Vertical bands, in percent of the box HEIGHT.
const BOX_H = 100 / BOX_ASPECT; // as percent of box width
const ART_H = (ART_FRACTION * 100) / (ART.w / ART.h); // as percent of box width
const ART_TOP_PCT = (((BOX_H - ART_H) / 2) / BOX_H) * 100;
const ART_H_PCT = (ART_H / BOX_H) * 100;

/**
 * An inline-block's baseline is its bottom margin edge, so the box would otherwise hang the
 * artwork well above the text baseline. The wordmark sits on y≈28.7 of the 33 unit box, so
 * its own baseline is 0.87 of the artwork height down; that lands 0.345em above the box
 * bottom. The bleed is then cancelled with negative margins, or the inset would read as a
 * word space on both sides and strand the full stop out on its own.
 */
const BLEED_EM = "0.28em";
const SEAT_EM = "0.345em";
const BOX = "aspect-[4.26/1] w-[clamp(13.75rem,40vw,27rem)]";

/**
 * The G7/G10 capability gate, read through `useSyncExternalStore` rather than seeded into
 * state from an effect. Seeding from an effect is a cascading render — the tree commits with
 * the wrong answer and immediately re-renders with the right one — and on this component that
 * would mount the whole particle canvas for a frame on devices that must never get it. The
 * server snapshot is `false`, so SSR and hydration both emit the static lockup and the canvas
 * only ever appears on a second, deliberate render.
 */
const INTERACTIVE =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const subscribeInteractive = (onChange: () => void) => {
  const mq = window.matchMedia(INTERACTIVE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const getInteractive = () => window.matchMedia(INTERACTIVE).matches;
const getInteractiveOnServer = () => false;

/**
 * Masked rather than an <img>, so the artwork renders in exactly `--ink` instead of a filter
 * approximation of it — and without a second copy of the path data in this file. The same
 * technique crops the wordmark out of the full lockup below.
 */
function Masked({
  src,
  size,
  position,
  style,
}: {
  src: string;
  size: string;
  position: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-hidden
      style={{
        display: "block",
        backgroundColor: "var(--ink)",
        maskImage: `url(${src})`,
        maskSize: size,
        maskPosition: position,
        maskRepeat: "no-repeat",
        ...style,
      }}
    />
  );
}

export function TailwindLogotype() {
  const interactive = React.useSyncExternalStore(
    subscribeInteractive,
    getInteractive,
    getInteractiveOnServer,
  );
  // Human frequency, not per pointer event (G14) — one flag per enter and per leave.
  const [lit, setLit] = React.useState(false);
  // The particle sampler parses hex and rgb() only, so it cannot be handed `var(--ink)`; the
  // token is resolved once here rather than duplicated into this file as a literal. A lazy
  // initialiser rather than an effect: it is read during render, never written back, and it
  // reaches no markup, so there is nothing for hydration to disagree about.
  const [ink] = React.useState(() =>
    typeof window === "undefined"
      ? "#14150F"
      : getComputedStyle(document.documentElement)
          .getPropertyValue("--ink")
          .trim() || "#14150F",
  );

  return (
    <span
      className={`relative inline-block align-baseline ${BOX}`}
      style={{
        transform: `translateY(${SEAT_EM})`,
        marginLeft: `-${BLEED_EM}`,
        marginRight: `-${BLEED_EM}`,
      }}
      // The whole lockup is the hover target, not just the canvas: the mark should light when
      // you reach the word, not only once you are on top of the icon itself.
      onPointerEnter={() => setLit(true)}
      onPointerLeave={() => setLit(false)}
    >
      {interactive ? (
        <>
          {/* The mark. Full box height — the vertical bleed is already inside it. */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: `${MARK_BOX_W}%`,
              height: "100%",
            }}
          >
            <SvgParticles
              width="100%"
              height="100%"
              imageConfig={{
                image: MARK_SRC,
                mode: "fit",
                scale: MARK_FRACTION * 10,
              }}
              // gap = round(150 / particleCount), floored at 2. The mark is two broad strokes,
              // so a 3px lattice still reads as the shape and leaves the grain visible —
              // denser than that and it fills in to a solid and stops looking like particles.
              particleCount={50}
              particleSize={5}
              particleShape="circle"
              // The page thesis, applied: `single` --ink at rest, the artwork's own #38BDF8
              // only while the pointer is on the lockup.
              particleColor={lit ? "original" : "single"}
              singleColor={ink}
              // Rests assembled — see note 1 above.
              hoverEnabled={false}
              repulsionEnabled
              repulsionConfig={{
                repulsionMode: "outside",
                repulsionForce: 8,
                repulsionRadius: 46,
              }}
            />
          </span>

          {/* The wordmark, cropped out of the full lockup so there is no second asset. */}
          <Masked
            src={SRC}
            size={`${WORD_MASK}% auto`}
            position="right center"
            style={{
              position: "absolute",
              left: `${WORD_LEFT}%`,
              top: `${ART_TOP_PCT}%`,
              width: `${WORD_W}%`,
              height: `${ART_H_PCT}%`,
            }}
          />
        </>
      ) : (
        <Masked
          src={SRC}
          size={`${ART_FRACTION * 100}% auto`}
          position="center"
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </span>
  );
}
