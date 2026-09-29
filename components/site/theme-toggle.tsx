"use client";

import * as React from "react";

type Theme = "light" | "dark";

const KEY = "hoverui-theme";

/*
 * The class on <html> is the source of truth — app/layout.tsx sets it before first paint —
 * so this reads it back rather than keeping a second copy that could disagree. A tiny
 * external store lets React subscribe to it without an effect-then-setState flash.
 */
const listeners = new Set<() => void>();
const read = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Storage blocked. The switch still works for this visit.
  }
  listeners.forEach((fn) => fn());
}

/**
 * A round control that sits beside the GitHub pill. The glyph is a split disc that turns a
 * half revolution between themes, so the icon says which way the page is about to go rather
 * than swapping one pictogram for another. The turn is on the out-curve inside the enter band
 * and disappears under reduced motion (docs/MOTION.md G10) — the theme still changes.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  // The server cannot know the theme; it renders as light and the client corrects the label
  // and the glyph's angle on hydration. The page itself never flashes — only this icon could.
  const theme = React.useSyncExternalStore<Theme>(subscribe, read, () => "light");
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => apply(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={[
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--chrome)] text-[var(--chrome-fg)] sm:size-11",
        "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
        "hover:text-[var(--brand)] active:[transform:scale(0.94)]",
        "focus-visible:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]",
        className,
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={[
          "size-[18px] motion-safe:[transition:transform_260ms_cubic-bezier(0.23,1,0.32,1)]",
          theme === "dark" ? "rotate-180" : "rotate-0",
        ].join(" ")}
      >
        <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 3.75a8.25 8.25 0 0 1 0 16.5Z" fill="currentColor" />
      </svg>
    </button>
  );
}
