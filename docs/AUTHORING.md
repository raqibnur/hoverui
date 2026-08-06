# Authoring an effect

Follow this exactly. Every effect is the same six steps, which is the point — by effect
four this should take under an hour with no thinking about structure.

## 1. Create the folder

```
registry/hover/<slug>/
  <slug>.tsx      shipped to users
  preview.tsx     gallery tile only
```

## 2. Write the component

Constraints, all of them load-bearing:

- `"use client"` at the top if it touches pointer events
- One file, no imports except `react`
- Named export in PascalCase matching the slug (`magnetic-button` → `MagneticButton`)
- Every tunable is a prop with a good default. Good defaults matter more than options —
  most people will never pass a prop, so the default must be the best version
- Spreads `...props` onto the root element and merges an incoming `className` last
- Styling via Tailwind utilities and CSS custom properties set in JS
- Passes every gate in `MOTION.md`

## 3. Write the preview

`preview.tsx` is what the gallery tile renders. It is **never** listed in the registry
item's `files`. Keep it to one instance of the effect with realistic copy — no lorem
ipsum, no "Click me". Real-looking content makes the gallery look like a product.

```tsx
"use client";
import { MagneticButton } from "./magnetic-button";

export default function Preview() {
  return <MagneticButton>Start building</MagneticButton>;
}
```

## 4. Register it

Add to `registry.json` → `items`. Only the component file is listed:

```json
{
  "name": "magnetic-button",
  "type": "registry:component",
  "title": "Magnetic Button",
  "description": "A button that pulls toward the cursor and springs back on leave.",
  "files": [
    {
      "path": "registry/hover/magnetic-button/magnetic-button.tsx",
      "type": "registry:component",
      "target": "components/hover/magnetic-button.tsx"
    }
  ],
  "categories": ["button"]
}
```

`target` is mandatory — it keeps installs out of `components/ui/` where they could
overwrite a user's shadcn files.

Only add `cssVars` / `css` if the effect truly needs `@keyframes`:

```json
"cssVars": { "theme": { "--ease-spring": "cubic-bezier(0.34,1.4,0.64,1)" } },
"css": {
  "@keyframes hui-trace": {
    "from": { "--hui-angle": "0deg" },
    "to":   { "--hui-angle": "360deg" }
  }
}
```

The `css` field is why HoverUI can be dependency-free and still ship keyframe effects.
Most registries skip it and tell users to hand-edit their stylesheet. That is the
competing experience you are beating.

## 5. Add to the gallery

Two edits:

`lib/registry.ts` — append the metadata entry.
`components/gallery/previews.tsx` — map the slug to its `Preview`.

Nothing else. The code tab reads the source off disk automatically.

## 6. Verify from outside

```bash
npm run registry:build
npm run dev
```

Then, in a **separate throwaway Next.js project**:

```bash
npx shadcn@latest add http://localhost:3000/r/<slug>.json
```

The gate: the effect works with zero manual CSS editing and zero installed packages.
If the user has to touch `globals.css`, the item is incomplete — move that CSS into the
item's `css` field.

## The className override caveat

Without `tailwind-merge`, a consumer passing `transition-none` or their own `transform`
cannot reliably override ours — CSS source order decides, not `className` attribute order
(G16). This is the accepted cost of rule 2. State it in the item description where it
matters; never paper over it by adding a dependency.

## Naming

Slugs are `kebab-case`, describe the effect then the element: `magnetic-button`,
`spotlight-card`, `draw-underline`. No `hover-` prefix — the domain already says it, and
`hoverui.com/r/hover-magnetic-button.json` stutters.

## The 90-minute rule

If the effect is not working after 90 minutes, stop. Move it to the Cut table in
`SCOPE.md` with one line on why, and start the next one. Eleven shipped effects beat
twelve half-built ones, and the cut list is a real artefact — it becomes a blog post
later.
