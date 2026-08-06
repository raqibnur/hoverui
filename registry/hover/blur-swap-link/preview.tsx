import { BlurSwapLink } from "./blur-swap-link";

/**
 * Wrapped in a real anchor rather than rendered as one. This effect swaps a label rather
 * than owning an interactive box, so the consumer's own link stays the link — and the
 * component reads that link's `:hover` and `:focus-visible` through its ancestor rules, so
 * both paths work from inside. Tabbing to it here racks the swap, which is what makes the
 * G9 state demonstrable on the page rather than only in the source.
 *
 * The swapped label is the destination, not a synonym. A rack focus that resolves to the
 * same word with different styling is decoration; resolving to where the link goes is the
 * one arrangement where the effect carries information.
 */
export default function Preview() {
  return (
    <div className="flex flex-col items-start gap-3 text-sm">
      {/*
       * Every pair is a label and the thing that answers it, never a synonym or an
       * unrelated verb: "Source" racks to where it goes, "Registry" to what it is
       * compatible with, "Effects" to how many there are. That relationship is the whole
       * reason to reach for a rack focus over a hover colour — the second word resolves the
       * first, so the exchange carries information rather than decorating it. All three are
       * facts about this project, not placeholder nouns.
       *
       * Measures are matched deliberately too. The cell is sized to the wider of the two, so
       * a lopsided pair leaves the shorter word sitting in a box built for the longer one —
       * and the focus ring draws that box, enclosing the word plus a block of nothing at the
       * exact moment G9 exists to showcase. Measured ink widths here stay within 13% of each
       * other; "License"/"MIT" was tried and rejected at 47%.
       */}
      {[
        { label: "Source", swap: "GitHub" },
        { label: "Registry", swap: "shadcn" },
        { label: "Effects", swap: "Twelve" },
      ].map(({ label, swap }) => (
        <a
          key={label}
          href="#blur-swap-link"
          className={[
            // Named, never a bare `group` — components/gallery/tile.tsx puts one on its
            // <article>, and an unnamed group-hover here would fire from the tile edge.
            "group/swaplink",
            "rounded-sm font-medium text-[var(--ink)]",
            // One shorthand on this element only — the component owns the optics on its own
            // spans, so nothing here competes for the property (G16).
            //
            // G11 — the anchor is the pressable thing and owes a press response. It lives
            // here rather than in the component because :active does not match descendants,
            // so a class on the host span would be inert. `transform` sits in the BASE list,
            // or the release has no transform in its property list and snaps back.
            "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
            "active:[transform:scale(0.97)]",
            "focus-visible:text-[var(--charge)] focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-[var(--charge)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]",
          ].join(" ")}
        >
          {/*
           * The rule is a bottom border on the swap host, not a text-decoration on the
           * anchor. The host is inline-grid — an atomic inline-level box — so a decoration
           * set on the anchor is not painted through it and `underline` here would draw
           * nothing at all. Verified: the labels report `text-decoration-line: none` while
           * the anchor reports `underline`.
           *
           * It is present at every state and only changes colour, so it can never shift
           * layout, and it is a plain fade rather than a draw: `draw-underline` is two tiles
           * away in the same section and owns the drawing gesture. This is an affordance
           * telling you the thing is a link, not a second effect competing with the swap.
           */}
          <BlurSwapLink
            swap={swap}
            className={[
              "border-b border-transparent",
              "[transition:border-color_200ms_cubic-bezier(0.23,1,0.32,1)]",
              // Hover only. A focus-visible rule on the same property would compile to the
              // same specificity as the hover rule — v4 wraps the group class in :where(),
              // leaving :hover / :focus-visible plus the utility class — so a keyboard-focused
              // link under a resting cursor would pick its colour by Tailwind's emit order
              // rather than by anything readable (G16). The anchor's own ring already carries
              // focus, so there is nothing to add and one thing to remove.
              "group-hover/swaplink:border-[var(--ink)]",
            ].join(" ")}
          >
            {label}
          </BlurSwapLink>
        </a>
      ))}
    </div>
  );
}
