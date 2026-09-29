import type { ComponentType } from "react";

import { CopyButton } from "@/components/gallery/copy-button";
import { EffectSheet } from "@/components/gallery/effect-sheet";
import {
  type Effect,
  type GroupDensity,
  type UpcomingEffect,
  installCommand,
  motionSummary,
} from "@/lib/registry";
import { readEffectCss, readEffectSource } from "@/lib/source";

/**
 * Stage height per density. Buttons and links are small objects; the card previews are
 * authored at 400x230 and need the extra room to perform unclipped. Written out, not
 * assembled, because Tailwind only generates class names it can read in the source.
 */
const stageHeight: Record<GroupDensity, string> = {
  compact: "min-h-[240px] sm:min-h-[300px]",
  wide: "min-h-[320px] sm:min-h-[360px]",
};

/**
 * One gallery cell: a bezel holding a recessed stage, with a footer strip beneath it.
 *
 *   1. Stage — where the effect performs, uncovered. Nothing animates over it, so hovering
 *      the tile shows the effect and only the effect. It rests in its finished state, never
 *      a stranded hover on touch.
 *   2. Footer — the name, the motion readout (always legible; the gate is the product's
 *      differentiator), the install command copy (persistent, no hover reveal), and the
 *      arrow that opens the full sheet: preview, source, install, motion.
 *
 * Colour stays off at rest. Under the pointer the bezel's edge and the arrow warm to
 * --charge, and nothing else does (docs/DESIGN.md § Thesis).
 */
export async function GalleryTile({
  effect,
  groupLabel,
  density,
  Preview,
}: {
  effect: Effect;
  groupLabel: string;
  density: GroupDensity;
  Preview?: ComponentType;
}) {
  // Read straight off disk so the copied code is byte-for-byte what installs (lib/source.ts).
  const [code, css] = await Promise.all([
    readEffectSource(effect.slug).catch(() => ""),
    readEffectCss(effect.slug).catch(() => null),
  ]);
  const preview = Preview ? (
    <Preview />
  ) : (
    <span className="font-mono text-xs text-[var(--mid)]">preview missing</span>
  );

  return (
    // The id gives each tile a real fragment target, so a preview that needs a focusable
    // affordance can link somewhere that exists instead of writing a dead fragment.
    <article
      id={effect.slug}
      // On touch the charge anchors to whichever tile is nearest the viewport centre
      // (docs/DESIGN.md § Touch); components/gallery/charge-field.tsx queries this attribute.
      data-charge-anchor=""
      className="group/tile flex scroll-mt-28 flex-col rounded-[22px] border border-[var(--rule)] bg-[var(--surface)] p-1.5 [transition:border-color_300ms_cubic-bezier(0.23,1,0.32,1)] hover:border-[color-mix(in_oklch,var(--charge)_45%,var(--rule))] focus-within:border-[color-mix(in_oklch,var(--charge)_45%,var(--rule))]"
    >
      <div
        className={`flex flex-1 items-center justify-center rounded-2xl border border-[var(--rule)] bg-[var(--paper)] p-6 ${stageHeight[density]}`}
      >
        {preview}
      </div>

      <div className="relative flex items-center gap-3 rounded-b-2xl px-3 pb-2 pt-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-medium text-[var(--ink)]">{effect.title}</h3>
          <p className="mt-0.5 truncate font-mono text-[11px] tabular-nums text-[var(--mid)] [transition:color_300ms_cubic-bezier(0.23,1,0.32,1)] group-hover/tile:text-[var(--charge)]">
            {motionSummary(effect.motion)}
          </p>
        </div>
        <CopyButton
          text={installCommand(effect.slug)}
          label={`install command for ${effect.slug}`}
          className="relative z-10 size-8 rounded-full"
        />
        <EffectSheet
          effect={effect}
          groupLabel={groupLabel}
          code={code}
          css={css}
          preview={preview}
        />
      </div>
    </article>
  );
}

/**
 * A placeholder for one of the frozen 12 that isn't built yet (SCOPE.md). Same bezel so the
 * grid stays aligned, but unmistakably offline: dashed edges, no fill, no live preview, no
 * controls, a flat "signal" line across the stage.
 */
export function GhostTile({
  effect,
  density,
}: {
  effect: UpcomingEffect;
  density: GroupDensity;
}) {
  return (
    <div className="flex flex-col rounded-[22px] border border-dashed border-[var(--rule)] p-1.5">
      <div
        className={`flex flex-1 items-center rounded-2xl border border-dashed border-[var(--rule)] px-8 ${stageHeight[density]}`}
      >
        <span className="h-px flex-1 bg-[var(--rule)]" />
        <span className="px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--mid)]">
          soon
        </span>
        <span className="h-px flex-1 bg-[var(--rule)]" />
      </div>
      <div className="px-3 pb-2 pt-3">
        <h3 className="truncate text-[15px] font-medium text-[var(--mid)]">{effect.title}</h3>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-[var(--mid)]">
          in progress
        </p>
      </div>
    </div>
  );
}
