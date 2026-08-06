---
description: Review and repair motion issues in one effect or across the whole registry
argument-hint: <slug | all>
allowed-tools: Read, Edit, Glob, Grep, Bash
---

Close the review loop on `$1`.

1. Delegate to `motion-reviewer` over `$1` (or every file in `registry/hover/` if `$1`
   is `all`). Capture the findings table verbatim.
2. If `PASS`, stop and say so. Do not look for work.
3. Otherwise delegate to `motion-fixer`, passing the table verbatim. Do not summarise it,
   do not reorder it, do not add rows of your own.
4. Delegate to `motion-reviewer` again on the same files.
5. If still blocked, repeat steps 3-4 **once**. Two repair rounds is the ceiling.
6. If it is still blocked after two rounds, stop and escalate to me with the remaining
   table. Do not keep grinding, and do not relax a gate to reach `PASS`.

Report: the original table, what was fixed, what remains, and the final verdict.

Do not commit. Do not touch files outside `registry/hover/`.
