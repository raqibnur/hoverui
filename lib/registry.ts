export type EffectGroup = "button" | "card" | "text";

/**
 * The motion signature shown in mono on each gallery tile. These are the real values from
 * the effect's `.tsx`, restated here so the tile can render them without importing the
 * component's internals. The gate (docs/MOTION.md) is the product's differentiator, so the
 * curves are surfaced on the page on purpose — nobody else publishes theirs.
 */
export type EffectMotion = {
  /** Cursor-tracking duration, if the effect tracks the pointer. Omit for enter-only effects. */
  track?: string;
  /**
   * Delay between one element and the next, for effects whose identity is a wavefront
   * rather than a duration — stagger-text's 35ms is the effect, not a detail of it. It is
   * its own field because it is not a duration: every other value here answers "how long
   * does this take", and this one answers "how far apart are they".
   */
  stagger?: string;
  /**
   * How far one channel runs ahead of another, for effects whose identity is that ordering
   * — blur-swap-link's optics lead its opacity, and SCOPE §11 says that lead is the entire
   * difference between a rack focus and a crossfade. Same reasoning as `stagger`: a number
   * that IS the effect gets a field rather than a sentence in prose.
   */
  lead?: string;
  /**
   * Time to the effect's fully arrived state, for effects with no separate leave/settle
   * transition to publish under `release` — e.g. scramble-button, where leaving mid-decode
   * no longer cancels or eases anything (MOTION.md G4/G5), so there is nothing to name as
   * a "release". An effect publishes `arrival` or `release`, not both.
   */
  arrival?: string;
  /** Release / settle duration — the motion a leave/blur actually triggers. Omit if the
   * effect has none (see `arrival`). */
  release?: string;
  /** The settle curve. */
  curve: string;
};

export type Effect = {
  slug: string;
  title: string;
  group: EffectGroup;
  /** One line, written for someone scanning the gallery. No marketing adjectives. */
  description: string;
  motion: EffectMotion;
};

/**
 * Metadata only — no component imports, so this stays importable from server components.
 * Preview components are mapped separately in components/gallery/previews.tsx.
 * Order here is the order in the gallery.
 */
export const effects: Effect[] = [
  {
    slug: "liquid-fill-button",
    title: "Liquid Fill Button",
    group: "button",
    description:
      "Colour floods in from the edge the cursor crossed. The fill origin tracks the real entry point.",
    motion: {
      release: "420ms",
      curve: "cubic-bezier(0.34, 1.4, 0.64, 1)",
    },
  },
  {
    slug: "magnetic-button",
    title: "Magnetic Button",
    group: "button",
    description: "Pulls toward the cursor, springs back on leave.",
    motion: {
      track: "120ms",
      release: "420ms",
      curve: "cubic-bezier(0.34, 1.4, 0.64, 1)",
    },
  },
  {
    slug: "border-trace-button",
    title: "Border Trace Button",
    group: "button",
    description:
      "A point of light completes one lap of the border, then settles into a steady low glow.",
    motion: {
      // The published curve has to be one the effect actually performs. The lap itself
      // runs on @keyframes (linear, not a transition-band value), so the number here is
      // the glow's leave transition — the release a user actually sees on the tile.
      release: "400ms",
      curve: "ease",
    },
  },
  {
    slug: "scramble-button",
    title: "Scramble Button",
    group: "button",
    description:
      "The label decodes left to right over 700ms, like a wavefront sweeping the word into place.",
    motion: {
      // Unlike the other three buttons, this effect has no leave/settle transition to
      // publish under `release`: leaving or blurring mid-decode no longer cancels
      // anything (MOTION.md G4/G5) — the in-flight wavefront just keeps running to
      // `children`, so there is nothing a leave actually triggers. `arrival` names what
      // does happen: the time for the decode to reach the last character. "linear"
      // describes it literally — each character's lock time is spaced in equal, linear
      // proportion to its position (i+1)/length of the total duration, not eased in/out.
      arrival: "700ms",
      curve: "linear",
    },
  },
  {
    slug: "spotlight-card",
    title: "Spotlight Card",
    group: "card",
    description:
      "A soft light trails the cursor beneath the surface, lifting the border as it passes.",
    motion: {
      // Both are transform transitions the effect actually performs: --hui-duration
      // carries 140ms while tracking and 420ms on leave, and the leave is the one that
      // uses the spring — the light settles back with a touch of overshoot (G4).
      track: "140ms",
      release: "420ms",
      curve: "cubic-bezier(0.34, 1.4, 0.64, 1)",
    },
  },
  {
    slug: "tilt-card",
    title: "Tilt Card",
    group: "card",
    description:
      "Turns up to eight degrees toward the cursor, with a sheen that travels against the turn.",
    motion: {
      // Both are written by setMotion() onto the panel and the sheen: 120ms while the
      // pointer is tracking, 420ms with the spring on leave. The curve named here is the
      // release, which is the one a visitor watches resolve.
      track: "120ms",
      release: "420ms",
      curve: "cubic-bezier(0.34, 1.4, 0.64, 1)",
    },
  },
  {
    slug: "reveal-card",
    title: "Reveal Card",
    group: "card",
    description:
      "The media recedes and desaturates while the caption rises into the space it vacates.",
    motion: {
      // Enter is 220ms with the out-curve and leave is 420ms with the spring, both carried
      // on --hui-duration/--hui-ease. The published pair is the leave, which is the one
      // that resolves on screen; the curve named here is the one the release actually runs.
      release: "420ms",
      curve: "cubic-bezier(0.34, 1.4, 0.64, 1)",
    },
  },
  {
    slug: "chase-border-card",
    title: "Chase Border Card",
    group: "card",
    description:
      "A gradient border turns while hovered, seven seconds a revolution, and coasts to a stop on leave.",
    motion: {
      // The 420ms is the coast — the transition that takes over from the keyframes on
      // leave and eases the rotation to rest. The curve is the out-curve, not the spring
      // the release band usually pairs with: a spring on an angle overshoots and runs the
      // gradient backwards, which reads as a glitch. Both are what the component performs.
      release: "420ms",
      curve: "cubic-bezier(0.23, 1, 0.32, 1)",
    },
  },
  {
    slug: "stagger-text",
    title: "Stagger Text",
    group: "text",
    description:
      "Letters lift in a 35ms wavefront, so the word reads as a row of keys going down in sequence.",
    motion: {
      // Each character rises in 200ms and falls in 420ms with the spring; the published
      // release is the fall, which is the one a leave triggers and the one carrying the
      // overshoot. The 35ms is the gap between one character and the next — SCOPE §9 names
      // it as the effect itself, so it is surfaced rather than left to prose.
      stagger: "35ms",
      release: "420ms",
      curve: "cubic-bezier(0.34, 1.4, 0.64, 1)",
    },
  },
  {
    slug: "draw-underline",
    title: "Draw Underline",
    group: "text",
    description:
      "The rule draws from the edge the cursor crossed and retracts toward the edge it left.",
    motion: {
      // 220ms to draw, 380ms to retract, both on the out-curve. The published curve is not
      // the spring the release band usually pairs with, and deliberately: overshoot past
      // zero on scaleX is a negative scale, so the rule would flip and grow back mirrored.
      // The asymmetry G4 asks for is carried by the two durations instead.
      release: "380ms",
      curve: "cubic-bezier(0.23, 1, 0.32, 1)",
    },
  },
  {
    slug: "blur-swap-link",
    title: "Blur Swap Link",
    group: "text",
    description:
      "The label defocuses out as its replacement racks in — the optics lead the opacity, so it is not a crossfade.",
    motion: {
      // 240ms in, 400ms out. The published release is the leave, and the curve is the
      // out-curve rather than the spring: overshoot past a zero radius is invalid and
      // clamps, so a spring would spend its overshoot sitting still. Both are performed.
      // The lead is 37.5% of whichever duration is running — 90ms on the way in.
      lead: "150ms",
      release: "640ms",
      curve: "cubic-bezier(0.23, 1, 0.32, 1)",
    },
  },
  {
    slug: "slide-marquee-link",
    title: "Slide Marquee Link",
    group: "text",
    description:
      "The label slides up and its duplicate arrives from below, as one strip moving past a window.",
    motion: {
      // 240ms in, 400ms out, both on the out-curve. Not the spring the release band pairs
      // with: the leave runs -50% back to 0%, so a spring would overshoot past 0% and drive
      // the strip down past rest, exposing the blank above the first copy and collapsing
      // the illusion SCOPE §12 exists to protect.
      release: "400ms",
      curve: "cubic-bezier(0.23, 1, 0.32, 1)",
    },
  },
];

