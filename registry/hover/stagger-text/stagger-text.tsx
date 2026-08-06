import * as React from "react";

type StaggerTextProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  /**
   * The text. A string, not a ReactNode, because the component splits it per character —
   * there is no meaningful way to split arbitrary markup, and accepting it would let a
   * consumer pass something that silently renders unsplit.
   */
  children: string;
  /** How far each character travels, in em so it scales with the type it is set in. */
  lift?: string;
};

/**
 * The wavefront. SCOPE §9 names 35ms, and the number is the effect: it is what makes the
 * word read as a row of keys going down in sequence rather than as one block moving.
 *
 * Capped, because nothing else bounds it. `children` accepts any length, and at 20
 * characters an uncapped wavefront starts its last key 665ms after its first — long enough
 * that the gesture stops reading as one hand striking a row and starts reading as a queue.
 * `scramble-button` (SCOPE §4) solves the same problem by normalising to a fixed total.
 */
const STEP_MS = 35;
const MAX_DELAY_MS = 350;

/**
 * Splits on grapheme clusters rather than code points. `Array.from` would give "e"+U+0301,
 * every ZWJ emoji, and Devanagari or Thai clusters a box each — the combining mark detaches
 * or falls back to a dotted circle and the cluster comes apart, which is illegible at every
 * frame rather than one, the single thing SCOPE §9 rules out. `Intl.Segmenter` is a
 * built-in, so this stays dependency-free, and grapheme granularity is spec-deterministic,
 * so the server and the client agree.
 */
const graphemes = (value: string): string[] => {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(value), (s) => s.segment);
  }
  return Array.from(value);
};

/**
 * Technique — no JavaScript ships. This is a server component with no hooks and no event
 * handlers: the whole effect is inherited custom properties and CSS transitions, so a
 * consumer's bundle grows by nothing and the hero H1 (docs/DESIGN.md § Layout) renders
 * without hydrating.
 *
 * The root sets `--hui-lift`, `--hui-duration` and `--hui-ease` under its trigger
 * conditions; each character reads them and derives its own `transform`. The per-character
 * offset comes from `--hui-i`, written once at render, so the stagger is one calc rather
 * than a rule per index. Custom properties do not transition, but the value derived from
 * them does.
 *
 * A transition uses the timing of the state it is heading toward, so the trigger rules
 * carrying `--hui-duration` and `--hui-ease` give G4's asymmetry for free: 200ms out-curve
 * on the way up, 420ms spring on the way down.
 *
 * SCOPE §9's "Not this" is letters arriving — flying in, rotating in 3D. Nothing here
 * animates opacity or rotation and nothing starts offscreen: the word is fully set and
 * fully legible at every frame, and hover moves it by a fraction of an em.
 *
 * G12 — `transform` only. G13 — no `will-change`; a permanently promoted layer per
 * character is exactly the standing cost that gate exists to prevent.
 */
