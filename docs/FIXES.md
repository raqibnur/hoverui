# Remediation

Canonical repair for every gate in `MOTION.md`. Same input, same fix, every time — which
is what keeps twelve effects consistent instead of twelve individually-reasonable
one-offs.

Gate identifiers are `G1`-`G16` and match `docs/MOTION.md` and
`.claude/agents/motion-reviewer.md` exactly. Always cite the `G` form — never a position
in a list.

| Gate | Finding | Canonical fix |
|---|---|---|
| G1 | `transition: all` / `transition-all` | Name the properties: `[transition:transform_var(--hui-duration)_var(--hui-ease)]`. If more than one property genuinely animates, list them comma-separated. Never widen back to `all` |
| G2 | Built-in or `ease-in` easing | Replace with the project curve for the phase: tracking → `cubic-bezier(0.23,1,0.32,1)`, on-screen movement → `cubic-bezier(0.77,0,0.175,1)`, release → `cubic-bezier(0.34,1.4,0.64,1)` |
| G3 | Duration out of band | Tracking → 120ms. Enter → 220ms. Release → 420ms. Press → 140ms. Take the midpoint of the band unless the effect has a stated reason to sit at an edge |
| G4 | Symmetrical enter and release | Split into two CSS vars (`--hui-duration`, `--hui-ease`) and rewrite them on enter and on leave, as `magnetic-button` does. Respond fast, settle slow |
| G5 | Keyframes on a cursor-driven effect | Convert to a transition on a CSS var. Keyframes are permitted only for genuinely continuous motion — `border-trace-button`, `chase-border-card` |
| G6 | `scale(0)` or fade from nothing | Start at `scale(0.96)` with `opacity: 0` |
| G7 | Ungated JS pointer listener | Gate on `window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)")`, stored in state, checked before writing any var. Subscribe to `change` and clean up on unmount. Folding reduced motion in here satisfies G10's handler half in one line |
| G8 | Content that only exists on hover | Move it into the resting state at reduced emphasis, and let hover change emphasis rather than existence. If the effect dies without the reveal, it is a cut, not a fix |
| G9 | Missing `:focus-visible` | Add the effect's arrival state as a static transform, plus `focus-visible:outline-none` with a visible ring. Never leave focus with no visual change, and never delete the gate instead |
| G10 | Missing reduced-motion branch | `motion-reduce:[transform:none]` plus, where the effect carries information, `motion-reduce:[transition:opacity_200ms_ease]`. Remove movement, keep meaning |
| G11 | No `:active` on a pressable | `active:[transform:...scale(0.97)]`, preserving any existing offset so the element does not jump on press |
| G12 | Layout property animating | Re-express with `transform`, `opacity`, `filter`, or `clip-path`. A width animation becomes `scaleX` with `transform-origin`; a shadow animation becomes an opacity transition on a stacked pseudo-element |
| G13 | Permanent `will-change` | Delete it. Only reinstate it, set on enter and cleared on settle, if profiling on a real mid-range device shows dropped frames |
| G14 | React state on pointer events | Replace `setState` with `ref.current.style.setProperty()`. State stays only for values that change at human frequency, such as the G7 capability check |
| G15 | Passes every gate but builds the median version of its category | Not a code fix. Re-read the effect's Intent and Not this in `SCOPE.md` and rebuild against it. If the Intent is genuinely unachievable within rule 2, cut the effect |
| G16 | A variant is expected to win because of its position in the `className` array | Delete the redundant rule. `motion-reduce:` adds no specificity and cannot override `focus-visible:` or `active:` on the same property. Where two variants genuinely compete, restructure so they touch different properties, or state the winner in a comment. Never leave a comment describing behaviour the CSS does not produce |

## When the fix is "cut it"

Some findings are not repairable, and forcing them produces a worse effect than not
shipping it:

- The effect needs a runtime dependency
- The effect is meaningless without hover, with no honest resting state
- Fixing gate 12 requires animating layout because the effect *is* a layout change
- Two repair rounds have not reached `PASS`

Move the slug to the Cut table in `SCOPE.md` with one line on why, and take the next
item in `TASKS.md`. Eleven correct effects beat twelve compromised ones, and the cut
list is a real artefact — it becomes a post later.

## What is never a fix

- Editing `MOTION.md` so the code passes
- Deleting a gate's code so it stops being flagged
- Widening a band because the value "feels fine"
- Silencing the reviewer for a file

If a gate is genuinely wrong for HoverUI, that is a decision to make deliberately with
all twelve effects in view, not mid-repair on one file.
