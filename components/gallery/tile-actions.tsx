"use client";

import * as React from "react";

import { installCommand } from "@/lib/registry";

type Kind = "cmd" | "code";

/**
 * The two copy controls on a gallery tile. They live in the tile header and are always
 * present — discoverable without hovering, reachable by keyboard, identical on touch — so
 * grabbing the install command or the source is never gated behind a hover reveal. Quiet
 * --mid at rest; the icon under the pointer lights --charge, in keeping with the page thesis.
 */
function Glyph({ kind }: { kind: Kind | "done" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-4 w-4",
    "aria-hidden": true,
  };
  if (kind === "done") {
    return (
      <svg {...common}>
        <polyline points="4 12 10 18 20 6" />
      </svg>
    );
  }
  if (kind === "code") {
    return (
      <svg {...common}>
        <polyline points="9 8 5 12 9 16" />
        <polyline points="15 8 19 12 15 16" />
      </svg>
    );
  }
  // cmd — a terminal prompt
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <polyline points="7 9 10 12 7 15" />
      <line x1="12.5" y1="15" x2="16" y2="15" />
    </svg>
  );
}

export function TileActions({ slug, code }: { slug: string; code: string }) {
  const [copied, setCopied] = React.useState<Kind | null>(null);

  const copy = async (kind: Kind, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      // Clipboard blocked (insecure context / denied). No-op; the code tab still has it.
    }
  };

  const btn =
    "rounded-md p-1.5 text-[var(--mid)] transition-colors hover:bg-[color-mix(in_oklch,var(--charge)_8%,transparent)] hover:text-[var(--charge)] focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color-mix(in_oklch,var(--charge)_45%,transparent)]";

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={() => copy("cmd", installCommand(slug))}
        aria-label={copied === "cmd" ? "Install command copied" : `Copy install command for ${slug}`}
        className={btn}
      >
        <Glyph kind={copied === "cmd" ? "done" : "cmd"} />
      </button>
      <button
        type="button"
        onClick={() => copy("code", code)}
        aria-label={copied === "code" ? "Component code copied" : `Copy component code for ${slug}`}
        className={btn}
      >
        <Glyph kind={copied === "code" ? "done" : "code"} />
      </button>
    </div>
  );
}
