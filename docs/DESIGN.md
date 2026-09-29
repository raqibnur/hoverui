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

## Dark theme

Amended 2026-09-29 with the homepage redesign: the page ships a light and a dark theme,
switched from the round control beside the GitHub pill (`components/site/theme-toggle.tsx`).
The first visit follows the OS; a choice is stored under `hoverui-theme` and applied by an
inline script in `app/layout.tsx` before first paint, so there is no light flash.

The dark theme does not invert the concept — it is the same bench with the lights down, and
the thesis holds unchanged: achromatic at rest, colour only under the pointer. The six tokens
are redefined under `.dark` in `app/globals.css`, re-measured:

| token | dark value | on dark `--paper` | on dark `--surface` |
|---|---|---|---|
| `--ink` | `#ECEDE8` | 16.34 | 15.17 |
| `--mid` | `#8D9187` | **5.98** | **5.55** |
| `--charge` | `#FF7A3D` | **7.42** | **6.89** |
| `--rule` | `#2A2C25` | decorative | decorative |

`--brand` keeps `#FF5400`. The charge field's alpha is a token (`--charge-alpha`): 9% on the
light bench, 7% on the dark one, where the same radial would otherwise read as a torch.

Three more tokens serve the header pills and solid badges: `--chrome` (dark in both themes:
`#14150F` light, `#1B1C17` dark), `--chrome-fg` and `--chrome-mid` (7.49 / 7.00:1). Because
the pill is dark everywhere, `--brand` is the hover colour on it (5.70 / 5.32:1). `--on-brand`
(`#14150F`, fixed) is the text colour for any `--brand` fill, since `--ink` now inverts.

A `.light` class re-applies the light tokens to a subtree, and `.dark` the dark ones. The
effect sheet's stage uses this so an effect can be judged on either background regardless
of the page theme. Previews must therefore use the tokens, never literal hex — a hardcoded
`#14150F` label disappears on the dark stage.

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

The diagram below is the v1 layout. Since the 2026-09-29 redesign the header is three
floating pills (logo · section nav with `/r/` · GitHub + theme toggle), and tiles are
bezels with a footer strip — see § Tile metadata. Since 2026-09-30 the hero is left-aligned
on the gallery's edge: the headline across the measure, a hairline, then the pitch and the
install command side by side (stacked below `lg`). It is kept to about one screen so the
first row of tiles shows above the fold on a laptop.

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
function of the cursor. It sits inline in the H1, sized in `em` so it tracks the type, and
rests assembled — the vendored "roam" idle, which scatters the dots until hovered, read as
noise mid-sentence at headline size. The vendored physics has no reduced-motion or touch
handling of its own, so repulsion and pointer events are enabled only behind a
`(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)` gate;
everything else gets the mark assembled, static and in `--ink`.

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

Each tile is a bezel holding a recessed stage where the effect performs uncovered, with a
footer strip beneath: the name, a persistent one-line readout of the motion values in mono
(`track 120ms · release 420ms`), the install-command copy, and an arrow that opens the
**effect sheet**. Groups lay out two columns wide — each group is four effects, so it is a
clean 2x2 and every stage has room.

The tile carries the page thesis in three places, all achromatic at rest:

- **The lit edge.** The bezel is painted with the same `--px`/`--py` radial as the charge
  field, on `fixed` attachment so it lines up with the field behind the page. The field
  passes through the tile at its usual alpha instead of stopping at the edge, and the
  hairline nearest the cursor warms to `--charge` — on neighbouring tiles too, so the grid
  reads as one surface in one field. No extra listener; `.gallery-tile` in
  `app/globals.css`. Fine pointers only (iOS ignores `fixed`).
- **Focus marks.** Four viewfinder corners inside the stage, `--mid` at rest. On hover or
  focus-within they close in on the effect (scale, out-curve, 220ms) and take `--charge`;
  they release on the spring. Reduced motion keeps the colour and drops the travel.
- **The bench.** A faint dot lattice on the stage, strongest at the walls and masked out
  at the centre, so nothing ever sits behind the effect itself.

The footer leads with the effect's channel number in the frozen 12 (`01`–`12`, mono, hidden
below `sm` so the readout keeps its room).

The effect sheet (`components/gallery/effect-sheet.tsx`) is the page an effect would
otherwise get, kept inside the single page as a native modal `<dialog>`: group badge, title,
description and install command, then four tabs — **Preview** (a large stage with a
light/dark stage switch and a reset), **Code** (the file read off disk, with line numbers),
**Install** (the command per package manager, the target path, the import line, the
registry item's keyframes when it has any) and **Motion** (every published value plus the
curve, and why the release is long). The curve lives in the sheet rather than on the tile.

The readout is **always legible, not hover-gated**. The motion quality gate is the
project's differentiator, so it is shown, not hidden — nobody else publishes their easing
curves because most of them have not thought about them. At rest the values sit in quiet
mono; under the pointer they *energise* to `--charge` (the hairline warms with them). That
is the page thesis applied to a tile — colour is a function of the cursor — rather than
chrome that slides in and out. Pull the values from `lib/registry.ts`; never hand-type
them into the page.

The install copy lives in the tile footer and is **persistent** — discoverable without
hovering, reachable by keyboard, identical on touch. The source is read off disk
(`lib/source.ts`) so a copied component is byte-for-byte what installs.

Each section heading carries its count in brackets (`Buttons [04]`), resting in `--mid` and
warming to `--charge` while the pointer is in the section, plus `built / planned` on the
right (e.g. `03 / 04 shipped`). Showing both against the
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
