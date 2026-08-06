import { ChargeField } from "@/components/gallery/charge-field";
import { InstallCommand } from "@/components/gallery/install-command";
import { GalleryTile, GhostTile } from "@/components/gallery/tile";
import { previews } from "@/components/gallery/previews";
import {
  effectsInGroup,
  groupProgress,
  groups,
  upcomingInGroup,
} from "@/lib/registry";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      {/* The signature: the only colour on the page, and only under the pointer. */}
      <ChargeField />

      <header className="sticky top-0 z-20 border-b border-[var(--rule)] bg-[color-mix(in_oklch,var(--paper)_82%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-display text-lg font-medium tracking-tight text-[var(--ink)]">
            hoverui
          </span>
          <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-[var(--mid)]">
            <a
              href="https://github.com/raqibnur/hover-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm transition-colors hover:text-[var(--charge)] focus-visible:text-[var(--charge)] focus-visible:outline-none"
            >
              github
            </a>
            <a
              href="/r/magnetic-button.json"
              className="rounded-sm transition-colors hover:text-[var(--charge)] focus-visible:text-[var(--charge)] focus-visible:outline-none"
            >
              /r/
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        {/* Hero — every element here is shipped inventory, no decorative filler. */}
        <section className="max-w-4xl py-20 sm:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--mid)]">
            React + Tailwind · shadcn registry
          </p>
          {/* "HOVER" is slated to run the shipped stagger-text effect once it lands; until
              then it stays as display type so nothing on the page is faked. */}
          <h1 className="mt-6 font-display text-[clamp(2.75rem,8vw,6rem)] font-medium leading-[0.95] tracking-[-0.04em] text-[var(--ink)]">
            Hover effects for
            <br />
            React and Tailwind.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[var(--ink)]">
            Twelve of them. One file each. No dependencies. Installable with the shadcn
            CLI.
          </p>

          <div className="mt-8 max-w-md">
            <InstallCommand slug="magnetic-button" />
          </div>

          <p className="mt-6 font-mono text-sm text-[var(--mid)]">
            Built for landing pages, not dashboards.
          </p>
        </section>

        {/* Gallery — one section per group, driven entirely by lib/registry.ts. Sections
            fill in as the frozen 12 ship; the page never fabricates a tile. */}
        <div className="space-y-20 pb-28">
          {groups.map((group) => {
            const items = effectsInGroup(group.id);
            const soon = upcomingInGroup(group.id);
            const { built, planned } = groupProgress(group.id);
            return (
              <section key={group.id} aria-labelledby={`group-${group.id}`}>
                <div className="flex items-center gap-4 border-b border-[var(--rule)] pb-3">
                  <h2
                    id={`group-${group.id}`}
                    className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--mid)]"
                  >
                    {group.label}
                  </h2>
                  <span className="h-px flex-1 bg-[var(--rule)]" />
                  {/* built / planned — the finite set is visible even before it fills in. */}
                  <span className="font-mono text-xs tabular-nums text-[var(--mid)]">
                    <span className="text-[var(--ink)]">{pad(built)}</span>
                    {" / "}
                    {pad(planned)}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((effect) => (
                    <GalleryTile
                      key={effect.slug}
                      effect={effect}
                      Preview={previews[effect.slug]}
                    />
                  ))}
                  {soon.map((effect) => (
                    <GhostTile key={effect.slug} effect={effect} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-[var(--rule)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-8 font-mono text-xs text-[var(--mid)]">
          <span>
            Hover the tiles. Every effect names its own timing — track, release, curve.
          </span>
          <span>Colour on this page is a function of your cursor. Nothing else.</span>
        </div>
      </footer>
    </div>
  );
}
