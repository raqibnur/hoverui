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

Vendor them into the repo — do not fetch at runtime. `get` prints to stdout and the
output changes as the upstream repo changes; `add` writes a file you can diff and pin.

```bash
npx ui-skills add baseline-ui
```

Never `npx ui-skills add --all`. Twelve effects routed through an open registry produce
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
