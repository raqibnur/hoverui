# Motion quality gate

Sixteen gates, **G1-G16**. This numbering is canonical — `docs/FIXES.md` and
`.claude/agents/motion-reviewer.md` use the same identifiers, and every finding, comment,
and commit message must cite the `G` form. Never refer to a gate by position in a list.

Every effect passes all sixteen before it ships. This document is the reason someone picks
HoverUI over the fiftieth "awesome hover effects" collection — the effects are correct
under keyboard, touch, reduced motion, and interruption. Almost nobody bothers.

## Reference: easing

Built-in CSS easings are too weak; they read as unintentional.

```
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1)     entering, responding to the cursor
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)    moving or morphing on screen
--ease-spring: cubic-bezier(0.34, 1.40, 0.64, 1)  releasing, slight overshoot
```

Colour and opacity: plain `ease` is fine. Continuous motion: `linear`.

## Reference: duration

| What | Duration |
|---|---|
| Cursor tracking (magnetic, spotlight, tilt) | 100-140ms |
| Enter transition (fill, underline, blur swap) | 180-260ms |
| Release / settle back to rest | 350-450ms with `--ease-spring` |
| Press feedback (`:active`) | 100-160ms |

---

## The gates

**G1 — `transition` names its properties.** `transition: all` is a bug. It animates layout
properties you didn't intend and destroys frame rate.

```
transition-[transform,opacity]      yes
transition-all                      no
```

**G2 — Easing comes from the three project curves.** Never `ease-in` on a hover effect: it
delays the first frame, which is the exact moment the user is watching. It feels sluggish
at any duration.

**G3 — Duration sits inside its band.** See the reference table above.

**G4 — Response is fast, settle is slow.** Asymmetry is deliberate. The user's action gets
an instant answer; the return to rest is where the effect earns its personality. Symmetric
timing reads as a CSS default.

**G5 — Transitions, not keyframes, for anything cursor-driven.** Keyframes restart from
frame zero when re-triggered, and a user sweeping across a grid re-triggers constantly.
Transitions retarget smoothly from wherever they are. Keyframes are only for genuinely
continuous motion (`chase-border-card`, `border-trace-button`).

**G6 — Nothing appears from nothing.** Start from `scale(0.96)` and `opacity: 0`, never
`scale(0)`. Objects in the real world do not pop into existence.

**G7 — Pointer work is gated on capability.** Touch devices fire hover on tap and then
*keep* it, stranding the effect. Fold reduced motion into the same check so the handler
never computes vars that CSS would only hide:

```ts
window.matchMedia(
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
)
```

**G8 — Every effect has a documented touch resting state.** Not "hover doesn't work on
mobile" — a decided answer. The rest state must look finished and intentional on its own.
A card whose caption only exists on hover is broken on every phone.

**G9 — Keyboard parity.** A keyboard user has no cursor, so they get the effect's
*arrival* state, not its tracking: the fill completes, the underline draws, the card lifts
without tilt. Never leave `:focus-visible` with no visible change. It costs four lines and
it is the single most credible detail in the project.

**G10 — Reduced motion means gentler, not absent.** Remove movement, keep the information.
Opacity and colour transitions stay; transforms go. Where an effect carries meaning in its
motion (`scramble-button`), jump straight to the final state.

**G11 — `:active` responds.** Anything pressable scales to `0.97` on its own press-band
duration (G3). If the interface doesn't acknowledge the press, it feels dead.

**G12 — Compositor-only properties.** `transform`, `opacity`, `filter`, `clip-path`. Never
`width`, `height`, `top`, `left`, `margin`, or `box-shadow` spread.

**G13 — No permanent `will-change`.** It holds a compositor layer forever. Add it on
pointer enter and remove it on settle, or leave it out. Leaving it out is usually right.

**G14 — No React state per pointer event.** Write CSS custom properties directly on the
node with `el.style.setProperty()`. A `setState` on `pointermove` re-renders at 60-120Hz
and will drop frames on a mid-range Android. State is only for values that change at human
frequency, such as the G7 capability check.

**G15 — The effect matches its Intent.** Read the effect's **Intent** and **Not this** in
`SCOPE.md`. An effect that passes G1-G14 and still builds the median version of its
category is a failure — and it is the failure most likely to reach production, because
correctness is easy to verify and taste is not.

**G16 — Variant conflicts are resolved by specificity, not by order.** Tailwind variants
compile to selectors; the winner is decided by CSS specificity and stylesheet source
order, **not** by position in a `className` array or template string. `focus-visible:`
(two selector components) beats a bare utility regardless of which was written first, and
a media query such as `motion-reduce:` adds no specificity at all.

Consequences:

- Never add a class expecting it to win because it appears later in the array.
- A `motion-reduce:` rule cannot override a `focus-visible:` or `active:` rule on the same
  property. Reasserting it is dead code — delete it rather than leaving a comment claiming
  behaviour the CSS does not produce.
- When two variants genuinely compete for one property, state the winner explicitly in a
  comment, or restructure so they touch different properties.
- Consumers cannot reliably override our classes via `className` without `tailwind-merge`.
  That is the accepted cost of rule 2; document it, don't paper over it.

This gate exists because the failure is invisible: the code reads as if it works, and on
simple effects the conflicts happen to resolve favourably anyway.

---

## Review output format

One markdown table, one row per finding, citing the gate:

| Gate | Before | After | Why |
| --- | --- | --- | --- |
| G1 | `transition: all 300ms` | `transition: transform 200ms var(--ease-out)` | `all` animates layout |
| G2 | `ease-in` on fill | `var(--ease-out)` | delays the frame the user is watching |
| G9 | no `:focus-visible` branch | static arrival state | keyboard users have no cursor |

## Debugging

- Slow every transition to 5x and watch it. Timing errors are invisible at full speed.
- Sweep the cursor rapidly across a grid of the same effect. Anything that stutters,
  sticks, or restarts is using keyframes where it needs transitions (G5).
- For G16, open devtools and read the computed style. Do not reason about which class
  "should" win from the source.
- Test on a real phone over local IP. Check the resting state (G8) and check that tapping
  doesn't strand the effect.
- Review it again the next morning. You will see things you cannot see today.
