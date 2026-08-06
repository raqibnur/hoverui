# Scope — v1

**Frozen 2026-07-25. 12 effects. Nothing is added to this list before all 12 are live in
production.** Previous attempts at this project died by expanding scope mid-build. The
list below is the counter-measure, and it only works if it is treated as read-only.

Every effect carries an **Intent** and a **Not this**. Both are binding. A slug alone is
a category, not a design — "liquid fill" describes a thousand different effects, and an
agent handed only the slug will build the median one. The Intent says which of the
thousand. The Not this names the median so it can be avoided on purpose.

---

## Buttons

### 1. `magnetic-button` — built
The button has mass and is faintly attracted to the cursor. The pull is small enough to
read as physics rather than as a trick, and the moment that sells it is the *release* —
the overshoot on the way back is where the personality lives.
**Not this:** a button that snaps to the cursor position, or travels far enough that the
click target stops matching what the eye sees.

### 2. `liquid-fill-button`
Colour floods in from the exact edge the cursor crossed, so the button feels poured into
from wherever you touched it. Directional truth is the entire effect — the fill origin
must track the real entry point.
**Not this:** a centre-out radial, or a fill that always starts from the left regardless
of approach.
*Technique:* radial-gradient position driven by two CSS vars, set once on pointer enter.

### 3. `border-trace-button`
A single point of light completes exactly one lap of the border and settles into a steady
low glow. It should read as a circuit energising, then holding.
**Not this:** a light that loops continuously for as long as you hover — that reads as a
loading state, and loading states make people wait.
*Technique:* `conic-gradient` + mask, `css` keyframes for the lap, transition for the settle.

### 4. `scramble-button`
The label *decodes* rather than shuffles — characters resolve left to right over roughly
400ms so the eye can follow a wavefront across the word.
**Not this:** every character cycling randomly at once, which reads as noise and makes
the label unreadable for the whole duration.
*Technique:* JS character cycling on a ref. Reduced motion jumps straight to final text.

---

## Cards

### 5. `spotlight-card`
A soft light sits just beneath the surface and follows the cursor with slight lag,
lifting the border and a faint texture as it passes. The card should feel lit from
within.
**Not this:** a hard bright circle tracking the cursor exactly — that reads as a torch
held over paper, not as a material that responds.
*Technique:* two CSS vars, no re-render, large radius and low alpha.

### 6. `tilt-card`
Rotation capped at 8 degrees, with a specular sheen that moves *opposite* the tilt. The
card should feel like a physical panel behind glass.
**Not this:** 15-20 degrees of rotation with a flat highlight. Aggressive tilt is the
single most dated effect on this list and it is dated because it ignores how light works.

### 7. `reveal-card`
The image recedes — scales down slightly and desaturates — while the caption rises into
the space it vacated. One thing leaves so another can arrive; the exchange *is* the
effect.
**Not this:** a caption fading in on top of the image. Nothing moved out of the way, so
nothing feels caused.

### 8. `chase-border-card`
A gradient border rotates only while hovered, and eases to a stop on leave rather than
cutting. Slow enough that it reads as expensive.
**Not this:** a fast multi-hue spin. Speed and saturation are what separate this from
every AI-generated landing page of the last two years.
*Technique:* `css` keyframes on an angle var; pause and ease-out on leave.

---

## Text & links

### 9. `stagger-text`
Letters lift in a 35ms wavefront, so the word reads as a physical row of keys being
depressed in sequence. It must stay legible at every frame.
**Not this:** letters flying in from off-screen or rotating in 3D. The word is already
there; hover animates its state, not its arrival.

### 10. `draw-underline`
The underline draws from the side the cursor entered and retracts toward the side it
left. The direction carries real information about your movement.
**Not this:** always drawing left to right. It costs four lines to do properly and it is
immediately felt even by people who cannot say why.
*Technique:* `scaleX` with `transform-origin` flipped on enter and leave.

### 11. `blur-swap-link`
The label defocuses out as the replacement focuses in — a camera rack focus, not a
crossfade. Both states occupy identical space so no layout shifts.
**Not this:** an opacity crossfade with a blur filter bolted on. The blur must lead the
opacity, or it reads as a fade with an artifact.

### 12. `slide-marquee-link`
The label slides up and out while its duplicate arrives from below, pixel-exact, so it
reads as one continuous strip moving past a window.
**Not this:** two independently animated spans. If the timing or offset is off by even a
pixel the illusion collapses and it looks broken rather than stylish.

---

## Cut

Effects abandoned at the 90-minute mark. Recording them here is what makes cutting feel
like progress instead of failure.

| Slug | Why cut | Replaced by |
|---|---|---|
| — | — | — |

## Explicitly not in v1

Do not build these. Every one of them is how a previous attempt died.

- Vertical categories: marketing, ecommerce, SaaS, dashboard, blocks, sections, templates
- npm package (`npm i hoverui`) — the registry JSON *is* the distribution
- MDX docs site, search, sidebar navigation, versioned docs
- Playground, live code editor, prop controls, theme customiser
- Figma file, design tokens export
- Pro tier, licensing, payments, accounts
- Framework ports (Vue, Svelte, Astro)
- Any effect requiring a runtime dependency
- Any component whose value is markup rather than hover behaviour

## Definition of done for v1

- 12 effects live at `hoverui.com`, each installable from a clean project in one command
- Every effect matches its Intent and avoids its Not this
- Every effect passes `docs/MOTION.md`
- Single-page landing + gallery, no docs framework
- One stranger has installed it

Stars are not the metric. One stranger's install is the metric.
