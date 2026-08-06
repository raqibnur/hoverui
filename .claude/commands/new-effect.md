---
description: Build one HoverUI effect from the frozen 12, review it, and wire it into the gallery
argument-hint: <slug>
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Build the effect `$1`.

1. Delegate to `scope-guard` to confirm `$1` is in `SCOPE.md`. Stop if OUT OF SCOPE.
2. Delegate to `effect-builder` to implement it.
3. Delegate to `motion-reviewer` on the result.
4. If BLOCKED, hand the table back to `effect-builder` to fix, then re-review. Two
   rounds maximum — if it is still blocked, report it and stop.
5. Run `npm run registry:build` and confirm `public/r/$1.json` was written.
6. Tick `$1` in `TASKS.md`.

Report: files touched, the install command, the review verdict, and the exact command I
should run in my throwaway project to verify the install.

Do not commit. Do not start the next effect.
