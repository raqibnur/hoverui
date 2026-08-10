import { InstallCommand } from "@/components/gallery/install-command";
import { TailwindLogotype } from "@/components/hero/tailwind-logotype";
import { StaggerText } from "@/registry/hover/stagger-text/stagger-text";

/**
 * The hero. Every element in it is shipped inventory or the stack the product targets — no
 * decorative filler (docs/DESIGN.md § The hero contains no decorative filler).
 *
 * One column until `lg`, two above it. The breakpoint is not arbitrary: it is the same 1024px
 * the logotype uses to decide whether its particle field is interactive, so the hero splits
 * exactly when the art becomes something you can play with and stacks whenever it is a static
 * image. Below that the copy gets the full measure instead of the 154px column that was
 * breaking the H1 across six lines on a phone.
 *
 * The vertical rhythm lives on the grid rather than on the copy column, so both columns sit
 * inside one hero padding instead of the art inheriting whatever the text left over.
 */
export function Hero() {
  return (
    <section className="grid grid-cols-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-12">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--mid)]">
          React + Tailwind · shadcn registry
        </p>
        {/*
         * The hero strategy in one line: the first word of the H1 IS the shipped stagger-text
         * effect, so a visitor triggers the product by accident while reading the headline,
         * before they scroll. StaggerText is a server component that ships no JavaScript, so
         * this costs the page nothing.
         *
         * The clamp floor is 2.25rem rather than 2.75: at 44px "Hover effects for" is wider
         * than a 327px phone measure, so every line wrapped again under the explicit break.
         * 7vw keeps the same 4rem ceiling and reaches it at the same width.
         */}
        <h1 className="mt-6 font-display text-[clamp(2.25rem,7vw,4rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--ink)]">
          <StaggerText>Hover</StaggerText> effects for
          <br />
          React and Tailwind.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--ink)]">
          Twelve of them. One file each. No dependencies. Installable with the shadcn CLI.
        </p>
        {/*
         * `flex` with a shrinkable child, because MagneticButton's wrapper is a hardcoded
         * `inline-flex` this page cannot reach through `className` — that prop lands on the
         * button inside it. Without this the button grows to the full length of the command
         * and drags the whole document into a 248px horizontal scroll on a phone. Fixing it
         * from the parent is also why the shipped effect file did not have to be touched.
         */}
        <div className="mt-8 flex w-full max-w-md [&>span]:min-w-0 [&>span]:flex-1">
          <InstallCommand slug="magnetic-button" />
        </div>

        <p className="mt-6 font-mono text-xs text-[var(--mid)] sm:text-sm">
          Built for landing pages, not dashboards.
        </p>
      </div>

      {/* Ordered after the copy so a stacked phone layout reads content first; `items-center`
          on the grid pairs it with the text block once there are two columns. */}
      <div>
        <TailwindLogotype />
      </div>
    </section>
  );
}
