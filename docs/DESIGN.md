# Homepage design spec

Authoritative. If a build decision conflicts with this file, this file wins.

## Thesis

**The page is achromatic at rest. Colour is a function of the cursor.**

No accent colour appears anywhere until the pointer moves. Then a charge follows it, and
effects bloom only underneath it. The site demonstrates itself before the visitor
consciously interacts with anything.

This is deliberate positioning. Every component-library site in this category is
dark-mode-first with a neon or gradient accent; matching them means looking like a clone
on day one. It is also correct on the merits: for a motion library, a loud palette
competes with the product. Boldness is spent on motion. Everything else stays quiet.

## Tokens

Declared on `:root` in `app/globals.css`, then mapped to `--color-*` in the `@theme inline`
block above them (Tailwind v4). Adding a token means editing both places.

```css
--paper:   #E7E9E4;  /* page — pale grey-green, a lab bench, not cream */
--surface: #F4F5F2;  /* tile surface */
--ink:     #14150F;  /* text — near-black, green-shifted, never #000 */
--mid:     #646860;  /* labels, mono metadata, secondary text */
--rule:    #CDD1C8;  /* hairlines */
--brand:   #FF5400;  /* the brand, at full strength — ONLY under the pointer */
--charge:  #B83A00;  /* the same hue, dark enough to carry text — ONLY under the pointer */
```

## The brand, in two tones

The brand colour is `#FF5400`. It is a light colour, and this is a light page, so it cannot
do every job an accent normally does — hence two tones rather than one. Measured against the
palette:

| | on `--paper` | on `--surface` | `--paper` on it | `--ink` on it |
|---|---|---|---|---|
| `--brand` #FF5400 | 2.63 | 2.94 | 2.63 | **5.70** |
| `--charge` #B83A00 | **4.71** | **5.27** | **4.71** | 3.33 |

So:

- **`--brand` is for being seen as colour, never for carrying meaning.** The charge field's
  radial (decorative, 9% alpha, no contrast requirement) and fills that put `--ink` on top of
  it. It must never be a text colour, a focus ring, or a fill under light text.
- **`--charge` is for everything that has to be read**: hover and focus text, focus rings,
  the tile readouts, and fills carrying `--paper`. It is the brand hue taken down to a
  luminance that clears AA in both directions.

`--charge` was an electric indigo before the brand was settled; everything that was indigo is
now the dark brand tone, so the page has one hue rather than two. Both tones remain forbidden
at rest — the thesis is unchanged, it is just the brand's colour now instead of a borrowed
one. Re-measure before altering either value.

`--mid` is the quiet token, not the invisible one, and it has to clear **AA at 4.5:1** on
both `--paper` and `--surface`. It carries the eyebrows, the slugs, the motion readouts and
the footer — most of the page's copy, nearly all of it at 10-12px. It shipped at `#7C8177`,
which measures **3.26:1** on `--paper` and fails; `#646860` measures 4.65:1 on `--paper` and
5.20:1 on `--surface`. The bar is not negotiable and it is the project's own: `stagger-text`
rejects a staggered opacity ripple specifically because the composite lands at 3.85:1, "under
AA for normal text". A palette that fails the test an effect was made to pass is the same bug
one level up. Re-measure before darkening or lightening this token.

`--rule` is exempt — hairlines and tile borders are decorative, and no control on this page
depends on one to be findable.

The tile surface is `--surface`, **not** `--card`. `--card` is shadcn's own token: it is
pure white at `:root` and near-black under `.dark`, while `--ink` and `--rule` do not
invert. Reaching for `bg-[var(--card)]` therefore gives you white on `--paper` today and
near-black text on a near-black fill the moment anything sets `.dark`. Only the six tokens
above are HoverUI's; everything else in `app/globals.css` belongs to shadcn.

`--charge` is forbidden in any resting state. No charge-coloured buttons, headings,
links, borders, or badges at rest. If it is visible without the pointer nearby, it is a
bug.

Light mode only for v1. A dark mode that inverts this concept is a v2 problem.

## Typography

| Role | Face | Usage |
|---|---|---|
| Display | Bricolage Grotesque (variable) | H1 and section headings. `letter-spacing: -0.04em`, weight 500, set very large. Use the width axis; it is why this face was chosen |
| Body / UI | Geist, falling back to Inter Tight | Everything conversational |
| Utility | Geist Mono | Eyebrows, motion values, install command, counts |

Load through `next/font/google`. If Geist is unavailable, Inter Tight is the substitute —
do not substitute the display face.

Sentence case in body copy. The eyebrows are the exception: mono, uppercase, tracked out,
because they are labels on an instrument, not sentences.

## Layout

```
┌────────────────────────────────────────────────────────┐
│ hoverui                              github    /r/     │  hairline rule below
├────────────────────────────────────────────────────────┤
│                                                        │
│   HOVER EFFECTS FOR                                    │  display, clamp to ~96px+
│   REACT AND TAILWIND.                                  │  "HOVER" runs stagger-text
│                                                        │
│   Twelve of them. One file each. No dependencies.      │
│                                                        │
│   $ npx shadcn@latest add hoverui.com/r/…    [copy]    │  magnetic-button
│                                                        │
│   Built for landing pages, not dashboards.             │  mono, --mid
├────────────────────────────────────────────────────────┤
│ BUTTONS ──────────────────────────────────── 03 / 04  │  mono eyebrow, hairline, built/planned
│  ┌──────────────┐                                      │  a tile is a "channel":
│  │ title   ⧉ ⟨⟩ │  ← identity + persistent copy cmd/code
│  │ ┌──────────┐ │                                      │
│  │ │  [live]  │ │  ← recessed stage, effect uncovered  │
│  │ └──────────┘ │                                      │
│  │ track·release│  ← readout, always on; lights --charge on hover
│  │ curve        │     values mono, --ink→--charge      │
│  └──────────────┘                                      │
├────────────────────────────────────────────────────────┤
│ CARDS ────────────────────────────────────── 00 / 04  │  unbuilt slots show offline "channels"
│ TEXT & LINKS ───────────────────────────────── 00 / 04  │
└────────────────────────────────────────────────────────┘
```

