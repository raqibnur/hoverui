"use client";

import * as React from "react";

import { CopyButton } from "@/components/gallery/copy-button";
import {
  type Effect,
  type PackageManager,
  installCommand,
  installCommandFor,
  installTarget,
  packageManagers,
} from "@/lib/registry";

type Tab = "preview" | "code" | "install" | "motion";

const TABS: { id: Tab; label: string }[] = [
  { id: "preview", label: "Preview" },
  { id: "code", label: "Code" },
  { id: "install", label: "Install" },
  { id: "motion", label: "Motion" },
];

const PM_KEY = "hoverui-pm";

const exportName = (slug: string) =>
  slug.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase());


/** Shared by every segmented control in the sheet: tabs, stage theme, package manager. */
const segment = (active: boolean) =>
  [
    "rounded-full px-3.5 py-1.5 text-[13px] font-medium",
    `[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),background-color_200ms_cubic-bezier(0.23,1,0.32,1),box-shadow_200ms_cubic-bezier(0.23,1,0.32,1)]`,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
    active
      ? "bg-[var(--surface)] text-[var(--ink)] shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_var(--rule)]"
      : "text-[var(--mid)] hover:text-[var(--charge)]",
  ].join(" ");

const panelCard = "rounded-2xl border border-[var(--rule)] bg-[var(--surface)]";

/**
 * The effect in full: preview, source, install and motion spec, in one modal sheet over the
 * gallery. SCOPE.md keeps the site to a single page, so this is the page an effect would
 * otherwise get — reachable from its tile, dismissed with Esc or a click outside, and the
 * focus goes back to the tile it came from.
 *
 * A native <dialog> opened with showModal(): the browser supplies the focus trap, the inert
 * page behind it, Esc, and the top layer, so none of that is hand-rolled and nothing is
 * installed (CLAUDE.md rule 2). Its contents mount only while it is open, so twelve closed
 * sheets cost twelve empty elements, not twelve extra copies of every preview.
 */