export function StaggerText({
  children,
  lift = "-0.12em",
  className,
  ...props
}: StaggerTextProps) {
  // Grouped by word so the text can still wrap between words. A single run of character
  // boxes cannot break, so a multi-word value would overflow its container instead.
  const words = children.split(" ");
  let index = 0;
  const groups = words.map((word) => {
    const chars = graphemes(word).map((char) => ({ char, i: index++ }));
    return chars;
  });

  return (
    <span
      {...props}
      className={[
        // Resting state, and the timing a leave uses. Written literally: Tailwind scans
        // source text, so a class assembled by interpolation is never generated and the
        // declaration silently goes missing.
        //   rise 200ms cubic-bezier(0.23, 1, 0.32, 1)   — G3's 180-260ms enter band
        //   fall 420ms cubic-bezier(0.34, 1.4, 0.64, 1) — G3's 350-450ms release band
        "[--hui-lift:0] [--hui-duration:420ms] [--hui-ease:cubic-bezier(0.34,1.4,0.64,1)]",
        // Pointer trigger on the word itself. G7 — `pointer-fine` supplies (pointer: fine)
        // and Tailwind's hover variant supplies (hover: hover).
        "pointer-fine:hover:[--hui-lift:1] pointer-fine:hover:[--hui-duration:200ms] pointer-fine:hover:[--hui-ease:cubic-bezier(0.23,1,0.32,1)]",
        // The same, for the ordinary case of the word sitting inside a link or button with
        // padding around it. The media query is written out in full here rather than left
        // to `pointer-fine:`: a literal `:hover` inside an arbitrary variant bypasses
        // Tailwind's own hover wrapper, so (hover: hover) would never be emitted and a pen
        // — a fine pointer with no hover — would latch the word lifted on tap (G7).
        "[@media(hover:hover)_and_(pointer:fine)]:[a:hover_&]:[--hui-lift:1] [@media(hover:hover)_and_(pointer:fine)]:[a:hover_&]:[--hui-duration:200ms] [@media(hover:hover)_and_(pointer:fine)]:[a:hover_&]:[--hui-ease:cubic-bezier(0.23,1,0.32,1)]",
        "[@media(hover:hover)_and_(pointer:fine)]:[button:hover_&]:[--hui-lift:1] [@media(hover:hover)_and_(pointer:fine)]:[button:hover_&]:[--hui-duration:200ms] [@media(hover:hover)_and_(pointer:fine)]:[button:hover_&]:[--hui-ease:cubic-bezier(0.23,1,0.32,1)]",
        // G9 — keyboard parity, ungated by pointer since a keyboard has none to qualify.
        // Any focusable ancestor, not just a literal anchor or button: a wrapper carrying
        // role="button", a <summary>, or anything with tabindex gives a keyboard user
        // something to land on and must therefore give them the state too.
        "[:focus-visible_&]:[--hui-lift:1] [:focus-visible_&]:[--hui-duration:200ms] [:focus-visible_&]:[--hui-ease:cubic-bezier(0.23,1,0.32,1)]",
        // And for a focusable element rendered inside the word.
        "has-[:focus-visible]:[--hui-lift:1] has-[:focus-visible]:[--hui-duration:200ms] has-[:focus-visible]:[--hui-ease:cubic-bezier(0.23,1,0.32,1)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/*
       * The text, once, for assistive technology and for find-in-page. The split copy below
       * is hidden from both. The string is therefore in the DOM twice; the hidden one opts
       * out of selection so a copy still yields it once.
       */}
      <span className="sr-only" style={{ userSelect: "none" }}>
        {children}
      </span>

      {/*
       * The split copy.
       *
       * Honest limitation: each grapheme becomes its own box, which suspends kerning pairs
       * and ligatures across the whole word. At body sizes that is imperceptible; in a
       * display face at hero scale a tight pair such as "Ta" sits a fraction wider than the
       * same word set normally. Nothing shifts during the animation — the boxes are laid out
       * once and only their transforms change — but the word is very slightly wider at rest.
       */}
      <span aria-hidden="true">
        {groups.map((chars, w) => (
          <React.Fragment key={w}>
            {w > 0 ? " " : null}
            <span className="inline-block whitespace-pre">
              {chars.map(({ char, i }) => (
                <span
                  key={i}
                  className={[
                    "inline-block",
                    // G12 — the movement, and the only thing that animates. Under reduced
                    // motion no rule sets a `transform`: this sits inside
                    // prefers-reduced-motion: no-preference, and there is deliberately no
                    // reduced-motion counterpart. See the note below.
                    "motion-safe:[transform:translateY(calc(var(--hui-lift)*var(--hui-travel)))]",
                  ].join(" ")}
                  style={
                    {
                      "--hui-i": i,
                      "--hui-travel": lift,
                      transitionProperty: "transform",
                      transitionDuration: "var(--hui-duration)",
                      transitionTimingFunction: "var(--hui-ease)",
                      // The wavefront, bounded so a long string does not turn it into a queue.
                      transitionDelay: `calc(min(var(--hui-i) * ${STEP_MS}ms, ${MAX_DELAY_MS}ms))`,
                    } as React.CSSProperties
                  }
                >
                  {char}
                </span>
              ))}
            </span>
          </React.Fragment>
        ))}
      </span>
    </span>
  );
}

/**
 * G10 — the reduced-motion decision, recorded because it is a decision and not an omission.
 *
 * Under `prefers-reduced-motion: reduce` this effect does nothing at all. G10 asks to
 * remove the movement and keep the information, and here there is no information under the
 * movement: the word is already fully set and fully readable at rest, and the lift is
 * decoration on top of it. There is nothing left to preserve once it goes.
 *
 * A staggered opacity ripple was the obvious alternative and is wrong twice over. `--ink`
 * #14150F at 0.55 over `--paper` #E7E9E4 composites to about #737470 — 3.85:1, under AA for
 * normal text — and SCOPE §9's one hard requirement is that the word stay legible at every
 * frame. It also inverts the gesture: hovering a link to make it fainter reads as disabling
 * it, and opacity is the arrival channel SCOPE §9's "Not this" rules out to begin with.
 */
