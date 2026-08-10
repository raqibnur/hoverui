import { ImageResponse } from "next/og";

/**
 * The link preview. Generated rather than shipped as a binary so it stays in sync with the
 * palette: the tokens below are the literal values from docs/DESIGN.md, because Satori
 * resolves no CSS custom properties and no stylesheet — it only sees this file's inline
 * styles. If a token changes in globals.css it must be changed here too; there is no way
 * to make that automatic without loading the whole page, which this route deliberately
 * does not do.
 *
 * No custom font is loaded. Bricolage Grotesque would need its .ttf read off disk at build
 * time, and a 400KB asset committed for one image is a poor trade when the fallback is a
 * clean grotesque at display size.
 *
 * Satori requires an explicit `display: flex` on any element with more than one child — it
 * has no block layout. Every container below sets it.
 */
export const alt =
  "HoverUI — twelve hover effects for React and Tailwind, one file each, no dependencies";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#E7E9E4";
const INK = "#14150F";
const MID = "#646860";
const RULE = "#CDD1C8";
const BRAND = "#FF5400";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "72px 80px",
        }}
      >
        {/*
         * The charge, standing in for the thing the whole page is about: colour that only
         * exists under the pointer. A share card has no pointer, so it is pinned where the
         * cursor would be if someone were reading the title.
         */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 520,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: BRAND,
            opacity: 0.14,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              background: BRAND,
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: MID,
              display: "flex",
            }}
          >
            hoverui.com
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.05,
              letterSpacing: -3,
              color: INK,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex" }}>Hover effects for</div>
            <div style={{ display: "flex" }}>React and Tailwind.</div>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 32,
              color: MID,
              display: "flex",
            }}
          >
            Twelve of them. One file each. No dependencies.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderTop: `1px solid ${RULE}`,
            paddingTop: 28,
            fontSize: 26,
            color: INK,
          }}
        >
          npx shadcn@latest add hoverui.com/r/magnetic-button.json
        </div>
      </div>
    ),
    size,
  );
}
