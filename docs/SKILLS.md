# Installed skills

HoverUI pins a small, fixed set of external skills. They are chosen once, vendored into
the repo, and not re-selected per effect.

## Precedence — read this before installing anything

**`SCOPE.md`, `docs/MOTION.md`, and `docs/DESIGN.md` outrank every installed skill.**

Where a skill conflicts with them, the repo wins, and the conflict is reported to the
human — never silently resolved. **No skill may authorise adding a dependency.**

This is not hypothetical. `baseline-ui` requires accessible component primitives from
Base UI, React Aria, or Radix for anything with keyboard or focus behaviour. Every
HoverUI effect has focus behaviour, and HoverUI ships zero runtime dependencies. An agent
that treats the skill as authoritative will install Radix and believe it followed
instructions. When that rule fires, the correct response is:

```
CONFLICT: baseline-ui primitives rule vs CLAUDE.md rule 2 (zero dependencies).
Repo wins. Effect ships unstyled-primitive-free with hand-rolled focus handling
per MOTION.md gate 9. No action taken.
```

### Known `baseline-ui` conflicts — settled, do not re-litigate

Recorded here before install, per "Adding a skill later" below. Every row is a rule the
skill states as MUST or NEVER that this repo overrides. A reviewer citing one of these
against an effect is reporting a conflict, not finding a defect.

| `baseline-ui` rule | Overridden by | Ruling |
| --- | --- | --- |
| MUST use Base UI / React Aria / Radix primitives for keyboard or focus behaviour | CLAUDE.md rule 2 | Repo wins — zero runtime dependencies, focus hand-rolled per G9 |
| MUST use `motion/react` for JS animation | CLAUDE.md rule 2 | Repo wins — no dependency; effects are CSS-driven with custom properties |
| MUST use `cn` (`clsx` + `tailwind-merge`) | CLAUDE.md rule 2 | Repo wins — array + `.filter(Boolean).join(" ")` throughout |
| NEVER add animation unless explicitly requested | `SCOPE.md` | Repo wins — animation is the product |
| NEVER exceed 200ms for interaction feedback | `MOTION.md` G3 | Repo wins — bands are 180-260ms enter, 350-450ms release |
| NEVER introduce custom easing curves | `MOTION.md` G2 | Repo wins — three named project curves are mandatory |
| MUST animate only `transform` / `opacity` | `MOTION.md` G12 | Repo wins — G12 also permits `filter` and `clip-path` |
| SHOULD avoid animating `background` / `color` | `MOTION.md` G12 | Repo wins for local UI; several effects animate `border-color` by design |
| NEVER use gradients unless explicitly requested | `SCOPE.md` §5, §10 | Repo wins — radial and conic gradients are the named technique |
| NEVER use glow effects as primary affordances | `SCOPE.md` §3, §5 | Repo wins — the glow *is* the effect in two entries |

What `baseline-ui` is retained for, and where it is authoritative: spacing, hierarchy,
typography, `text-balance` / `text-pretty` / `tabular-nums`, `size-*`, `h-dvh`, fixed
z-index scale, `aria-label` on icon-only buttons, and one accent per view. That is the
review it was pinned to do.

## Pinned

| Skill | Where it runs | Why |
|---|---|---|
| `baseline-ui` | `motion-reviewer`, `/ship-check` — **review only** | Catches spacing, hierarchy, and typography slop in the gallery and landing page. It is a remediation skill, so it belongs on the review side, never in the build step |

## Read once, not installed

| Skill | When |
|---|---|
| `gpt-tasteskill` | Read before finalising `docs/DESIGN.md`, then discard. It pushes toward distinctiveness; the rest of the collection pushes toward correctness, and those are different jobs |

## Deliberately not installed

| Skill | Why not |
|---|---|
| `emil-design-eng` | `docs/MOTION.md` is already derived from it — the three easing curves, transitions over keyframes, respond-fast-settle-slow, reduced-motion-means-gentler. Installing it gives two copies of one opinion in different words, and the agent gets to choose which phrasing to obey |
| `fixing-motion-performance` | Same ground as `MOTION.md`. A second motion authority is how gates get negotiated instead of met |
| `improve-ui` | Audits an existing product surface and writes plans. There is no surface to audit until the gallery ships; revisit for v2 |
| Everything else | Not pinned. Browsing the registry mid-build is scope creep wearing a lab coat |

## Install

Vendor them into the repo — do not fetch at runtime, because the upstream output changes
as that repo changes and an unpinned review is not reproducible.

There is no `add` subcommand. `ui-skills` offers `start`, `categories`, `list` and `get`,
and **`get` writes the skill to stderr, not stdout** — redirecting stdout alone silently
produces an empty file, which is how `baseline-ui` came to be listed as pinned while no
skill file existed. Capture stderr, and check the result in:

```bash
npx ui-skills get baseline-ui 2>&1 >/dev/null > .agents/skills/baseline-ui/SKILL.md
ln -sfn ../../.agents/skills/baseline-ui .claude/skills/baseline-ui
```

`skills-lock.json` is written by the uizze.com tooling and covers only its own four
skills; its `computedHash` scheme is not reproducible here, so `baseline-ui` is pinned by
the vendored file itself being in git — diff it to see upstream drift.

Never fetch the whole registry at once. Twelve effects routed through an open registry produce
twelve locally-reasonable, collectively-incoherent designs, and a library's entire value
is looking like one thing. The registry's own routing skill agrees: prefer one skill, two
at most, three only for broad review.

## Adding a skill later

Requires all three:

1. A named problem the pinned set demonstrably missed
2. A check of its rules against `MOTION.md` and rule 2, with conflicts written into the
   precedence section above *before* installing
3. All 12 effects live in production

Not before.
