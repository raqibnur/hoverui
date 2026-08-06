"use client";

import { DrawUnderline } from "./draw-underline";

/**
 * Rendered AS the anchor rather than wrapped in one. That is the arrangement the keyboard
 * path needs — focus does not travel down the tree, so a span inside someone else's link
 * would never see that link's focus — and it is what the `as` prop exists for.
 *
 * Two links, because the effect's entire claim is that direction carries information, and
 * a single centred word gives a visitor no reason to approach from one side rather than
 * the other. Set side by side, sweeping across the pair draws one rule left-to-right and
 * the next right-to-left off the same gesture, which is the thing SCOPE §10 says is
 * "immediately felt even by people who cannot say why".
 */
export default function Preview() {
  return (
    <div className="flex items-baseline gap-6 text-sm">
      {["Documentation", "Changelog"].map((label) => (
        <DrawUnderline
          key={label}
          as="a"
          href="#draw-underline"
          className={[
            "rounded-sm font-medium text-[var(--ink)]",
            // Colour only. The press response and its transform transition live in the
            // component now (G11), since with as="a" the component IS the pressable thing.
            "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1)]",
            // G9 — the ring is offset off the box. Without the offset it occupies 0-2px
            // outside the border box and the rule sits ~1-2px below it, so the two coincide
            // and both are --charge on focus (the rule is currentColor, which focus recolours)
            // — the ring would paint over the centre-out draw, hiding the one state G9 asks
            // this to show, in the one place it is demonstrable.
            "focus-visible:text-[var(--charge)] focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-[var(--charge)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]",
          ].join(" ")}
        >
          {label}
        </DrawUnderline>
      ))}
    </div>
  );
}
