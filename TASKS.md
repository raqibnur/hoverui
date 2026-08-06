# Build plan — 10 working days

One effect per commit. Update this file as you go; it is the source of truth for where
the project is.

## Day 1 — the loop
- [ ] Scaffold Next + Tailwind + shadcn init (`docs/REGISTRY.md`)
- [ ] Drop in this kit: `CLAUDE.md`, `SCOPE.md`, `docs/`, `.claude/`, `lib/`, `registry/`
- [ ] `registry:build` script wired into `build`
- [ ] `magnetic-button` rendering locally
- [ ] Install it from a separate throwaway project — all four checks pass
- [ ] Deploy to Vercel, `hoverui.com` pointed at it
- [ ] Ugly is fine. The loop being closed is the deliverable.

## Day 2-3 — the gallery
- [ ] Gallery grid, grouped by buttons / cards / text
- [ ] Tile = live preview, hoverable in place
- [ ] Code tab reading from `lib/source.ts`
- [ ] Copy-install button
- [ ] Dark mode via CSS vars only
- [ ] No sidebar, no search, no MDX. Stop when it works.

## Day 4-7 — the remaining 11
90 minutes each. Not working? Cut it, log it in `SCOPE.md`, move on.

- [x] `liquid-fill-button`
- [ ] `border-trace-button`
- [ ] `scramble-button`
- [ ] `spotlight-card`
- [ ] `tilt-card`
- [ ] `reveal-card`
- [ ] `chase-border-card`
- [ ] `stagger-text`
- [ ] `draw-underline`
- [ ] `blur-swap-link`
- [ ] `slide-marquee-link`

## Day 8 — the gate
- [ ] `/ship-check` on all 12
- [ ] Real phone over local IP: resting states, no stranded hovers
- [ ] Keyboard-only pass through the whole gallery
- [ ] Reduced motion pass
- [ ] OG image, favicon, meta, title
- [ ] Every effect installs clean from a fresh project

## Day 9 — the pitch
- [ ] Hero that demonstrates itself
- [ ] Landing copy (`docs/LAUNCH.md`)
- [ ] Record the 30-second video
- [ ] Write the X post, the Reddit post, the Peerlist entry
- [ ] README with the install command at the top

## Day 10 — ship
- [ ] Deploy final
- [ ] Post in order (`docs/LAUNCH.md`)
- [ ] Answer comments for six hours
- [ ] Set the weekly-effect reminder before closing the laptop

## Then
- [ ] `awesome-shadcn-ui` PR
- [ ] shadcn registry directory PR for `@hoverui`
- [ ] One effect per week, shipped as a clip
