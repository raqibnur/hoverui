import { InstallCommand } from "@/components/gallery/install-command";
import { TailwindLogotype } from "@/components/hero/tailwind-logotype";
import { effects } from "@/lib/registry";
import { StaggerText } from "@/registry/hover/stagger-text/stagger-text";

/**
 * The hero. Every element in it is shipped inventory or the stack the product targets — no
 * decorative filler (docs/DESIGN.md § The hero contains no decorative filler).
 *
 * One centred column: the gallery is the page's real content and starts a scroll below, so
 * the hero states what this is, hands over the command, and gets out of the way. The Tailwind
 * mark sits under the command as the stack's signature rather than beside the headline
 * competing with it.
 */
export function Hero() {
  return (
    <section className="flex flex-col items-center pb-16 pt-16 text-center sm:pb-20 sm:pt-24">
      <p className="inline-flex items-center gap-2 rounded-full border border-[var(--rule)] bg-[var(--surface)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--mid)] sm:text-[11px] sm:tracking-[0.18em]">
        <span aria-hidden className="size-1.5 rounded-full bg-[var(--ink)]" />
        React + Tailwind · shadcn registry
      </p>

      {/*
       * The first word of the H1 IS the shipped stagger-text effect, so a visitor triggers
       * the product by accident while reading the headline. StaggerText is a server
       * component that ships no JavaScript, so this costs the page nothing.
       */}
      <h1 className="mt-7 max-w-4xl text-balance font-display text-[clamp(2.4rem,7vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--ink)]">
        <StaggerText>Hover</StaggerText> effects for React and Tailwind.
      </h1>

      <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[var(--mid)] sm:text-lg">
        {effects.length === 12 ? "Twelve" : effects.length} of them. One file each, no
        dependencies — you own the code the moment it lands. Add any of them with the shadcn
        CLI.{" "}
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

      {/*
       * `flex` with a shrinkable child, because MagneticButton's wrapper is a hardcoded
       * `inline-flex` this page cannot reach through `className`. Without this the button
       * grows to the full length of the command and scrolls the page sideways on a phone.
       */}
      <div className="mt-9 flex w-full max-w-lg [&>span]:min-w-0 [&>span]:flex-1">
        <InstallCommand slug="magnetic-button" />
      </div>

      <p className="mt-5 font-mono text-xs text-[var(--mid)]">
        Built for landing pages, not dashboards.
      </p>

      <div className="mt-10 w-full max-w-[15rem] sm:max-w-[17rem]">
        <TailwindLogotype />
      </div>
    </section>
  );
}