/**
 * How much stage a group's effects need to perform on. Not decoration: a button and a link
 * are small objects that read fine four across, but a card is a *surface* — at four across
 * the tile stage offers 180px of usable width against the 264px the card previews are
 * authored at, so every card was rendering clipped with its caption truncated. The grid
 * class for each value lives in app/page.tsx, because Tailwind cannot generate a class name
 * assembled at runtime.
 */
export type GroupDensity = "compact" | "wide";

export const groups: { id: EffectGroup; label: string; density: GroupDensity }[] = [
  { id: "button", label: "Buttons", density: "compact" },
  { id: "card", label: "Cards", density: "wide" },
  { id: "text", label: "Text & links", density: "compact" },
];

/**
 * The rest of the frozen 12 (SCOPE.md), not yet built. These are metadata only — they
 * never enter registry.json and never render a live preview. The gallery uses them to
 * show the finite, curated set as quiet placeholders so an empty section reads as
 * "curated and in progress", not "broken". Order matches SCOPE.md.
 */
export type UpcomingEffect = { slug: string; title: string; group: EffectGroup };

export const upcoming: UpcomingEffect[] = [
];

export const getEffect = (slug: string) => effects.find((e) => e.slug === slug);

export const effectsInGroup = (group: EffectGroup) =>
  effects.filter((e) => e.group === group);

export const upcomingInGroup = (group: EffectGroup) =>
  upcoming.filter((e) => e.group === group);

/** Built vs. planned for a group's eyebrow, e.g. `{ built: 2, planned: 4 }`. */
export const groupProgress = (group: EffectGroup) => ({
  built: effectsInGroup(group).length,
  planned: effectsInGroup(group).length + upcomingInGroup(group).length,
});

/** The mono metadata strip a tile reveals on hover, e.g. "track 120ms · release 420ms". */
export const motionSummary = ({ track, stagger, lead, arrival, release }: EffectMotion) =>
  [
    track && `track ${track}`,
    stagger && `stagger ${stagger}`,
    lead && `lead ${lead}`,
    arrival && `arrival ${arrival}`,
    release && `release ${release}`,
  ]
    .filter(Boolean)
    .join(" · ");

export const installCommand = (slug: string) =>
  `npx shadcn@latest add https://hoverui.com/r/${slug}.json`;
