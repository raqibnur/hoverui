import { previews } from "@/components/gallery/previews";
import { GalleryTile, GhostTile } from "@/components/gallery/tile";
import {
  type GroupDensity,
  effectsInGroup,
  groupProgress,
  groups,
  upcomingInGroup,
} from "@/lib/registry";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Written out per density rather than assembled, because Tailwind scans source text: a class
 * name built by interpolation is never generated and the columns silently go missing. See the
 * `GroupDensity` doc comment in lib/registry.ts for why cards get their own value.
 */
const grid: Record<GroupDensity, string> = {
  compact: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  wide: "grid-cols-1 sm:grid-cols-2",
};

/**
 * One section per group, driven entirely by lib/registry.ts — sections fill in as the frozen
 * 12 ship and the page never fabricates a tile. The same `groups` array feeds the nav menu in
 * components/site/site-header.tsx, so the two cannot disagree about what exists.
 */
export function Gallery() {
  return (
    <div id="gallery" className="scroll-mt-24 space-y-20 pb-28">
      {groups.map((group) => {
        const items = effectsInGroup(group.id);
        const soon = upcomingInGroup(group.id);
        const { built, planned } = groupProgress(group.id);
        return (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <div className="flex items-center gap-4">
              {/* These ids are what the nav menu links to. scroll-mt lands the heading a
                  little below the top edge rather than flush against it, so the jump arrives
                  on a section rather than on a line of text with nothing above it. */}
              <h2
                id={`group-${group.id}`}
                className="scroll-mt-28 font-mono text-xs uppercase tracking-[0.2em] text-[var(--mid)]"
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

            <div className={`mt-6 grid gap-4 ${grid[group.density]}`}>
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
  );
}
