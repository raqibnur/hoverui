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
 * keeps three tiles of nav reading as nav.
 */
export default function Preview() {
  return (
    <div className="flex flex-col items-start gap-3 text-sm">
      {/*
       * The gallery's own three section names — real navigation for this single page, and
       * shared with no other tile. `draw-underline` two tiles away already uses
       * "Documentation"/"Changelog", and SCOPE.md rules out a docs site and any route
       * beyond "/", so nav pointing at those would be demonstrating surfaces that do not
       * exist.
       */}
      {["Buttons", "Cards", "Text"].map((label) => (
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
              "group-hover/marquee:border-[var(--ink)]",
              "group-focus-visible/marquee:border-[var(--charge)]",
            ].join(" ")}
          >
            {label}
          </SlideMarqueeLink>
        </a>
      ))}
    </div>
  );
}
