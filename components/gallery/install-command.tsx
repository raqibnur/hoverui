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
      // w-full so the button cannot size itself to the length of the command. Its own
      // wrapper is a hardcoded `inline-flex`, which is content-sized, so without a definite
      // width here the whole page inherits the command's width as its scroll width.
      className="group/cmd flex w-full items-center gap-3 rounded-2xl border border-[var(--rule)] bg-[var(--surface)] py-2 pl-4 pr-2 text-left font-mono text-xs text-[var(--ink)] sm:text-[13px]"
    >
      {/* self-start so the prompt sits on the command's first line the way a terminal shows
          it, rather than centring itself against a wrapped two-line block. */}
      <span aria-hidden className="shrink-0 self-start py-1.5 text-[var(--mid)]">
        &gt;_
      </span>
      {/*
       * Wraps rather than truncates. This command is the one thing the page asks a visitor to
       * paste into a terminal, and an ellipsis through the middle of it hides the registry
       * host — the part a careful reader checks first. It breaks at the spaces already in the
       * string, so it becomes two tidy lines on a phone and stays on one everywhere else.
       *
       * min-w-0 because a flex item defaults to `min-width: auto` and refuses to shrink below
       * its content, which defeats wrapping and truncation alike inside a flex row.
       */}
      <code className="min-w-0 break-words py-1.5">
        npx shadcn@latest add hoverui.com/r/{slug}.json
      </code>
      <span
        aria-hidden
        className="ml-auto shrink-0 self-start rounded-xl bg-[var(--chrome)] px-3 py-1.5 text-[11px] uppercase tracking-widest text-[var(--chrome-fg)] [transition:color_200ms_cubic-bezier(0.23,1,0.32,1)] group-hover/cmd:text-[var(--brand)]"
      >
        {copied ? "copied" : "copy"}
      </span>
    </MagneticButton>
  );
}
