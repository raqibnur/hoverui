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
