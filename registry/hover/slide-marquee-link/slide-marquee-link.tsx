import * as React from "react";

type SlideMarqueeLinkProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> & {
  /**
   * The label. A string, because the visible copies are drawn as generated content read
   * from a data attribute rather than as text nodes — see the note on leaks below. An empty
   * string gives every copy a zero-height line box and collapses the window, so pass one.
   */
  children: string;
};

/**
 * Technique — no JavaScript ships. A server component with no hooks and no handlers.
 *
 * SCOPE §12's "Not this" is two independently animated spans, and it is right that the
 * illusion collapses if they disagree by a pixel. So there are not two animated things
 * here: there is ONE strip carrying both copies, and it moves by -50% of its own height.
 *
 * That percentage is what makes it exact rather than merely careful. The strip holds
 * exactly two copies of one string set in one face at one size, so half its height IS one
 * copy's height, whatever that turns out to be — small type, display type, a font that
 * fails to load and falls back, a fractional device pixel ratio, a consumer's own
 * line-height (which every copy inherits equally, since none can be reached without the
 * others). Nothing is measured and there is no second value to keep in step, so there is no
 * arithmetic that can drift. The copies cannot desynchronise because they are not two
 * moving parts; they are one.
 *
 * The window is sized by a fourth copy sitting in normal flow, hidden: the strip is out of
 * flow and cannot size its own container, and hard-coding a line height here would be the
 * pixel that breaks it.
 *
 * CLIPPING — `overflow: clip`, never `hidden`. `hidden` makes the window a scroll
 * container, and the strip's second copy lies outside its scrollport. Find-in-page reaches
 * that copy, the browser scrolls the window to it, and `scrollTop` stays at one line
 * height: the link then rests showing copy 2 and hovering slides it to blank, broken until
 * reload. `clip` clips identically, cannot be scrolled, and keeps the bottom-margin-edge
 * baseline that `align-bottom` relies on. Measured before the change: `scrollHeight` 40
 * against `clientHeight` 20, and a forced scroll stuck.
 *
 * LEADING — the window is exactly one line box tall and it clips, so the line box has to be
 * at least as tall as the face's ink box or ascenders and descenders are cut at rest,
 * before any hover. Tailwind's display sizes ship `line-height: 1`, well inside a typical
 * ~1.2em ink box, so the floor here is not defensive: it is the default path for the
 * display-scale link this effect is for. It is set on the window and inherited identically
 * by the ruler and both copies, so `-50%` stays exact.
 *
 * LEAKS — the two visible copies are generated content, not text. `aria-hidden` governs the
 * accessibility tree and `user-select` governs dragging, but neither governs find-in-page:
 * as text nodes, one visible word reported three matches, two of them at positions nobody
 * can see. Generated content is neither findable nor selectable, which fixes both.
 *
 * It IS in the accessibility tree, though — the accname spec folds ::before and ::after
 * into the computed name — so the `aria-hidden` on the ruler and on the strip is doing real
 * work and has to stay. Drop it and the link announces its label four times. What makes the
 * `sr-only` copy the single accessible name is that attribute, not the choice of generated
 * content.
 *
 * G12 — `transform` only. G13 — no `will-change`, nothing paints through an effect layer.
 *
 * G10 — reduced motion holds the strip still, and uniquely among these twelve that removes
 * the effect entirely rather than gently. That is correct here rather than a shortcut:
 * SCOPE §12 specifies the arriving copy as the label's own *duplicate*, so both copies read
 * the same word. Nothing is disclosed by the exchange, nothing is hidden without it, and
 * the label is legible throughout. There is no information under the movement to keep.
 *
 * G9, and the honest limit of this component: the arrived state is pixel-identical to rest
 * — same word, same position — so focus runs the slide and then leaves nothing behind, and
 * under reduced motion it leaves nothing at all. This effect therefore CANNOT discharge G9
 * on its own, and does not pretend to: a consumer must supply the visible focus state, and
 * the registry description says so. The trigger rules below exist so the motion answers a
 * keyboard as well as a pointer, not as a substitute for that affordance.
 *
 * G8 — on touch and anywhere without hover the link rests showing the label, still. That is
 * the finished state: a marquee at rest is a word, and no handler exists to strand it.
 *
 * G6 — nothing appears from nothing; the arriving copy is already set and already full
 * size, waiting one line below the window.
 */
