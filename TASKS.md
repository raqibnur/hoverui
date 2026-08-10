# Build plan — 10 working days

One effect per commit. Update this file as you go; it is the source of truth for where
the project is.

> **Status — a tick means built and rendering, not shipped and not gate-clean.**
> All twelve effects exist and work in the gallery. `/ship-check` has been run in full:
> steps 1-6 and 9-11 pass, step 7 (`motion-reviewer` over all twelve) returns **BLOCKED
> with 60 findings**, of which 7 are now closed, and step 8 could not run at all until
> `baseline-ui` was vendored.
> The install path is now proven, on one effect: `reveal-card` was installed into a
> separate project with the shadcn CLI and landed in `components/hover/` **byte-identical
> to source** (12582 bytes, SHA-256 `9e5593c8…`), adding zero dependencies and zero CSS of
> its own. That is the mechanism validated end to end; the remaining eleven are unproven
> only by repetition.
>
> What still stands between here and a launch: **nothing is deployed**, so the published
> `https://hoverui.com/r/<slug>.json` URL in the README and every install command on the
> page currently resolves to nothing.

## Day 1 — the loop
- [x] Scaffold Next + Tailwind + shadcn init (`docs/REGISTRY.md`)
- [x] Drop in this kit: `CLAUDE.md`, `SCOPE.md`, `docs/`, `.claude/`, `lib/`, `registry/`
- [x] `registry:build` script wired into `build`
- [x] `magnetic-button` rendering locally
- [x] Install it from a separate throwaway project — verified with `reveal-card` rather
      than `magnetic-button`: file landed in `components/hover/`, byte-identical to source,
      no packages and no `globals.css` edit attributable to HoverUI (the target project's
      `shadcn init` added its own, which is not the same thing). README step 5's remaining
      two checks — real phone, keyboard and reduced-motion — are tracked at Day 8
- [ ] Deploy to Vercel, `hoverui.com` pointed at it
- [ ] Ugly is fine. The loop being closed is the deliverable. ← **the loop is still open**

## Day 2-3 — the gallery
- [x] Gallery grid, grouped by buttons / cards / text
- [x] Tile = live preview, hoverable in place
- [x] Code tab reading from `lib/source.ts`
- [x] Copy-install button
- [ ] Dark mode via CSS vars only — `.dark` carries the shadcn tokens only; `--paper`,
      `--surface`, `--ink`, `--mid`, `--rule` and `--charge` have no dark variants, so the
      palette the whole page is built on does not respond to it
- [x] No sidebar, no search, no MDX. Stop when it works.

## Day 4-7 — the remaining 11
90 minutes each. Not working? Cut it, log it in `SCOPE.md`, move on.

Built and rendering. Gate verdicts from `/ship-check` step 7 in brackets — every one is
open, and `docs/FIXES.md` governs what happens next.

- [x] `liquid-fill-button` [BLOCKED — 5]
- [x] `border-trace-button` [BLOCKED — 9, incl. the ring defect found on device]
- [x] `scramble-button` [BLOCKED — 6]
- [x] `spotlight-card` [BLOCKED — 7; 6 repaired, G15 surface question still open]
- [x] `tilt-card` [BLOCKED — 5]
- [x] `reveal-card` [BLOCKED — 3]
- [x] `chase-border-card` [BLOCKED — 2]
- [x] `stagger-text` [BLOCKED — 4]
- [x] `draw-underline` [BLOCKED — 3]
- [x] `blur-swap-link` [BLOCKED — 3]
- [x] `slide-marquee-link` [BLOCKED — 5]

## Day 8 — the gate
- [x] `/ship-check` on all 12 — ran in full; verdict **BLOCKED — 60** (28 buttons
      including 2 cross-cutting, 17 cards, 15 text), plus 3 spec conflicts tracked
      separately. 7 closed since: spotlight-card's six repairs and the `baseline-ui` gap
- [ ] Real phone over local IP: resting states, no stranded hovers — partial only, three
      effects tested by hand; the other nine have never been on a device
- [ ] Keyboard-only pass through the whole gallery
- [ ] Reduced motion pass — reviews already found two regressions here, so this pass has
      known work waiting for it
- [x] OG image, favicon, meta, title — `metadataBase`, `openGraph` and `twitter` added;
      `app/opengraph-image.tsx` generates a real 1200×630 PNG at build time (verified: valid
      PNG, absolute `og:image`, alt text emitted); `app/favicon.ico` in place; the Create
      Next App SVGs removed from `public/`
- [ ] Every effect installs clean from a fresh project — 1 of 12 done (`reveal-card`).
      Worth prioritising `border-trace-button` and `chase-border-card`: they are the only
      two carrying a `css` field, so they are the only two whose install has a step that
      can silently half-succeed — the component arrives but its keyframes do not, and the
      animation never runs. Both declare it correctly in `public/r/`; nobody has watched
      the CLI actually apply it

## Day 9 — the pitch
- [x] Hero that demonstrates itself — runs `StaggerText` and `MagneticButton` live
- [x] Landing copy (`docs/LAUNCH.md`)
- [ ] Record the 30-second video
- [ ] Write the X post, the Reddit post, the Peerlist entry
- [x] README with the install command at the top

## Day 10 — ship
- [ ] Deploy final
- [ ] Post in order (`docs/LAUNCH.md`)
- [ ] Answer comments for six hours
- [ ] Set the weekly-effect reminder before closing the laptop

## Then
- [ ] `awesome-shadcn-ui` PR
- [ ] shadcn registry directory PR for `@hoverui`
- [ ] One effect per week, shipped as a clip
