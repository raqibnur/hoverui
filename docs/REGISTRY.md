# Registry mechanics

## Setup (once)

```bash
npx create-next-app@latest hoverui --typescript --tailwind --app --no-src-dir --eslint
cd hoverui
npx shadcn@latest init
npm i -D shadcn@latest
```

Add the build script to `package.json`:

```json
"scripts": {
  "registry:build": "shadcn build"
}
```

If `shadcn build` is not recognised, use `shadcn@canary` — the build command landed there
first and some releases still gate it.

## How it flows

```
registry.json  --(shadcn build)-->  public/r/<slug>.json  --(next serve)-->  hoverui.com/r/<slug>.json
```

- Item JSON is generated into `public/r/` by default. `--output` changes the directory.
- The catalog is served separately at `/r/registry.json`.
- Nothing is dynamic. These are static files behind a Next server, which is why hosting
  this is trivial and why it can move anywhere later.

Run `npm run registry:build` after every change to an effect file or to `registry.json`.
Forgetting this is the single most common way to ship a stale item — wire it into the
build step so it can't be skipped:

```json
"build": "npm run registry:build && next build"
```

## Verifying an item

Always from a separate throwaway project, never from this repo:

```bash
npx shadcn@latest add http://localhost:3000/r/magnetic-button.json
```

Check all four:

1. The file lands at `components/hover/magnetic-button.tsx`
2. No packages were installed
3. No manual edit to `globals.css` was needed
4. The effect works, including keyboard focus and reduced motion

## Deploy

Vercel, apex domain on `hoverui.com`. Zero-config matters more than control for this one —
the output is static JSON plus one marketing page. It can move to a VPS later in an
afternoon if that ever becomes worth doing.

Set `homepage` in `registry.json` to `https://hoverui.com` before the first deploy; it is
baked into metadata that consumers can read.

## Namespace (after launch, not before)

Once all 12 are live, open a PR adding HoverUI to `apps/v4/registry/directory.json` in
`shadcn-ui/ui`. Once merged, people install as:

```bash
npx shadcn@latest add @hoverui/magnetic-button
```

The registry must be open source and publicly accessible to be accepted. This is free,
durable distribution — but it is a launch-week task, not a build-week distraction. Direct
URL installs work perfectly without it.

## Guidelines that affect adoption

- Keep item `description` values scannable — they appear in `shadcn search`.
- `categories` should be one of `button`, `card`, `text`. Consistency makes the registry
  browsable; inventing a fourth category is scope creep.
- Never rename a slug after launch. The install URL is a public API.
