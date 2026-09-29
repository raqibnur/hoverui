import { previews } from "@/components/gallery/previews";
import { GalleryTile, GhostTile } from "@/components/gallery/tile";
import { effectsInGroup, groupProgress, groups, upcomingInGroup } from "@/lib/registry";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One section per group, driven entirely by lib/registry.ts — sections fill in as the frozen
 * 12 ship and the page never fabricates a tile. The same `groups` array feeds the nav in
 * components/site/site-header.tsx, so the two cannot disagree about what exists.
 *
 * Two columns at every width that fits them. Each group is four effects, so two columns is
 * a clean 2x2 with no orphan, and it gives every stage enough room that the effect is the
 * thing you see first, not the grid.
 */
export function Gallery() {
  return (
    <div id="gallery" className="scroll-mt-24 space-y-20 pb-28 sm:space-y-24">
      {groups.map((group) => {
        const items = effectsInGroup(group.id);
        const soon = upcomingInGroup(group.id);
        const { built, planned } = groupProgress(group.id);
        return (
          <section key={group.id} aria-labelledby={`group-${group.id}`} className="group/section">
            <div className="flex items-end justify-between gap-4">
              {/* These ids are what the nav links to; scroll-mt clears the sticky header. */}
              <h2
                id={`group-${group.id}`}
                className="scroll-mt-28 font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)] sm:text-[1.75rem]"
              >
                {group.label}{" "}
                {/*
                 * The count in brackets. It rests in --mid and warms to --charge only while
                 * the pointer is somewhere in the section — the brand stays a function of the
                 * cursor even in the headings.
                 */}
                <span className="font-sans font-medium tabular-nums text-[var(--mid)] [transition:color_300ms_cubic-bezier(0.23,1,0.32,1)] group-hover/section:text-[var(--charge)]">
                  <span className="sr-only">(</span>[{pad(built)}]<span className="sr-only"> effects)</span>
                </span>
              </h2>
              {/* built / planned — the finite set stays visible even while it fills in. */}
              <span className="pb-1 font-mono text-xs tabular-nums text-[var(--mid)]">
                <span className="text-[var(--ink)]">{pad(built)}</span> / {pad(planned)} shipped
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              {items.map((effect) => (
                <GalleryTile
                  key={effect.slug}
                  effect={effect}
                  groupLabel={group.label}
                  density={group.density}
                  Preview={previews[effect.slug]}
                />
              ))}
              {soon.map((effect) => (
                <GhostTile key={effect.slug} effect={effect} density={group.density} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
