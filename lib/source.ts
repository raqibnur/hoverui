import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

/**
 * Reads an effect's source straight off disk so the code tab can never drift from the
 * file that actually ships. Do not cache-bust this by hand — it is read at build time.
 */
export async function readEffectSource(slug: string): Promise<string> {
  const file = path.join(process.cwd(), "registry", "hover", slug, `${slug}.tsx`);
  return fs.readFile(file, "utf-8");
}

type CssTree = { [selector: string]: string | CssTree };

const toCss = (tree: CssTree, depth = 0): string =>
  Object.entries(tree)
    .map(([key, value]) => {
      const pad = "  ".repeat(depth);
      return typeof value === "string"
        ? `${pad}${key}: ${value};`
        : `${pad}${key} {\n${toCss(value, depth + 1)}\n${pad}}`;
    })
    .join("\n");

/**
 * The registry item's `css` field, printed as the CSS the shadcn CLI writes into the
 * consumer's stylesheet — read from registry.json itself, so the install tab shows exactly
 * what ships. `null` for the effects that need no keyframes (most of them; CLAUDE.md rule 3).
 */
export async function readEffectCss(slug: string): Promise<string | null> {
  const file = path.join(process.cwd(), "registry.json");
  const registry = JSON.parse(await fs.readFile(file, "utf-8")) as {
    items: { name: string; css?: CssTree }[];
  };
  const css = registry.items.find((item) => item.name === slug)?.css;
  return css ? toCss(css) : null;
}
