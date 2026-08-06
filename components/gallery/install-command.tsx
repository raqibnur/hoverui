"use client";

import * as React from "react";

import { MagneticButton } from "@/registry/hover/magnetic-button/magnetic-button";
import { installCommand } from "@/lib/registry";

/**
 * The hero install line. It is not decoration: the button is the shipped `magnetic-button`
 * and clicking it copies the real command, so a visitor triggers the product by accident
 * while reading (docs/DESIGN.md § The hero contains no decorative filler).
 */
export function InstallCommand({ slug }: { slug: string }) {
  const command = installCommand(slug);
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (insecure context / denied). The command is on screen to read.
    }
  };

  return (
    <MagneticButton
      onClick={copy}
      aria-label={copied ? "Copied install command" : `Copy: ${command}`}
      className="group flex items-center gap-3 rounded-lg border border-[var(--rule)] bg-[var(--surface)] px-4 py-3 text-left font-mono text-sm text-[var(--ink)]"
    >
      <span aria-hidden className="text-[var(--mid)]">
        $
      </span>
      <code className="truncate">
        npx shadcn@latest add hoverui.com/r/{slug}.json
      </code>
      <span
        aria-hidden
        className="ml-2 shrink-0 border-l border-[var(--rule)] pl-3 text-xs uppercase tracking-widest text-[var(--mid)] transition-colors group-hover:text-[var(--charge)]"
      >
        {copied ? "copied" : "copy"}
      </span>
    </MagneticButton>
  );
}
