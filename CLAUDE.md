# HoverUI

A registry of hover effects for React + Tailwind, installable with the shadcn CLI.
Live at `hoverui.com`. Install shape: `npx shadcn@latest add https://hoverui.com/r/<slug>.json`

## What this is NOT

Not a component library. There is no Button, no Card, no Input, no Dialog. shadcn/ui
already won that. HoverUI ships **one thing**: the hover effect. Everything in this repo
either is an effect, previews an effect, or serves an effect as JSON.

If a task would add a component whose value is its markup rather than its hover
behaviour, that task is out of scope. See `SCOPE.md`.

## Audience (this decides motion values)

These effects are for landing pages, portfolios, marketing sites, and pricing pages —
surfaces a visitor sees once or twice. They are deliberately *not* for high-frequency app
chrome. That is why a 420ms release curve is correct here and would be wrong in a
dashboard. Say this out loud in the docs; design engineers respect the distinction and
will otherwise assume you don't know it.

## The five hard rules

1. **One effect = one `.tsx` file.** No shared utils, no shared CSS file, no
   `registryDependencies` between HoverUI items. Duplication is cheaper than a
   dependency graph.
2. **Zero runtime dependencies.** React + Tailwind only. No `motion`, no `gsap`,
   no `clsx`. If an effect needs a library, cut the effect.
3. **Tailwind utilities first.** Reach for the registry item's `css` field only when the
   effect genuinely needs `@keyframes`. Most don't.
4. **`target` every file** into `components/hover/` so installs can never overwrite a
   user's `components/ui/button.tsx`.
5. **Quality gates are not optional.** `docs/MOTION.md` is the bar. An effect that fails
   it does not ship, even if it looks good.

## Skill precedence

`SCOPE.md`, `docs/MOTION.md`, and `docs/DESIGN.md` outrank every installed skill. Where a
skill conflicts with them, the repo wins and the conflict is reported, never silently
resolved. **No skill may authorise adding a dependency.** See `docs/SKILLS.md`.

External skills run on the review side only. They are remediation tools — they make bad
UI correct, which is not the same as making correct UI distinctive. Distinctiveness comes
from the Intent lines in `SCOPE.md` and the thesis in `docs/DESIGN.md`.

## Layout

```
registry/hover/<slug>/<slug>.tsx     shipped to users, self-contained
registry/hover/<slug>/preview.tsx    gallery tile only, NEVER in the registry item
lib/registry.ts                      metadata index the gallery maps over
lib/source.ts                        server-only fs read for the code tab
components/gallery/previews.tsx      slug -> Preview component map
registry.json                        catalog; `shadcn build` -> public/r/*.json
app/                                 landing + gallery (single page)
```

**The gallery imports from `registry/hover/*` directly.** Never paste effect code into a
page or an MDX block. Preview and shipped code are the same file on disk, or they drift
and you ship broken snippets by week two. The code tab reads the file with
`lib/source.ts` — it is never hand-maintained.

## Docs in this repo

- `SCOPE.md` — the frozen 12. Read before agreeing to build anything.
- `docs/AUTHORING.md` — how to write an effect, with the reference implementation.
- `docs/MOTION.md` — the motion + a11y quality gate. Non-negotiable.
- `docs/REGISTRY.md` — registry.json, build, serve, deploy, namespace.
- `docs/FIXES.md` — canonical repair for every gate. Read before fixing a finding.
- `docs/SKILLS.md` — which external skills are pinned, and what outranks them.
- `docs/LAUNCH.md` — what ships on launch day and what deliberately doesn't.
- `TASKS.md` — the 10-day plan. Update checkboxes as you go.

## Working agreements

- Timebox every effect to 90 minutes. Not working? Cut it, note it in `SCOPE.md`
  under Cut, pick the next one. Never negotiate the deadline instead of the scope.
- Verify by installing from a **separate throwaway project**, not from this repo.
  `npx shadcn@latest add http://localhost:3000/r/<slug>.json`
- Commit after each effect passes `/ship-check`. One effect per commit.
- Review and repair are separate agents on purpose. `motion-reviewer` is read-only;
  `motion-fixer` only applies rows from a table it was handed. An agent that reviews its
  own repairs stops finding things by the third effect.
- Do not add tooling (Storybook, MDX pipeline, changesets, npm publish, tests beyond a
  build check) before all 12 effects are live in production.
