import type { ComponentType } from "react";

import { TileActions } from "@/components/gallery/tile-actions";
import { type Effect, type UpcomingEffect } from "@/lib/registry";
import { readEffectSource } from "@/lib/source";

/**
 * One gallery cell, built as a lab-bench "channel" (docs/DESIGN.md). Three fixed regions:
 *
 *   1. Header — the effect's identity plus its two copy controls, always present so the
 *      command and the source are grabbable without hovering, by keyboard, and on touch.
 *   2. Stage — a recessed panel where the effect performs, uncovered. Nothing ever animates
 *      over it, so hovering the tile shows the effect and only the effect.
 *   3. Readout — the motion signature, always legible (the gate is the product's
 *      differentiator, so it is never hidden). It rests in quiet mono and *energises* toward
 *      --charge under the cursor: colour on the tile is a function of the pointer, not chrome
 *      that slides in and out.
 *
 * All values come from lib/registry.ts; none are typed into this file.
 */
export async function GalleryTile({
  effect,
  Preview,
}: {
  effect: Effect;
  Preview?: ComponentType;
}) {
  // Read straight off disk so the copied code is byte-for-byte what installs (lib/source.ts).
  const code = await readEffectSource(effect.slug).catch(() => "");
  const { track, stagger, lead, arrival, release, curve } = effect.motion;

  return (
    // The id gives each tile a real fragment target, so a preview that needs a focusable
    // affordance (reveal-card, tilt-card) can link somewhere that exists instead of
    // writing a dead fragment into the URL.
    <article
      id={effect.slug}
      // On touch there is no cursor to follow, so the charge anchors to whichever tile is
      // nearest the viewport centre (docs/DESIGN.md § Touch). The attribute is the whole
      // contract — components/gallery/charge-field.tsx queries it once, and nothing here
      // listens to anything.
      data-charge-anchor=""
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--rule)] bg-[var(--surface)] transition-colors duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:border-[color-mix(in_oklch,var(--charge)_45%,var(--rule))] focus-within:border-[color-mix(in_oklch,var(--charge)_45%,var(--rule))]"
    >
      {/* 1. Identity + persistent copy controls. */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-[var(--ink)]">{effect.title}</h3>
          <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--mid)]">
            {effect.slug}
          </p>
        </div>
        <TileActions slug={effect.slug} code={code} />
      </div>

      {/* 2. Stage. Recessed to --paper so it reads as a screen the effect plays on; the
             effect rests in its finished state, never a stranded hover on touch. */}
      <div className="mx-4 mb-4 mt-3 flex min-h-[136px] flex-1 items-center justify-center rounded-lg border border-[var(--rule)] bg-[var(--paper)] p-6">
        {Preview ? (
          <Preview />
        ) : (
          <span className="font-mono text-xs text-[var(--mid)]">preview missing</span>
        )}
      </div>

      {/* 3. Readout. Persistent; values light --charge under the pointer, the hairline warms
             with them. Enter-only effects omit `track`, so it renders only when present. */}
      <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-t border-[var(--rule)] px-4 pb-3 pt-3 font-mono text-[11px] transition-colors duration-300 group-hover:border-[color-mix(in_oklch,var(--charge)_35%,var(--rule))]">
        {track ? (
          <div className="flex items-baseline gap-1.5">
            <dt className="text-[10px] uppercase tracking-widest text-[var(--mid)]">track</dt>
            <dd className="tabular-nums text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--charge)]">
              {track}
            </dd>
          </div>
        ) : null}
        {/* Wavefront effects publish the gap between elements, not just durations —
            stagger-text's 35ms is the effect (SCOPE §9), so it is shown, not buried. */}
        {stagger ? (
          <div className="flex items-baseline gap-1.5">
            <dt className="text-[10px] uppercase tracking-widest text-[var(--mid)]">stagger</dt>
            <dd className="tabular-nums text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--charge)]">
              {stagger}
            </dd>
          </div>
        ) : null}
        {/* Effects whose identity is one channel leading another publish that offset —
            blur-swap-link's optics lead its opacity (SCOPE §11). */}
        {lead ? (
          <div className="flex items-baseline gap-1.5">
            <dt className="text-[10px] uppercase tracking-widest text-[var(--mid)]">lead</dt>
            <dd className="tabular-nums text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--charge)]">
              {lead}
            </dd>
          </div>
        ) : null}
        {release ? (
          <div className="flex items-baseline gap-1.5">
            <dt className="text-[10px] uppercase tracking-widest text-[var(--mid)]">release</dt>
            <dd className="tabular-nums text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--charge)]">
              {release}
            </dd>
          </div>
        ) : null}
        {/* Effects with no leave/settle transition (e.g. scramble-button, MOTION.md
            G4/G5) publish `arrival` instead of `release` — see lib/registry.ts's
            EffectMotion doc comment for why the two fields are not interchangeable. */}
        {arrival ? (
          <div className="flex items-baseline gap-1.5">
            <dt className="text-[10px] uppercase tracking-widest text-[var(--mid)]">arrival</dt>
            <dd className="tabular-nums text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--charge)]">
              {arrival}
            </dd>
          </div>
        ) : null}
        <div className="w-full">
          <dt className="sr-only">curve</dt>
          <dd className="truncate text-[var(--mid)] transition-colors duration-300 group-hover:text-[color-mix(in_oklch,var(--charge)_70%,var(--mid))]">
            {curve}
          </dd>
        </div>
      </dl>
    </article>
  );
}

/**
 * A placeholder for one of the frozen 12 that isn't built yet (docs/SCOPE.md). It mirrors the
 * channel layout so the grid stays aligned, but reads unmistakably as offline: dashed rules,
 * no surface fill, no live preview, no copy controls, and a flat "signal" line across the
 * stage. The gallery can show the complete, finite set without ever faking a working effect.
 */
export function GhostTile({ effect }: { effect: UpcomingEffect }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-dashed border-[var(--rule)]">
      <div className="px-4 pt-4">
        <h3 className="truncate text-sm font-medium text-[var(--mid)]">{effect.title}</h3>
        <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--mid)]">
          {effect.slug}
        </p>
      </div>

      {/* Offline channel — a flat line, not a live effect. */}
      <div className="mx-4 mb-4 mt-3 flex min-h-[136px] flex-1 items-center rounded-lg border border-dashed border-[var(--rule)] px-6">
        <span className="h-px flex-1 bg-[var(--rule)]" />
        <span className="px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--mid)]">
          soon
        </span>
        <span className="h-px flex-1 bg-[var(--rule)]" />
      </div>

      <div className="border-t border-dashed border-[var(--rule)] px-4 pb-3 pt-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--mid)]">
          in progress
        </span>
      </div>
    </div>
  );
}
