import Link from "next/link";

import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { groups } from "@/lib/registry";

/**
 * Every control in the bezel sits on a --chrome pill, which is dark in both themes. That is
 * what lets --brand be the hover colour here: it measures 5.70:1 on the light theme's pill
 * and 5.32:1 on the dark one, where on the pale bench it would be 2.63:1. At rest the pills
 * are achromatic; the brand only arrives under the pointer (docs/DESIGN.md § Thesis).
 *
 * The ring is what makes focus visible — a keyboard has no cursor, so focus stands in for
 * one (docs/MOTION.md G9), and a colour change on its own is not a focus indicator.
 */
const pill = "rounded-full bg-[var(--chrome)] text-[var(--chrome-fg)]";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]";

const navItem = [
  "block rounded-full px-3 py-1.5 text-[13px] text-[var(--chrome-mid)]",
  "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),background-color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
  "hover:bg-white/[0.06] hover:text-[var(--brand)]",
  // G11 — anything pressable acknowledges the press, on its own shorter band.
  "active:[transform:scale(0.94)]",
  "focus-visible:text-[var(--brand)]",
  focusRing,
].join(" ");

/**
 * GitHub's mark, drawn here rather than imported: `lucide-react` is in package.json but is
 * not load-bearing anywhere in the app, and one path is cheaper than making it so.
 */
function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[18px]">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58C20.56 22.29 24 17.79 24 12.5 24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}

/**
 * Three floating groups rather than one bar: the mark on the left, the page's own sections
 * in the middle, and what leaves the page (GitHub, the theme) on the right. Sticky, because
 * the sections it links to are a long scroll apart; the pills carry their own fill, so the
 * header needs no bar behind it and never draws a rule across the page.
 *
 * The inner box is <main>'s — `mx-auto w-full max-w-6xl px-6` — so the logo lands on the
 * gallery's left edge and the theme toggle on its right.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 bg-[linear-gradient(to_bottom,var(--paper)_55%,transparent)] pb-4 pt-3 sm:pt-5">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6">
        <Link
          href="/"
          aria-label="HoverUI — home"
          className={`${pill} inline-flex h-10 shrink-0 items-center px-4 sm:h-11 sm:px-5 [transition:color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)] hover:text-[var(--brand)] active:[transform:scale(0.96)] ${focusRing}`}
        >
          <Logo className="h-[18px] w-auto sm:h-5" />
        </Link>

        {/*
         * The menu is the page's own structure, mapped from lib/registry.ts — the gallery is
         * built from the same `groups` array, so the two cannot drift. Anchors, not routes:
         * SCOPE.md keeps this a single page. Hidden below `md`, where it would crowd the logo.
         */}
        <nav aria-label="Sections" className={`${pill} hidden items-center p-1 md:flex`}>
          <ul className="flex items-center">
            {groups.map((group, i) => (
              <li key={group.id} className="flex items-center">
                {i > 0 ? (
                  <span aria-hidden className="mx-0.5 h-3.5 w-px bg-white/10" />
                ) : null}
                <a href={`#group-${group.id}`} className={navItem}>
                  {group.label}
                </a>
              </li>
            ))}
            <li className="flex items-center">
              <span aria-hidden className="mx-0.5 h-3.5 w-px bg-white/10" />
              <a
                href="/r/magnetic-button.json"
                className={`${navItem} font-mono text-[11px] uppercase tracking-[0.18em]`}
              >
                /r/
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href="https://github.com/raqibnur/hoverui"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="HoverUI on GitHub (opens in a new tab)"
            className={[
              pill,
              "inline-flex h-10 items-center gap-2 px-4 text-[13px] font-medium sm:h-11",
              "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
              "hover:text-[var(--brand)] active:[transform:scale(0.96)] focus-visible:text-[var(--brand)]",
              focusRing,
            ].join(" ")}
          >
            <GitHubMark />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/**
 * Rendered before the bezel so it is the first tab stop on the page. The gallery is the
 * product, so a keyboard user gets one stop to reach it instead of tabbing the hero first.
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