export function EffectSheet({
  effect,
  groupLabel,
  code,
  css,
  preview,
}: {
  effect: Effect;
  groupLabel: string;
  code: string;
  css: string | null;
  preview: React.ReactNode;
}) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const el = dialog.current;
    if (open && el && !el.open) el.showModal();
  }, [open]);

  return (
    <>
      {/*
       * Stretched over the tile footer with an ::after, so the whole strip — title, readout
       * and arrow — is one target, while the copy button beside it sits above the stretch
       * (z-10) and stays its own control.
       */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Open ${effect.title}: preview, code and install`}
        className={[
          "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--mid)]",
          "after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
          `[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),background-color_200ms_cubic-bezier(0.23,1,0.32,1),transform_200ms_cubic-bezier(0.23,1,0.32,1)]`,
          "group-hover/tile:text-[var(--charge)] group-hover/tile:[transform:translate(2px,-2px)]",
          "focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
        ].join(" ")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="size-[18px]"
        >
          <path d="M7 17 17 7M8.5 7H17v8.5" />
        </svg>
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={`sheet-${effect.slug}-title`}
        onClose={() => setOpen(false)}
        // Clicks on the ::backdrop are dispatched to the dialog itself; the inner wrapper
        // fills the box, so the dialog is only ever the target when the click was outside.
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="effect-sheet m-auto h-fit max-h-[calc(100dvh-1.5rem)] w-[min(72rem,calc(100%-1.5rem))] max-w-none overflow-hidden rounded-[28px] border border-[var(--rule)] bg-[var(--paper)] p-0 text-[var(--ink)] shadow-[0_24px_80px_-20px_rgb(0_0_0/0.35)]"
      >
        {open ? (
          <SheetBody
            effect={effect}
            groupLabel={groupLabel}
            code={code}
            css={css}
            preview={preview}
            onClose={() => dialog.current?.close()}
          />
        ) : null}
      </dialog>
    </>
  );
}

function SheetBody({
  effect,
  groupLabel,
  code,
  css,
  preview,
  onClose,
}: {
  effect: Effect;
  groupLabel: string;
  code: string;
  css: string | null;
  preview: React.ReactNode;
  onClose: () => void;
}) {
  const [tab, setTab] = React.useState<Tab>("preview");
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const id = (t: Tab) => `sheet-${effect.slug}-${t}`;

  // Roving focus across the tablist (WAI-ARIA tabs pattern, automatic activation).
  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    const last = TABS.length - 1;
    const to =
      e.key === "ArrowRight"
        ? index === last ? 0 : index + 1
        : e.key === "ArrowLeft"
          ? index === 0 ? last : index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (to === null) return;
    e.preventDefault();
    setTab(TABS[to].id);
    tabRefs.current[to]?.focus();
  };

  return (
    <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain">
      <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-7">
        {/* Top bar: where you are, and the way out. */}
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--chrome)] px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--chrome-fg)]">
            <span aria-hidden className="size-1.5 rounded-full bg-[var(--brand)]" />
            {groupLabel}
          </span>
          <div className="flex items-center gap-3">
            <p className="hidden text-xs text-[var(--mid)] sm:block">
              {groupLabel} <span aria-hidden>/</span>{" "}
              <span className="text-[var(--ink)]">{effect.title}</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={[
                "inline-flex size-9 items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--surface)] text-[var(--mid)]",
                `[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]`,
                "hover:text-[var(--charge)] active:[transform:scale(0.94)]",
                "focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
              ].join(" ")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden className="size-4">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Identity, and the one command most visitors came for. */}
        <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h2
              id={`sheet-${effect.slug}-title`}
              className="font-display text-[clamp(1.9rem,4.5vw,2.75rem)] font-semibold leading-none tracking-[-0.04em]"
            >
              {effect.title}
            </h2>
            <p className="mt-3 text-pretty text-[15px] leading-relaxed text-[var(--mid)]">
              {effect.description}
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-2 lg:max-w-[26rem]">
            <code className="min-w-0 flex-1 truncate rounded-full border border-[var(--rule)] bg-[var(--surface)] px-4 py-2.5 font-mono text-xs text-[var(--ink)]">
              <span aria-hidden className="text-[var(--mid)]">&gt;_ </span>
              {installCommand(effect.slug)}
            </code>
            <CopyButton
              text={installCommand(effect.slug)}
              label="install command"
              className="size-10 rounded-full border border-[var(--rule)] bg-[var(--surface)]"
            />
          </div>
        </div>

        <div
          role="tablist"
          aria-label={`${effect.title} details`}
          className="mt-7 inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-[var(--rule)] bg-[color-mix(in_srgb,var(--rule)_40%,var(--paper))] p-1"
        >
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id(t.id)}-tab`}
              aria-selected={tab === t.id}
              aria-controls={id(t.id)}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={segment(tab === t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={id(tab)}
          aria-labelledby={`${id(tab)}-tab`}
          tabIndex={-1}
          className="mt-4 focus-visible:outline-none"
        >
          {tab === "preview" ? <PreviewPanel slug={effect.slug} preview={preview} /> : null}
          {tab === "code" ? <CodePanel slug={effect.slug} code={code} /> : null}
          {tab === "install" ? <InstallPanel slug={effect.slug} css={css} /> : null}
          {tab === "motion" ? <MotionPanel effect={effect} /> : null}
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({ slug, preview }: { slug: string; preview: React.ReactNode }) {
  // The stage can be flipped independently of the page, so an effect can be judged on the
  // background it will actually ship on. It works by scoping the theme class: `.dark` and
  // `.light` both redefine the HoverUI tokens for everything inside them (app/globals.css).
  const [stage, setStage] = React.useState<"light" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  // Remounting is the honest reset: it returns the effect to its authored resting state
  // without the preview having to expose one.
  const [run, setRun] = React.useState(0);

  return (
    <div className={`${panelCard} p-2 sm:p-3`}>
      <div className="flex items-center justify-between gap-3 px-2 pb-2 pt-1 sm:pb-3">
        <p className="text-sm font-medium">Live stage</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRun((n) => n + 1)}
            aria-label="Reset the preview"
            title="Reset"
            className={[
              "inline-flex size-8 items-center justify-center rounded-full border border-[var(--rule)] text-[var(--mid)]",
              `[transition:color_200ms_cubic-bezier(0.23,1,0.32,1),transform_140ms_cubic-bezier(0.23,1,0.32,1)]`,
              "hover:text-[var(--charge)] active:[transform:scale(0.94)]",
              "focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]",
            ].join(" ")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="size-4">
              <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1M3.5 4v4.5H8" />
            </svg>
          </button>
          <div
            role="radiogroup"
            aria-label="Stage background"
            className="inline-flex rounded-full border border-[var(--rule)] bg-[var(--paper)] p-0.5"
          >
            {(["dark", "light"] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={stage === s}
                onClick={() => setStage(s)}
                className={`${segment(stage === s)} px-3 py-1 text-xs capitalize`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div
        key={run}
        className={`${stage} flex min-h-[340px] items-center justify-center rounded-xl border border-[var(--rule)] bg-[var(--paper)] p-8 text-[var(--ink)] sm:min-h-[440px]`}
      >
        {preview}
      </div>
      <p className="px-2 pb-1 pt-3 text-xs leading-relaxed text-[var(--mid)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden className="mr-2 inline-block size-3.5 -translate-y-px align-middle">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
        </svg>
        Hover it, then tab to it — every effect answers the keyboard too. Lands in{" "}
        <code className="break-all font-mono text-[var(--ink)]">{installTarget(slug)}</code>.
      </p>
    </div>
  );
}

function CodePanel({ slug, code }: { slug: string; code: string }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div className={`${panelCard} overflow-hidden`}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--rule)] px-4 py-2.5">
        <p className="min-w-0 truncate font-mono text-xs">
          <span className="text-[var(--mid)]">components/hover/</span>
          {slug}.tsx
          <span className="ml-3 text-[var(--mid)]">{lines.length} lines</span>
        </p>
        <CopyButton text={code} label="component code" className="rounded-full px-3 py-1.5 text-xs">
          Copy
        </CopyButton>
      </div>
      {/*
       * The file as it installs, read off disk at build time (lib/source.ts) — never pasted,
       * never highlighted by a dependency. The gutter is its own column so selecting the code
       * does not select the line numbers.
       */}
      <div className="max-h-[60vh] overflow-auto bg-[var(--paper)]" tabIndex={0} aria-label={`${slug}.tsx source`}>
        <pre className="flex min-w-max py-4 font-mono text-[12.5px] leading-[1.7]">
          <span aria-hidden className="sticky left-0 select-none bg-[var(--paper)] pl-4 pr-4 text-right text-[var(--mid)] opacity-70">
            {lines.map((_, i) => (
              <span key={i} className="block tabular-nums">
                {i + 1}
              </span>
            ))}
          </span>
          <code className="pr-6 text-[var(--ink)]">{code}</code>
        </pre>
      </div>
    </div>
  );
}

function InstallPanel({ slug, css }: { slug: string; css: string | null }) {
  const [pm, setPm] = React.useState<PackageManager>(() => {
    try {
      const saved = localStorage.getItem(PM_KEY) as PackageManager | null;
      if (saved && packageManagers.includes(saved)) return saved;
    } catch {}
    return "npm";
  });
  const choose = (next: PackageManager) => {
    setPm(next);
    try {
      localStorage.setItem(PM_KEY, next);
    } catch {}
  };
  const command = installCommandFor(pm, slug);
  const name = exportName(slug);
  const usage = `import { ${name} } from "@/components/hover/${slug}";`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className={`${panelCard} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">Add it with the shadcn CLI</p>
          <div
            role="radiogroup"
            aria-label="Package manager"
            className="inline-flex rounded-full border border-[var(--rule)] bg-[var(--paper)] p-0.5"
          >
            {packageManagers.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={pm === p}
                onClick={() => choose(p)}
                className={`${segment(pm === p)} px-3 py-1 font-mono text-xs`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--rule)] bg-[var(--paper)] py-2 pl-4 pr-2">
          <code className="min-w-0 flex-1 break-all py-1.5 font-mono text-[13px] leading-relaxed">
            <span aria-hidden className="text-[var(--mid)]">$ </span>
            {command}
          </code>
          <CopyButton text={command} label="install command" className="size-9 rounded-lg" />
        </div>

        <ol className="mt-6 space-y-4 text-sm">
          <Step n={1} title="Run the command">
            The file lands in{" "}
            <code className="font-mono text-[var(--ink)]">{installTarget(slug)}</code> — its own
            folder, so it can never overwrite anything in{" "}
            <code className="font-mono">components/ui</code>.
          </Step>
          <Step n={2} title="Import it">
            <span className="mt-2 flex items-start gap-2 rounded-xl border border-[var(--rule)] bg-[var(--paper)] py-1.5 pl-3 pr-1.5">
              <code className="min-w-0 flex-1 break-all py-1 font-mono text-xs text-[var(--ink)]">{usage}</code>
              <CopyButton text={usage} label="import line" className="size-7 rounded-md" />
            </span>
          </Step>
          <Step n={3} title="Make it yours">
            It is one self-contained file. Change the markup, the colours, the copy — the
            motion values are commented where they are set.
          </Step>
        </ol>
      </div>

      <div className="flex flex-col gap-4">
        <dl className={`${panelCard} divide-y divide-[var(--rule)] text-sm`}>
          <Fact term="Dependencies">None — React and Tailwind only</Fact>
          <Fact term="Files">1</Fact>
          <Fact term="Keyframes">{css ? "Added to your CSS by the CLI" : "None"}</Fact>
          <Fact term="Registry">
            <a
              href={`/r/${slug}.json`}
              className="rounded-sm font-mono text-xs underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--charge)] hover:decoration-current focus-visible:text-[var(--charge)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--charge)]"
            >
              /r/{slug}.json
            </a>
          </Fact>
        </dl>

        <div className={`${panelCard} p-4 text-sm`}>
          <p className="font-medium">Prefer to paste?</p>
          <p className="mt-1.5 leading-relaxed text-[var(--mid)]">
            The Code tab is the exact file the CLI installs. Save it as{" "}
            <code className="font-mono text-[var(--ink)]">{installTarget(slug)}</code>
            {css ? " and add these keyframes to your global CSS:" : "."}
          </p>
          {css ? (
            <div className="relative mt-3 rounded-xl border border-[var(--rule)] bg-[var(--paper)]">
              <CopyButton text={css} label="keyframes" className="absolute right-1.5 top-1.5 size-7 rounded-md" />
              <pre className="max-h-48 overflow-auto p-3 pr-10 font-mono text-[11.5px] leading-relaxed text-[var(--ink)]">
                {css}
              </pre>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MotionPanel({ effect }: { effect: Effect }) {
  const { track, stagger, lead, arrival, release, curve } = effect.motion;
  const rows: [string, string | undefined, string][] = [
    ["track", track, "How long it takes to follow the cursor while you move"],
    ["stagger", stagger, "The gap between one element and the next"],
    ["lead", lead, "How far one channel runs ahead of the other"],
    ["arrival", arrival, "Time to the fully arrived state"],
    ["release", release, "The motion a leave or blur actually triggers"],
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <dl className={`${panelCard} divide-y divide-[var(--rule)]`}>
        {rows
          .filter(([, value]) => value)
          .map(([term, value, note]) => (
            <div key={term} className="flex items-baseline justify-between gap-4 px-4 py-4 sm:px-5">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-widest text-[var(--mid)]">{term}</dt>
                <p className="mt-1 text-xs text-[var(--mid)]">{note}</p>
              </div>
              <dd className="font-display text-3xl font-semibold tabular-nums tracking-[-0.03em]">{value}</dd>
            </div>
          ))}
        <div className="px-4 py-4 sm:px-5">
          <dt className="font-mono text-[11px] uppercase tracking-widest text-[var(--mid)]">curve</dt>
          <dd className="mt-2 break-all font-mono text-sm">{curve}</dd>
        </div>
      </dl>
      <div className={`${panelCard} p-4 text-sm leading-relaxed text-[var(--mid)] sm:p-5`}>
        <p className="font-medium text-[var(--ink)]">Why these numbers</p>
        <p className="mt-2">
          Every effect here passes the same motion and accessibility gate before it ships:
          three named curves and nothing else, durations inside fixed enter and release
          bands, a keyboard path, and a reduced-motion path that keeps the information and
          drops the travel.
        </p>
        <p className="mt-3">
          The long release is deliberate. These are for landing pages, portfolios and pricing
          pages — surfaces a visitor sees once or twice. In a dashboard you would click a
          hundred times a day, halve it.
        </p>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className="mt-px inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--chrome)] font-mono text-[11px] text-[var(--chrome-fg)]"
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <div className="mt-1 leading-relaxed text-[var(--mid)]">{children}</div>
      </div>
    </li>
  );
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-[var(--mid)]">{term}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
