import { InstallCommand } from "@/components/gallery/install-command";
import { TailwindLogotype } from "@/components/hero/tailwind-logotype";
import { effects } from "@/lib/registry";
import { StaggerText } from "@/registry/hover/stagger-text/stagger-text";

/**
 * The hero. Every element in it is shipped inventory or the stack the product targets — no
 * decorative filler (docs/DESIGN.md § The hero contains no decorative filler).
 *
 * Left-aligned on the same edge as the gallery headings, so the page reads as one document:
 * the headline set large across the measure, then a hairline, then the pitch and the command
 * side by side. The gallery is the page's real content, so the hero is kept to roughly one
 * screen and the first row of tiles shows above the fold on a laptop.
 */
export function Hero() {
  return (
    <section className="pb-20 pt-14 sm:pb-24 sm:pt-20">
      <p className="inline-flex items-center gap-2 rounded-full border border-[var(--rule)] bg-[var(--surface)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--mid)] sm:text-[11px] sm:tracking-[0.18em]">
        <span aria-hidden className="size-1.5 rounded-full bg-[var(--ink)]" />
        React + Tailwind · shadcn registry
      </p>

      {/*
       * The first word of the H1 IS the shipped stagger-text effect, so a visitor triggers
       * the product by accident while reading the headline. StaggerText is a server
       * component that ships no JavaScript, so this costs the page nothing.
       *
       * "Tailwind" is the lockup: the particle mark sized in em so it tracks the type, then
       * the word itself. nowrap keeps the mark from being stranded at the end of a line.
       */}
      <h1 className="mt-7 max-w-5xl text-balance font-display text-[clamp(2.6rem,8.2vw,6.25rem)] font-semibold leading-[0.94] tracking-[-0.045em] text-[var(--ink)]">
        <StaggerText>Hover</StaggerText> effects for React and{" "}
        <span className="whitespace-nowrap">
          <span
            aria-hidden
            className="mr-[0.1em] inline-block h-[0.7em] w-[1.15em] align-[-0.04em]"
          >
            <TailwindLogotype />
          </span>
          Tailwind.
        </span>
      </h1>

      <div className="mt-10 grid gap-8 border-t border-[var(--rule)] pt-8 sm:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end lg:gap-16">
        <p className="max-w-xl text-pretty text-base leading-relaxed text-[var(--mid)] sm:text-lg">
          {effects.length === 12 ? "Twelve" : effects.length} of them. One file each, no
          dependencies — you own the code the moment it lands. Add any of them with the
          shadcn CLI.{" "}
          <span className="whitespace-nowrap text-[var(--ink)]">
            <span aria-hidden className="text-[var(--mid)]">
              [
            </span>
            Hover anything below
            <span aria-hidden className="text-[var(--mid)]">
              ]
            </span>
          </span>
        </p>

        <div>
          {/*
           * `flex` with a shrinkable child, because MagneticButton's wrapper is a hardcoded
           * `inline-flex` this page cannot reach through `className`. Without this the
           * button grows to the full length of the command and scrolls the page sideways on
           * a phone.
           */}
          <div className="flex w-full [&>span]:min-w-0 [&>span]:flex-1">
            <InstallCommand slug="magnetic-button" />
          </div>
          <p className="mt-4 font-mono text-xs text-[var(--mid)]">
            Built for landing pages, not dashboards.
          </p>
        </div>
      </div>
    </section>
  );
}
