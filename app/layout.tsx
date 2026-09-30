import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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

/*
 * Runs before first paint, so a returning dark-theme visitor never sees a light frame. The
 * stored choice wins; with none, the OS preference decides. Kept tiny and inline because an
 * external file would arrive after the paint it exists to prevent. The toggle that writes
 * the key is components/site/theme-toggle.tsx.
 */
const THEME_SCRIPT = `try{var t=localStorage.getItem("hoverui-theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

/*
 * Microsoft Clarity, verbatim from their install snippet. Production only, so local and
 * preview sessions never land in the recordings.
 */
const CLARITY_SCRIPT = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "yq9lytqnm9");`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The theme script edits this element's class before React hydrates it.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        {process.env.NODE_ENV === "production" && (
          <Script id="clarity" strategy="afterInteractive">
            {CLARITY_SCRIPT}
          </Script>
        )}
      </body>
    </html>
  );
}
