import { StaggerText } from "./stagger-text";

/**
 * The word sits inside a link, which is the ordinary way this gets used and the only way
 * the keyboard path is reachable — text is not focusable, so the effect answers a focusable
 * ancestor's `:focus-visible` rather than its own. Tabbing to it here lifts the word, so
 * the G9 state is demonstrable on the page rather than only in the source.
 *
 * Set large on purpose. docs/DESIGN.md § Layout gives this effect the hero H1 at
 * `clamp(...~96px)`, and the kerning suspension the component documents is sub-pixel at
 * body sizes and several pixels at display sizes in Bricolage at -0.04em. A preview set in
 * small type would never show the effect under the condition it actually ships in.
 */
export default function Preview() {
  return (
    <a
      href="#stagger-text"
      className={[
        "rounded-sm font-display text-6xl font-medium tracking-[-0.04em] text-[var(--ink)]",
        // G1/G2/G3 — every property named, project curve, inside the enter band.
        // G4/G11 — `transform` sits on the BASE rule, not only under :active, or the
        // release would have no transform in its property list and would snap. An effect
        // whose Intent is a row of keys being depressed owes a press response.
        "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
        "active:[transform:scale(0.97)]",
        "focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
      ].join(" ")}
    >
      <StaggerText>Hover</StaggerText>
    </a>
  );
}
