/**
 * Two lines, both of them instructions rather than sign-off. The first tells a visitor what
 * the tiles will do if they point at them, the second states the page thesis outright — by
 * the time anyone reads this far they have seen the charge follow their cursor and the
 * sentence lands as a description rather than a claim.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--rule)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-8 font-mono text-xs text-[var(--mid)]">
        <span>
          Hover the tiles. Every effect names its own timing — track, release, curve.
        </span>
        <span>Colour on this page is a function of your cursor. Nothing else.</span>
      </div>
    </footer>
  );
}
