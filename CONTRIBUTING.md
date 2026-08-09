# Contributing to HoverUI

Thanks for being here. Read the next section before you write any code — it will save you
an evening.

## The scope is frozen

v1 is **twelve effects**, listed in [`SCOPE.md`](SCOPE.md). Nothing is added to that list
until all twelve are live in production. Previous attempts at this project died by
expanding scope mid-build, and the freeze is the counter-measure.

So, concretely:

- **A thirteenth effect will not be merged right now**, however good it is. Open an
  effect proposal issue instead and it goes in the queue for the weekly cadence after
  launch (`docs/LAUNCH.md`).
- **Fixes to the existing twelve are always welcome** — motion bugs, accessibility gaps,
  a stranded hover state on touch, a `Not this` an effect has drifted into.
- **Anything that adds a dependency is out**, including small ones. See rule 2 below.

If you are unsure which bucket your idea is in, open an issue first. A rejected PR is a
worse outcome for you than a two-line question.

## The five hard rules

These come from [`CLAUDE.md`](CLAUDE.md) and are not negotiable in review:

1. **One effect = one `.tsx` file.** No shared utils, no shared CSS, no
   `registryDependencies` between HoverUI items. Duplication is cheaper than a dependency
   graph when the unit of distribution is a single copy-pasted file.
2. **Zero runtime dependencies.** React and Tailwind only. No `motion`, no `gsap`, no
   `clsx`. If an effect needs a library, the effect gets cut.
3. **Tailwind utilities first.** Use the registry item's `css` field only when the effect
   genuinely needs `@keyframes`.
4. **`target` every file** into `components/hover/`, so an install can never overwrite
   somebody's `components/ui/button.tsx`.
5. **The quality gate is not optional.** [`docs/MOTION.md`](docs/MOTION.md) is the bar. An
   effect that fails it does not ship, even if it looks good.

## Setup

```bash
git clone https://github.com/raqibnur/hoverui.git
cd hoverui
npm ci
npm run dev
```

Node 20.9 or newer; `.nvmrc` has the version CI uses.

## Working on an effect

Read [`docs/AUTHORING.md`](docs/AUTHORING.md) first — it has the reference implementation
and the file layout. Then:

1. Write `registry/hover/<slug>/<slug>.tsx`. This is the file users receive, so it has to
   be self-contained.
2. Write `registry/hover/<slug>/preview.tsx`. Gallery only — it never goes in the registry
   item.
3. Register it in `registry.json`, `lib/registry.ts`, and
   `components/gallery/previews.tsx`.
4. Rebuild the registry: `npm run registry:build`. Commit the generated `public/r/*.json`
   — CI fails if it is stale.

Never paste effect code into a page. The gallery imports from `registry/hover/*` and the
code tab reads the file from disk, so the preview and the shipped code cannot drift.

## Verify it like a user would

From a **separate throwaway project**, never from this repo:

```bash
npx shadcn@latest add http://localhost:3000/r/<slug>.json
```

Then check all four:

1. The file lands at `components/hover/<slug>.tsx`
2. No packages were installed
3. No manual edit to `globals.css` was needed
4. The effect works — including keyboard focus and `prefers-reduced-motion`

## The bar for review

Every PR that touches `registry/hover/` is reviewed against
[`docs/MOTION.md`](docs/MOTION.md). Before you open it, do the three passes that catch
almost everything:

- **Keyboard only.** Tab to it. The effect must be reachable and must not trap focus.
- **Reduced motion.** Turn it on at the OS level. The effect resolves to its end state
  instantly; it does not simply keep animating more slowly.
- **A real phone.** Not the devtools emulator. Tap it, then tap elsewhere. A hover state
  that stays stuck on after the finger leaves is the most common failure here.

[`docs/FIXES.md`](docs/FIXES.md) has the canonical repair for every gate — read it before
inventing your own fix for a finding.

## Commits and PRs

- One effect per commit, one concern per PR.
- Write the commit subject in the imperative: `Fix stranded hover on tilt-card`.
- Fill in the PR checklist honestly. An unchecked box with a sentence explaining why is
  fine; a checked box that is not true costs the reviewer their trust in the whole PR.

There is **no CLA and no DCO**. For single-file effects the paperwork costs more than it
protects. By opening a PR you agree your contribution is licensed under the
[MIT License](LICENSE).

## Reporting a security issue

Do not open a public issue. See [`.github/SECURITY.md`](.github/SECURITY.md).
