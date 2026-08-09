# HoverUI

[![CI](https://github.com/raqibnur/hoverui/actions/workflows/ci.yml/badge.svg)](https://github.com/raqibnur/hoverui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Hover effects for React and Tailwind. Copy, paste, no dependencies.

```bash
npx shadcn@latest add https://hoverui.com/r/magnetic-button.json
```

One file lands in `components/hover/`. Nothing is installed, nothing is added to your
`globals.css`, and there is no package to keep up to date. The code is yours from that
moment on.

## What this is for

Landing pages, portfolios, marketing sites, pricing pages — surfaces a visitor arrives at
once and should remember.

Deliberately **not** built for high-frequency app chrome. In a dashboard, the right amount
of hover animation is usually none, and the 420ms release curves in here would be wrong.
That distinction is why the motion values are what they are.

It is also not a component library. There is no Button, no Card, no Dialog — shadcn/ui
already won that. HoverUI ships one thing: the hover effect.

## The twelve

| Effect | What it does |
|---|---|
| [`magnetic-button`](registry/hover/magnetic-button) | Faintly attracted to the cursor. The overshoot on release is where the personality lives. |
| [`liquid-fill-button`](registry/hover/liquid-fill-button) | Colour floods in from the exact edge the cursor crossed. |
| [`border-trace-button`](registry/hover/border-trace-button) | A point of light runs one lap of the border and settles into a low glow. |
| [`scramble-button`](registry/hover/scramble-button) | The label decodes left to right, so the eye can follow a wavefront across the word. |
| [`spotlight-card`](registry/hover/spotlight-card) | A soft light under the surface trails the cursor, lifting the border as it passes. |
| [`tilt-card`](registry/hover/tilt-card) | Capped at 8°, with a specular sheen that moves *opposite* the tilt. |
| [`reveal-card`](registry/hover/reveal-card) | The image recedes so the caption can rise into the space it vacated. |
| [`chase-border-card`](registry/hover/chase-border-card) | A gradient border that rotates only while hovered and eases to a stop on leave. |
| [`stagger-text`](registry/hover/stagger-text) | Letters lift in a 35ms wavefront, legible at every frame. |
| [`draw-underline`](registry/hover/draw-underline) | Draws from the side you entered, retracts toward the side you left. |
| [`blur-swap-link`](registry/hover/blur-swap-link) | A camera rack focus between two labels, not a crossfade. |
| [`slide-marquee-link`](registry/hover/slide-marquee-link) | One continuous strip moving past a window, pixel-exact. |

Install any of them by swapping the slug:

```bash
npx shadcn@latest add https://hoverui.com/r/<slug>.json
```

Every entry in [`SCOPE.md`](SCOPE.md) carries an **Intent** and a **Not this** — what the
effect is, and the median version of it that was deliberately avoided. That file is the
specification these are held to.

## Accessibility

Not a footnote here. Every effect:

- is reachable and triggerable by **keyboard**, with a visible focus state
- resolves instantly to its end state under **`prefers-reduced-motion`** — it does not
  just animate more slowly
- has a correct **resting state on touch**, so nothing is left stuck on after a tap

[`docs/MOTION.md`](docs/MOTION.md) is the gate all twelve pass before shipping. If you find
one that does not, that is a bug and it is the highest-priority kind.

## Using it in your project

MIT. Use the effects in anything, including commercial and closed-source work. No
attribution required, no notice to keep in your bundle — once the file is in your repo it
is ordinary source code you own and can edit freely.

## Requirements

React 19, Tailwind CSS 4, and a project set up for the shadcn CLI. No runtime dependency
beyond React itself — no motion library, no GSAP, not even `clsx`.

## Contributing

Start with [`CONTRIBUTING.md`](CONTRIBUTING.md). The short version: **scope is frozen at
these twelve until v1 is live**, so fixes to the existing effects are very welcome and a
thirteenth effect is not — file it as an effect proposal and it joins the post-launch
queue.

Development:

```bash
npm ci
npm run dev
```

## Docs in this repo

| File | What it covers |
|---|---|
| [`SCOPE.md`](SCOPE.md) | The frozen twelve, with Intent and Not this. Read before building anything. |
| [`docs/AUTHORING.md`](docs/AUTHORING.md) | How to write an effect, with the reference implementation. |
| [`docs/MOTION.md`](docs/MOTION.md) | The motion and accessibility gate. Non-negotiable. |
| [`docs/REGISTRY.md`](docs/REGISTRY.md) | registry.json, build, serve, deploy, namespace. |
| [`docs/FIXES.md`](docs/FIXES.md) | The canonical repair for every gate. |
| [`docs/OPEN-SOURCE.md`](docs/OPEN-SOURCE.md) | Project hygiene: what is in place, and what is deferred on purpose. |
| [`CLAUDE.md`](CLAUDE.md) | The five hard rules and the working agreements. |

## License

[MIT](LICENSE) © Raqib Nur