export function SlideMarqueeLink({ children, className, ...props }: SlideMarqueeLinkProps) {
  return (
    <span
      {...props}
      // The label for the generated-content copies below, carried as a data attribute and
      // read with attr() rather than as a custom property set from an inline style.
      //
      // That is a CSP decision, not a stylistic one. A `style-src` without 'unsafe-inline'
      // blocks inline style ATTRIBUTES — nonces do not apply to attributes, and
      // `style-src-attr` falls back to `style-src` — which is exactly the policy the
      // Next.js nonce recipe produces. Set this way, the property would never land,
      // `content: var(--hui-label)` would be invalid at computed-value time, `content`
      // would reset to none, all three copies would disappear, the in-flow ruler would have
      // no height, and the window would collapse to 0x0: an invisible, unclickable link.
      // attr() on a data attribute is exempt and cannot fail that way. It also removes the
      // escaping problem — JSON escapes are not CSS escapes, so a label containing a
      // newline or tab would have rendered as a literal "n" or "t" in the visible copies
      // while the accessible name stayed correct.
      data-hui-label={children}
      className={[
        // The window. Sized by the ruler, floored on leading, and clipped — see above.
        "relative inline-block overflow-clip align-bottom leading-[1.35]",
        // Resting state, and the timing a leave uses.
        "[--hui-slide:0] [--hui-duration:400ms]",
        // Pointer trigger on the label itself. G7 — `pointer-fine` supplies (pointer: fine)
        // and Tailwind's hover variant supplies (hover: hover), so a tap cannot latch it.
        "pointer-fine:hover:[--hui-slide:1] pointer-fine:hover:[--hui-duration:240ms]",
        // The host itself, when a consumer makes it focusable.
        "focus-visible:[--hui-slide:1] focus-visible:[--hui-duration:240ms]",
        // The ordinary case: this sits inside a link or button with padding around it. The
        // media query is written out rather than left to `pointer-fine:`, because a literal
        // hover pseudo-class inside an arbitrary variant bypasses Tailwind's own wrapper, so
        // (hover: hover) would never be emitted and a pen — a fine pointer with no hover —
        // would latch the slide on tap (G7).
        "[@media(hover:hover)_and_(pointer:fine)]:[:is(a,button,[role=button],summary):hover_&]:[--hui-slide:1] [@media(hover:hover)_and_(pointer:fine)]:[:is(a,button,[role=button],summary):hover_&]:[--hui-duration:240ms]",
        // Keyboard, ungated by pointer since a keyboard has none to qualify. Scoped to the
        // same interactive ancestors as the hover rule, deliberately: an unscoped
        // focus-visible ancestor selector also matches a container focused programmatically
        // — a main with tabindex="-1" reached by a skip link, or an open dialog — which
        // would strand every instance inside it mid-slide.
        "[:is(a,button,[role=button],summary):focus-visible_&]:[--hui-slide:1] [:is(a,button,[role=button],summary):focus-visible_&]:[--hui-duration:240ms]",
        // G10 — quadrupled, and the count is not arbitrary: :is() takes the specificity of
        // its most specific argument, and [role=button] is an attribute selector, so the
        // ancestor rules reach (0,1,0)+(0,1,0)+(0,1,0) = (0,3,0). A tripled class would tie
        // and lose on source order; a media query adds none of its own (G16).
        "motion-reduce:[&&&&]:[--hui-duration:0ms] motion-reduce:[&&&&]:[--hui-slide:0]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/*
       * The window's ruler. In normal flow so it gives the window exactly one line of
       * height, drawn as generated content so it is never found, read, or copied.
       */}
      <span aria-hidden="true" data-hui-label={children} className="invisible block before:[content:attr(data-hui-label)]" />

      {/*
       * The strip. One box, two copies, one movement. Out of flow so it cannot size the
       * window, pinned to the window's top edge so its first copy is the one on screen at
       * rest.
       */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0"
        style={{
          transform: "translateY(calc(var(--hui-slide) * -50%))",
          // G1 — the one property named. G2 — the project out-curve, and G4's asymmetry is
          // carried by the two durations on --hui-duration rather than by a second curve.
          //
          // Not the spring the release band's note pairs with. The leave runs -50% back to
          // 0%, so a spring would overshoot past 0% — driving the strip DOWN past rest and
          // exposing the blank above the first copy. There is no copy there to catch it, so
          // the illusion SCOPE §12 protects would break on every leave. This is the fourth
          // effect in this library to need an evenly-decaying decelerator the three project
          // curves do not offer, which is a question for docs/MOTION.md rather than a fifth
          // private workaround.
          transitionProperty: "transform",
          transitionDuration: "var(--hui-duration)",
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <span data-hui-label={children} className="block before:[content:attr(data-hui-label)]" />
        <span data-hui-label={children} className="block before:[content:attr(data-hui-label)]" />
      </span>

      {/*
       * The accessible name, and the only real text in the component: the one thing a screen
       * reader announces, find-in-page matches, and a drag copies.
       */}
      <span className="sr-only">{children}</span>
    </span>
  );
}
