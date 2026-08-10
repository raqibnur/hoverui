import { ChargeField } from "@/components/gallery/charge-field";
import { Gallery } from "@/components/gallery/gallery";
import { Hero } from "@/components/hero/hero";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader, SkipLink } from "@/components/site/site-header";

/**
 * The whole site is this one page (SCOPE.md), so this file is deliberately only its running
 * order. Each region owns its own markup, its own copy and the reasoning behind its layout:
 *
 *   components/site/site-header.tsx   the bezel, the nav menu and the skip link
 *   components/hero/hero.tsx          the headline, the install command, the logotype
 *   components/gallery/gallery.tsx    a section per group, mapped from lib/registry.ts
 *   components/site/site-footer.tsx   the two closing lines
 *
 * `main` sets the measure every one of them lines up against — max-w-6xl and px-6. The header
 * repeats that box rather than nesting inside it, because it sits outside `main` and has to
 * arrive at the same edges on its own.
 */
export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col">
      {/* The signature: the only colour on the page, and only under the pointer. */}
      <ChargeField />

      <SkipLink />
      <div className="mx-auto w-full max-w-6xl px-6">
        <SiteHeader />
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        <Hero />
        <Gallery />
      </main>

      <SiteFooter />
    </div>
  );
}
