---
description: Run the pre-commit gate on the HoverUI registry
allowed-tools: Read, Glob, Grep, Bash
---

Run the full gate and report a single table. Do not fix anything — report only.

1. `npm run registry:build` — must succeed with no warnings
2. Every item in `registry.json` has a `target` under `components/hover/`
3. Every `registry/hover/*/` folder has both `<slug>.tsx` and `preview.tsx`
4. Every effect in `lib/registry.ts` has an entry in `components/gallery/previews.tsx`,
   and vice versa — no orphans in either direction
5. No `preview.tsx` is listed in any registry item's `files`
6. `grep` every effect for imports other than `react` — any hit is a blocking failure
7. Delegate `motion-reviewer` over every file in `registry/hover/`
8. Run the pinned `baseline-ui` skill over `app/` and `components/gallery/`. Report its
   findings in a separate block, and report any conflict with `MOTION.md` or `DESIGN.md`
   as a conflict rather than as a defect — the repo wins
9. For every effect, assert the copy button's clipboard payload is byte-identical to the
   file on disk. Compare programmatically, never by eye — the copy path must read the raw
   source string, never `textContent`, `innerText`, or a split on newlines
10. `npx tsc --noEmit`
11. Every effect in `SCOPE.md` marked built has a corresponding `public/r/<slug>.json`

Output a table of check / result / detail, then `READY TO COMMIT` or
`BLOCKED — <count>`.

If blocked on anything from step 7, tell me to run `/fix-motion <slug>` or
`/fix-motion all`. Do not repair anything yourself — this command reports, `/fix-motion`
repairs, and keeping them apart is what stops the reviewer grading its own work.
