"use client";

import * as React from "react";

/**
 * One copy control, used by the tile footer and every panel of the effect sheet. It confirms
 * in place — the glyph becomes a tick and the accessible name says so — rather than raising a
 * toast somewhere else on the screen.
 */
export function CopyButton({
  text,
  label,
  className = "",
  children,
}: {
  text: string;
  /** What is being copied, for the accessible name: "Copy {label}". */
  label: string;
  className?: string;
  /** Optional visible text beside the glyph. */
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (insecure context / denied). The text is on screen to select.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className={[
        "inline-flex shrink-0 items-center justify-center gap-1.5 text-[var(--mid)]",
        "[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),background-color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]",
        "hover:bg-[color-mix(in_oklch,var(--charge)_9%,transparent)] hover:text-[var(--charge)] active:[transform:scale(0.94)]",
        "focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
        className,
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="size-4"
      >
        {copied ? (
          <polyline points="4 12 10 18 20 6" />
        ) : (
          <>
            <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
            <path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5" />
          </>
        )}
      </svg>
      {children ? <span aria-hidden>{copied ? "Copied" : children}</span> : null}
    </button>
  );
}
