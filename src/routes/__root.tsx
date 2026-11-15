import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { LanguageProvider } from "@/lib/language";
import { MotionRoot } from "@/components/motion/motion-root";
import { Toaster } from "sonner";
import { NotFound } from "@/components/site/not-found";
import appCss from "../styles.css?url";
import { DEFAULT_DESCRIPTION, GOOGLE_SITE_VERIFICATION, SITE_NAME, organizationJsonLd, websiteJsonLd } from "@/lib/seo";


export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_NAME },
      { name: "description", content: DEFAULT_DESCRIPTION },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#0c1c1e" },
      ...(GOOGLE_SITE_VERIFICATION ? [{ name: "google-site-verification", content: GOOGLE_SITE_VERIFICATION }] : []),
      { property: "og:site_name", content: "Geneva University Commodities Club" },
      { property: "og:title", content: SITE_NAME },
      { property: "og:description", content: DEFAULT_DESCRIPTION },
      { property: "og:image", content: "https://www.gucc.ch/og.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_GB" },
      { property: "og:locale:alternate", content: "fr_CH" },
      { property: "og:url", content: "https://www.gucc.ch/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://www.gucc.ch/og.png" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify([organizationJsonLd, websiteJsonLd]) },
      {
        children:
          "document.documentElement.classList.add('js');if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reduced-motion')",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap",
      },
    ],
  }),
  notFoundComponent: NotFound,
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <LanguageProvider>
            <MotionRoot />
            <Outlet />
            <Toaster
              position="bottom-right"
              toastOptions={{
                className:
                  "!bg-navy !text-paper !border-0 !shadow-[0_0_0_1px_rgb(244_240_230_/_0.12)] !font-serif",
              }}
            />
          </LanguageProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
