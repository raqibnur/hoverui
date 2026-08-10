import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Body / UI. Falls back to Inter Tight per docs/DESIGN.md if Geist is unavailable.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face for the H1 and section headings. The width axis is why this face was
// chosen — do not substitute it.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

const DESCRIPTION =
  "Twelve hover effects. One file each. No dependencies. Installable with the shadcn CLI. Built for landing pages, not dashboards.";

export const metadata: Metadata = {
  /*
   * metadataBase is what makes app/opengraph-image.png resolve to an absolute URL. Without
   * it Next emits a relative og:image, which every crawler drops — the card renders blank
   * and the failure is invisible from inside the app, because the page itself looks fine.
   */
  metadataBase: new URL("https://hoverui.com"),
  title: "HoverUI — hover effects for React and Tailwind",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: "https://hoverui.com",
    siteName: "HoverUI",
    title: "HoverUI — hover effects for React and Tailwind",
    description: DESCRIPTION,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "HoverUI — hover effects for React and Tailwind",
    description: DESCRIPTION,
  },
  // app/favicon.ico is picked up by the file convention; nothing to declare here.
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