One page. No sidebar, no search, no route beyond `/`.

## The hero contains no decorative filler

Every element in the hero either is shipped inventory or is the stack the product targets:

- The word "HOVER" in the H1 runs `stagger-text`
- The install command is wrapped in `magnetic-button`, and clicking copies it
- The word "Tailwind" in the H1 is the Tailwind lockup: the mark is sampled into particles
  the cursor pushes aside, the wordmark beside it stays type
  (`components/hero/tailwind-logotype.tsx`)
- Nothing else is in the hero

Visitors trigger the product by accident while reading, before they scroll. That is the
entire hero strategy — no illustration, no screenshot, no gradient orb.

**The logotype is the one amendment to that rule, and it is a narrow one.** It is not
decoration dropped into the headline: it occupies the exact position of a word that was
already there, carries the same information that word carried, and is hoverable — so it
obeys the same "the hero demonstrates itself" logic as the other two. It is deliberately
*not* a HoverUI effect. It is vendored from the Originkit registry, lives in
`components/hero/`, never enters `registry.json`, and leaves the frozen 12 in `SCOPE.md`
untouched. It imports nothing but React, so rule 2 in `CLAUDE.md` still holds.

Only the mark is sampled. A particle field resolves no finer than its lattice, and at this
size the wordmark's stems are barely wider than one — sampling them spent most of the
particles reconstructing an outline the eye reads better as a solid, so it looked like a
broken font rather than an effect. The mark is two broad strokes and carries it.

It obeys the page thesis rather than being exempted from it: the mark rests in `--ink` and
samples Tailwind's own #38BDF8 only while the pointer is on the lockup. Colour is still a
function of the cursor. The vendored physics has no reduced-motion or touch handling of its
own and drives a permanent `requestAnimationFrame`, so it mounts only behind a
`(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)` gate;
everything else gets the same artwork masked to `--ink`, costing no JavaScript.

If a later edit makes this the thin end of a wedge — a second illustration, a screenshot, a
gradient — the rule above is the one that wins, not this paragraph.

## Signature: the charge

A single throttled `pointermove` listener on `document` writes `--px` and `--py` to
`document.documentElement`. A fixed, very low-alpha radial of `--charge` sits behind the
grid and tracks those vars.

- One listener for the whole page. Never per-tile.
- No React state. `style.setProperty` only.
- The radial is large and faint — a field, not a spotlight. If it reads as a cursor
  torch, reduce the alpha until it is almost subliminal.

## Tile metadata

Each tile is a **channel**: an identity header with the copy controls, a recessed stage
where the effect performs uncovered, and a persistent readout of the motion values in
mono — `track 120ms · release 420ms · cubic-bezier(0.34, 1.4, 0.64, 1)`.

The readout is **always legible, not hover-gated**. The motion quality gate is the
project's differentiator, so it is shown, not hidden — nobody else publishes their easing
curves because most of them have not thought about them. At rest the values sit in quiet
mono; under the pointer they *energise* to `--charge` (the hairline warms with them). That
is the page thesis applied to a tile — colour is a function of the cursor — rather than
chrome that slides in and out. Pull the values from `lib/registry.ts`; never hand-type
them into the page.

The copy controls (install command, source) live in the header and are **persistent** —
discoverable without hovering, reachable by keyboard, identical on touch. The source is
read off disk (`lib/source.ts`) so a copied component is byte-for-byte what installs.

Each section eyebrow carries `built / planned` (e.g. `03 / 04`). Showing both against the
frozen four communicates a complete, curated, finite set in progress — the positioning.
Unbuilt slots render as offline channels (dashed, a flat "signal" line, no copy controls),
so the set is visible without ever faking a working effect.

## Touch

No cursor, so the charge follows the tile nearest the viewport centre during scroll,
reusing the same two CSS vars. Every effect rests in its finished state — a tile whose
content only exists on hover is broken on a phone. See rule 5 in `MOTION.md`.

## Copy

> **Hover effects for React and Tailwind.**
> Twelve of them. One file each. No dependencies.
> `npx shadcn@latest add hoverui.com/r/magnetic-button.json`
> Built for landing pages, not dashboards.

Say what it does. No "elevate your UI", no "beautiful, modern components", no adjectives
that could describe any library. The last line is load-bearing: stating what the product
is *not* for is what earns credibility with the design engineers who will decide whether
this is serious.

## Acceptance

- [ ] `--charge` is invisible with the pointer parked off-screen
- [ ] Hero H1 triggers `stagger-text`; install button is magnetic and copies on click
- [ ] Exactly one pointer listener on the page
- [ ] No React state updates on pointer movement
- [ ] Tile motion values are read from `lib/registry.ts`, not hardcoded in JSX
- [ ] Keyboard tab through the whole page shows a visible focus state at every stop
- [ ] `prefers-reduced-motion` disables the charge tracking and all travel
- [ ] Real phone: no stranded hover states, all tiles legible at rest
- [ ] Lighthouse performance ≥ 95 with all 12 previews mounted
