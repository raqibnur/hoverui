import { SlideMarqueeLink } from "./slide-marquee-link";

/**
 * Wrapped in a real anchor rather than rendered as one. The component reads that link's
 * hover and `:focus-visible` through its ancestor rules, so both paths work from inside and
 * tabbing here runs the slide — which is what makes the G9 state demonstrable on the page
 * rather than only in the source.
 *
 * The rule beneath is a bottom border on the window, matching `blur-swap-link`, the tile before it
 * so the Text & links section reads as one set. It is a plain colour fade, not a draw:
 * `draw-underline` owns the drawing gesture in this same section, and an affordance saying
 * "this is a link" should not read as a second effect competing with the marquee.
 *
 * Labels are single words of similar measure. The window clips to its own width, so a long
 * label is not wrong here the way a lopsided pair was in `blur-swap-link` — but a short set
 * keeps a stack of nav reading as nav.
 */
export default function Preview() {
  return (
    <div className="flex flex-col items-start gap-3 text-sm">
      {/*
       * Plain link text that the page does not already render as chrome, and that no
       * neighbouring tile uses. Unlike `blur-swap-link` next door, the arriving copy here is
       * the label's own duplicate — the marquee discloses nothing — so these only have to be
       * plausible link text, not answers to themselves.
       *
       * Two of them, matching `blur-swap-link` so the pair of tiles reads as one set. The
       * strip is identical on every label, so a third repeat demonstrated nothing a second
       * did not; "Contact" went because it is the one word here that implies a route this
       * project does not have (SCOPE.md).
       *
       * Three sets were tried and rejected, each for the same underlying reason: a demo that
       * echoes the page reads as mis-rendered page furniture rather than as a link.
       *   "Documentation"/"Changelog"  — `draw-underline`'s labels verbatim, one tile away,
       *                                  and SCOPE.md rules out a docs site or any route.
       *   "Buttons"/"Cards"/"Text"     — the gallery's own mono section eyebrows, rendered
       *                                  one and two rows above this stage.
       *   "Install"/"Source"           — this tile's own persistent copy controls, in its
       *                                  header two rows up; "Source" is also the first
       *                                  label on the adjacent `blur-swap-link` tile.
       */}
      {["Overview", "Roadmap"].map((label) => (
        <a
          key={label}
          href="#slide-marquee-link"
          className={[
            // Named, never a bare `group` — components/gallery/tile.tsx puts one on its
            // <article>, and an unnamed group-hover here would fire from the tile edge.
            "group/marquee",
            "rounded-sm font-medium text-[var(--ink)]",
            // One shorthand on this element only — the component owns the movement on its
            // own strip, so nothing here competes for the property (G16).
            //
            // G11 — the anchor is the pressable thing and owes a press response. It lives
            // here rather than in the component because :active does not match descendants,
            // so a class on the window would be inert. `transform` sits in the BASE list, or
            // the release has no transform in its property list and snaps back.
            "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
            "active:[transform:scale(0.97)]",
            "focus-visible:text-[var(--charge)] focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-[var(--charge)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]",
          ].join(" ")}
        >
          <SlideMarqueeLink
            className={[
              "border-b border-transparent",
              "[transition:border-color_200ms_cubic-bezier(0.23,1,0.32,1)]",
              // Hover only. A focus-visible rule on the same property would compile to the
              // same specificity as the hover rule — v4 wraps the group class in :where(),
              // leaving :hover / :focus-visible plus the utility class — so a keyboard-focused
              // link under a resting cursor would pick its colour by Tailwind's emit order
              // rather than by anything readable (G16). The anchor's own ring already carries
              // focus, so there is nothing to add and one thing to remove.
              "group-hover/marquee:border-[var(--ink)]",
            ].join(" ")}
          >
            {label}
          </SlideMarqueeLink>
        </a>
      ))}
    </div>
  );
}
