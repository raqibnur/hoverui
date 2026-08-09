<!--
Effects outside the frozen 12 in SCOPE.md are not merged before v1 is live.
Fixes to the existing 12 are always welcome. See CONTRIBUTING.md.
-->

## What this changes

<!-- One or two sentences. Which effect, and what is different about it now. -->

## Why

<!-- For a fix: what was wrong, and how you noticed. Link the issue if there is one. -->

Closes #

---

## The gate

Delete rows that do not apply. Leaving a box unchecked with a sentence explaining why is
fine — checking one that is not true is not.

### Every PR

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] No new dependency, runtime or dev

### Touching `registry/hover/`

- [ ] The effect is **one self-contained `.tsx` file** — no shared utils, no shared CSS,
      no `registryDependencies`
- [ ] **Zero runtime dependencies**: React and Tailwind only
- [ ] The registry item `target`s `components/hover/<slug>.tsx`
- [ ] `preview.tsx` is gallery-only and is **not** listed in the registry item
- [ ] `npm run registry:build` was run and `public/r/` is committed
- [ ] It still matches its **Intent** in `SCOPE.md` and avoids its **Not this**

### Motion and accessibility — `docs/MOTION.md`

- [ ] **Keyboard**: reachable by Tab, visible focus, no focus trap
- [ ] **Reduced motion**: resolves to the end state instantly, not just more slowly
- [ ] **Real phone, not the emulator**: tapped it, tapped away, no stranded hover state
- [ ] Animates compositor-friendly properties; no layout thrash on pointer move
- [ ] Used `docs/FIXES.md` for any finding rather than inventing a repair

### Verified as a user

- [ ] Installed from a **separate throwaway project** with
      `npx shadcn@latest add http://localhost:3000/r/<slug>.json`
- [ ] File landed in `components/hover/`, no packages installed, no `globals.css` edit

## Screen recording

<!--
For anything visual, attach a short clip. This is a motion product — a still frame
cannot show the release curve, and the release is where these effects live or die.
-->
