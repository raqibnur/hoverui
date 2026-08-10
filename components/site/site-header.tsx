import Link from "next/link";

import { groups } from "@/lib/registry";

/**
 * One shape for every control in the bezel: a pill that is invisible at rest and only takes
 * a tint under the pointer, so the nav stays achromatic until you reach for it (the page
 * thesis, docs/DESIGN.md). The ring is what makes focus visible — a keyboard has no cursor,
 * so focus stands in for one (docs/MOTION.md G9), and a colour change on its own is not a
 * focus indicator. Offset against --surface, not --paper: the capsule is what sits behind it.
 */
const navItem = [
  "relative rounded-full text-[var(--mid)]",
  "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),background-color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
  "hover:bg-[color-mix(in_oklch,var(--charge)_9%,transparent)] hover:text-[var(--charge)]",
  // G11 — anything pressable acknowledges the press, on its own shorter band.
  "active:[transform:scale(0.94)]",
  "focus-visible:text-[var(--charge)] focus-visible:outline-none",
  "focus-visible:ring-2 focus-visible:ring-[var(--charge)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
].join(" ");

/**
 * GitHub's mark, drawn here rather than imported. `lucide-react` is in package.json but is
 * not used anywhere in the app, and components/gallery/tile-actions.tsx already hand-rolls
 * its glyphs — one path is cheaper than making that dependency load-bearing.
 */
function GitHubMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="h-[17px] w-[17px] sm:h-[18px] sm:w-[18px]"
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58C20.56 22.29 24 17.79 24 12.5 24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}

/**
 * The bezel. A panel floating above the bench rather than a bar ruled off from it — the
 * header this replaced drew a full-bleed hairline that cut the page in two before the visitor
 * had read a word. It carries no border or shadow of its own; the step from --surface to
 * --paper is the only thing separating it, which is why the fill is translucent rather
 * than flat.
 *
 * The inner box is the same as <main>'s — `mx-auto w-full max-w-6xl px-6`, character for
 * character. That is what makes the bezel exactly the page's width and lands its contents on
 * the page's own edges: the logo starts where the H1 starts, the GitHub button ends where the
 * gallery grid ends. Horizontal padding on <header> itself would shift this box relative to
 * main's and put every one of those edges out by a few pixels.
 */
export function SiteHeader() {
  return (
    <header className="pt-3 sm:pt-4">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-[color-mix(in_oklch,var(--surface)_86%,transparent)] px-2 sm:px-3 py-2 sm:py-2.5">
        <Link
          href="/"
          aria-label="HoverUI — home"
          // The negative margin cancels the padding, so the larger hit area costs no layout
          // and the artwork still lands exactly on the bezel's padding edge.
          className={`${navItem} -m-1.5 shrink-0 p-1.5`}
        >
          {/*
           * Plain <img>, not next/image: the asset is an SVG, which the image optimiser
           * passes through untouched, so Image would add a wrapper and a config flag and buy
           * nothing. Width and height are the file's own, so the box is reserved before it
           * loads and the bezel never reflows.
           */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hover-ui-logo.svg"
            alt="HoverUI"
            width={139}
            height={38}
            className="h-5 w-auto sm:h-[30px]"
          />
        </Link>

        <nav aria-label="Sections" className="flex items-center gap-0.5 sm:gap-1">
          {/*
           * The menu is the page's own structure, mapped from lib/registry.ts rather than
           * typed out here — the gallery is built from the same `groups` array, so a new group
           * cannot appear in one and go missing from the other, and the labels can never drift
           * apart. Anchors, not routes: SCOPE.md keeps this a single page.
           *
           * Hidden below `md`, where three labels plus a button would wrap the bezel onto two
           * lines. Nothing is lost — the sections they point at are the next thing on screen
           * once you scroll.
           */}
          <ul className="hidden items-center gap-0.5 md:flex">
            {groups.map((group) => (
              <li key={group.id}>
                <a
                  href={`#group-${group.id}`}
                  className={`${navItem} block px-3 py-1.5 text-[13px]`}
                >
                  {group.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Instrument-panel detail: the divider separates what is part of this page from
              what leaves it. */}
          <span
            aria-hidden
            className="mx-1 hidden h-4 w-px shrink-0 bg-[var(--rule)] md:block"
          />

          <a
            href="/r/magnetic-button.json"
            className={`${navItem} hidden px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] sm:block`}
          >
            /r/
          </a>

          {/*
           * The one solid control on the page, and the only place the brand colour appears at
           * full strength. Ink at rest keeps the bezel achromatic; under the pointer the fill
           * becomes --brand and the label flips to --ink, which is the pairing that measures
           * 5.70:1. Keeping the label --paper on that fill would drop it to 2.63:1, so the
           * text colour has to move with the background rather than stay put.
           *
           * This is the page thesis stated at button scale: the brand is a function of the
           * cursor, like every other colour here.
           */}
          <a
            href="https://github.com/raqibnur/hoverui"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="HoverUI on GitHub (opens in a new tab)"
            className={[
              "ml-1 inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--ink)] px-3 py-2 text-[13px] font-medium text-[var(--paper)] sm:px-3.5",
              // One shorthand naming all three properties. Two `transition` declarations on
              // the same element do not merge — the later one resets the earlier entirely
              // (G16), so the fill and the label have to travel in the same list or one of
              // them snaps while the other eases.
              "[transition:background-color_200ms_cubic-bezier(0.23,1,0.32,1),color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
              "hover:bg-[var(--brand)] hover:text-[var(--ink)]",
              "active:[transform:scale(0.96)]",
              "focus-visible:bg-[var(--brand)] focus-visible:text-[var(--ink)] focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-[var(--charge)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]",
            ].join(" ")}
          >
            <GitHubMark />
            <span>GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

/**
 * Rendered before the bezel so it is the first tab stop on the page. The gallery is the
 * product and the hero is a full screen ahead of it, so a keyboard user gets one stop to
 * reach the thing they came for instead of tabbing the whole hero first.
 */
export function SkipLink() {
  return (
    <a
      href="#gallery"
      className="sr-only rounded-full font-mono text-xs uppercase tracking-widest text-[var(--charge)] focus:not-sr-only focus:absolute focus:left-6 focus:top-4 focus:z-40 focus:border focus:border-[var(--charge)] focus:bg-[var(--surface)] focus:px-4 focus:py-2"
    >
      Skip to the gallery
    </a>
  );
}
