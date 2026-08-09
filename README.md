<div align="center">

# HoverUI

**Hover effects for React and Tailwind. Copy, paste, no dependencies.**

[![CI](https://github.com/raqibnur/hoverui/actions/workflows/ci.yml/badge.svg)](https://github.com/raqibnur/hoverui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Effects](https://img.shields.io/badge/effects-12-black)
![Runtime deps](https://img.shields.io/badge/runtime%20deps-0-black)

[Effects](#the-twelve) · [Accessibility](#accessibility) · [Shipping an effect](#shipping-an-effect) · [Roadmap](#roadmap) · [Contributing](CONTRIBUTING.md)

</div>

<!--
  DEMO GOES HERE. docs/LAUNCH.md: a 30-second screen recording, 60fps, cursor visible,
  one effect per ~2.5s, ending on the install command. It is the single highest-value
  thing that can be added to this file, and it is blocked only on recording it.
-->

```bash
npx shadcn@latest add https://hoverui.com/r/magnetic-button.json
```

One file lands in `components/hover/`. Nothing is installed, nothing is added to your
`globals.css`, and there is no package to keep up to date. The code is yours from that
moment on.

> [!IMPORTANT]
> **Pre-launch.** All twelve effects are built and reviewed against the gate, but `hoverui.com` still
> serves a waitlist page — `/r/*.json` is not deployed yet, so the command above 404s
> today. Until it ships, run the registry locally (see [Contributing](#contributing)) and
> install from `http://localhost:3000/r/<slug>.json`. Progress is in [Roadmap](#roadmap).

---

## What this is for

Landing pages, portfolios, marketing sites, pricing pages — surfaces a visitor arrives at
once and should remember.

Deliberately **not** built for high-frequency app chrome. In a dashboard, the right amount
of hover animation is usually none, and the 420ms release curves in here would be wrong.
That distinction is why the motion values are what they are.

It is also **not a component library**. There is no Button, no Card, no Dialog —
shadcn/ui already won that. HoverUI ships one thing: the hover effect.

## The twelve

Install any of them by swapping the slug:

```bash
npx shadcn@latest add https://hoverui.com/r/<slug>.json
```

#### Buttons

| Slug | What it does |
|---|---|
| [`magnetic-button`](registry/hover/magnetic-button) | Faintly attracted to the cursor. The overshoot on release is where the personality lives. |
| [`liquid-fill-button`](registry/hover/liquid-fill-button) | Colour floods in from the exact edge the cursor crossed. |
| [`border-trace-button`](registry/hover/border-trace-button) | A point of light runs one lap of the border and settles into a low glow. |
| [`scramble-button`](registry/hover/scramble-button) | The label decodes left to right, so the eye can follow a wavefront across the word. |

#### Cards

| Slug | What it does |
|---|---|
| [`spotlight-card`](registry/hover/spotlight-card) | A soft light under the surface trails the cursor, lifting the border as it passes. |
| [`tilt-card`](registry/hover/tilt-card) | Capped at 8°, with a specular sheen that moves *opposite* the tilt. |
| [`reveal-card`](registry/hover/reveal-card) | The image recedes so the caption can rise into the space it vacated. |
| [`chase-border-card`](registry/hover/chase-border-card) | A gradient border that rotates only while hovered and eases to a stop on leave. |

#### Text and links

| Slug | What it does |
|---|---|
| [`stagger-text`](registry/hover/stagger-text) | Letters lift in a 35ms wavefront, legible at every frame. |
| [`draw-underline`](registry/hover/draw-underline) | Draws from the side you entered, retracts toward the side you left. |
| [`blur-swap-link`](registry/hover/blur-swap-link) | A camera rack focus between two labels, not a crossfade. |
| [`slide-marquee-link`](registry/hover/slide-marquee-link) | One continuous strip moving past a window, pixel-exact. |

Every entry in [`SCOPE.md`](SCOPE.md) carries an **Intent** and a **Not this** — what the
effect is, and the median version of it that was deliberately avoided. That file is the
specification these are held to, and matching it is a review gate in its own right (G15).

## The curves

Published on purpose. Built-in CSS easings are too weak and read as unintentional, so
every effect draws from three:

| Token | Curve | Used for |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entering, responding to the cursor |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Moving or morphing on screen |
| `--ease-spring` | `cubic-bezier(0.34, 1.40, 0.64, 1)` | Releasing, with slight overshoot |

Response is fast and the settle is slow — 100-140ms to track the cursor, 350-450ms to
return to rest. Symmetric timing is what makes an effect read as a CSS default.

## Accessibility

Not a footnote here. It is most of [`docs/MOTION.md`](docs/MOTION.md), and it is the
reason to pick this over the fiftieth "awesome hover effects" collection.

| Gate | What it guarantees |
|---|---|
| **G7** | Pointer work is gated on `(hover: hover) and (pointer: fine)`, so tapping on a phone never strands an effect mid-state |
| **G8** | Every effect has a decided touch resting state that looks finished on its own — not "hover doesn't work on mobile" |
| **G9** | Keyboard parity. No cursor means you get the effect's *arrival* state: the fill completes, the underline draws, the card lifts without tilt |
| **G10** | Reduced motion is gentler, not absent. Transforms go, colour and opacity stay, and effects whose meaning *is* the motion jump to their final state |

If you find one that misses this, that is a bug and it is the highest-priority kind.

## Shipping an effect

The repeatable pipeline, from idea to live. Full detail in
[`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/AUTHORING.md`](docs/AUTHORING.md).

> **The scope is frozen.** These twelve are v1, and a thirteenth effect is not merged
> until all twelve are live. File an [effect proposal](.github/ISSUE_TEMPLATE/effect_request.yml)
> instead and it joins the post-launch queue.

**1. Specify it before building it**
- [ ] Write the **Intent** — which of the thousand effects this slug could mean, and the moment that sells it (usually the release, not the trigger)
- [ ] Write the **Not this** — the median version an implementer would produce from the slug alone
- [ ] Confirm it needs no runtime dependency and fits in one `.tsx` file

**2. Build it — 90 minutes, timeboxed**
- [ ] `registry/hover/<slug>/<slug>.tsx` — self-contained; this is the file users receive
- [ ] `registry/hover/<slug>/preview.tsx` — gallery only, never in the registry item
- [ ] Not working at 90 minutes? Cut it, log it under **Cut** in `SCOPE.md`, move on

**3. Wire it up**
- [ ] Add the item to `registry.json`, `target`ing `components/hover/<slug>.tsx`
- [ ] Add metadata to `lib/registry.ts`, including the motion signature the tile renders
- [ ] Map the slug to its preview in `components/gallery/previews.tsx`
- [ ] `npm run registry:build`, and commit the generated `public/r/` — CI fails if it is stale

**4. Pass the gate — all sixteen**
- [ ] Run `/ship-check`, or hand it to the `motion-reviewer` agent
- [ ] Repair findings with [`docs/FIXES.md`](docs/FIXES.md), citing gates by their `G` number
- [ ] Never let the agent that reviewed it also repair it

<details>
<summary><strong>The sixteen gates at a glance</strong> — full text in <a href="docs/MOTION.md"><code>docs/MOTION.md</code></a></summary>

| | Gate |
|---|---|
| **G1** | `transition` names its properties — `transition: all` is a bug |
| **G2** | Easing comes from the three project curves; never `ease-in` |
| **G3** | Duration sits inside its band |
| **G4** | Response is fast, settle is slow |
| **G5** | Transitions, not keyframes, for anything cursor-driven |
| **G6** | Nothing appears from nothing — `scale(0.96)`, never `scale(0)` |
| **G7** | Pointer work is gated on capability |
| **G8** | A documented touch resting state |
| **G9** | Keyboard parity |
| **G10** | Reduced motion means gentler, not absent |
| **G11** | `:active` responds |
| **G12** | Compositor-only properties |
| **G13** | No permanent `will-change` |
| **G14** | No React state per pointer event |
| **G15** | The effect matches its Intent |
| **G16** | Variant conflicts resolved by specificity, not order |

</details>

**5. Verify it the way a user will**
- [ ] Install from a **separate throwaway project**: `npx shadcn@latest add http://localhost:3000/r/<slug>.json`
- [ ] The file lands in `components/hover/`, no packages installed, no `globals.css` edit
- [ ] **A real phone over local IP** — not the devtools emulator. Tap it, tap away, nothing stranded
- [ ] Keyboard-only pass, and a reduced-motion pass

**6. Ship it**
- [ ] One effect per commit
- [ ] `npm run lint` and `npm run build` green
- [ ] Deploy, then confirm the live `https://hoverui.com/r/<slug>.json` installs clean
- [ ] Post the clip — the cadence in [`docs/LAUNCH.md`](docs/LAUNCH.md) *is* the growth strategy

## Roadmap

### v1 — the frozen twelve

| | Milestone |
|---|---|
| ✅ | Registry, gallery, and all twelve effects built |
| ✅ | Motion + accessibility gate (G1-G16) defined and applied |
| ✅ | Open source: license, contribution path, CI, registry drift check |
| ⬜ | **Two lint errors on `main`** — `react-hooks/set-state-in-effect` in `liquid-fill-button` and `magnetic-button`. CI is red until these are fixed |
| ⬜ | Deploy the registry to `hoverui.com` — it currently serves a waitlist page |
| ⬜ | OG image, favicon, meta |
| ⬜ | The 30-second demo video |
| ⬜ | Launch (`docs/LAUNCH.md`) |
| ⬜ | PR to `awesome-shadcn-ui`, and to the shadcn registry directory for the `@hoverui` namespace |

Day-by-day detail lives in [`TASKS.md`](TASKS.md).

**Definition of done:** twelve effects live, each installable from a clean project in one
command, and one stranger has installed it. Stars are not the metric.

### After v1

**One new effect per week, posted as a standalone clip.** That is the entire growth
strategy, and it works because each clip costs almost nothing once the pipeline above is
a habit. Missing two weeks in a row is the failure mode — not building the wrong effect.

Deliberately **not** on the roadmap, at any point:
npm package · MDX docs site · playground or theme customiser · Figma file · Pro tier ·
Vue/Svelte/Astro ports · anything needing a runtime dependency.

Every one of those is how a previous attempt at this project died. See
[`SCOPE.md`](SCOPE.md) for the full list, and [`docs/OPEN-SOURCE.md`](docs/OPEN-SOURCE.md)
§7 for the tooling that is deferred rather than refused, each with the condition that
unfreezes it.

## Using it in your project

MIT. Use the effects in anything, including commercial and closed-source work. No
attribution required and no notice to keep in your bundle — once the file is in your repo
it is ordinary source code you own and can edit freely.

**Requirements:** React 19, Tailwind CSS 4, and a project set up for the shadcn CLI. No
runtime dependency beyond React itself — no motion library, no GSAP, not even `clsx`.

## Contributing

Start with [`CONTRIBUTING.md`](CONTRIBUTING.md). Fixes to the existing twelve are very
welcome; a thirteenth effect is not, until v1 is live.

```bash
git clone https://github.com/raqibnur/hoverui.git
cd hoverui
npm ci
npm run dev
```

## Docs in this repo

| File | What it covers |
|---|---|
| [`SCOPE.md`](SCOPE.md) | The frozen twelve, with Intent and Not this. Read before building anything. |
| [`docs/AUTHORING.md`](docs/AUTHORING.md) | How to write an effect, with the reference implementation. |
| [`docs/MOTION.md`](docs/MOTION.md) | G1-G16, the motion and accessibility gate. Non-negotiable. |
| [`docs/FIXES.md`](docs/FIXES.md) | The canonical repair for every gate. |
| [`docs/REGISTRY.md`](docs/REGISTRY.md) | registry.json, build, serve, deploy, namespace. |
| [`docs/LAUNCH.md`](docs/LAUNCH.md) | What ships on launch day, and what deliberately doesn't. |
| [`docs/OPEN-SOURCE.md`](docs/OPEN-SOURCE.md) | Repo hygiene: what is in place, what is deferred on purpose. |
| [`CLAUDE.md`](CLAUDE.md) | The five hard rules and the working agreements. |

## License

[MIT](LICENSE) © Raqib Nur
