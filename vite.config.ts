import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** Every route, prerendered to static HTML at build time (output: dist/client). */
const SPA_SHELL_PATH = "/?spa-shell";
const STATIC_PAGES = ["/", "/missions", "/markets", "/news", "/founders", "/team", "/contact"];

export default defineConfig({
  base: "/",
  server: { host: "0.0.0.0", port: 8080, allowedHosts: true },
  preview: { host: "0.0.0.0", port: 8081 },
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      pages: STATIC_PAGES.map((path) => ({ path })),
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
        // Crawled links like /contact?interest=join or /#club map to the same file as their
        // base page; skip them so they never overwrite the clean prerendered HTML.
        filter: (page) => page.path === SPA_SHELL_PATH || !/[?#]/.test(page.path),
      },
      // SPA shell (root layout only, client renders the route) written to /404.html:
      // static hosts serve it for unknown URLs and the router shows the Not Found page.
      spa: { enabled: true, maskPath: SPA_SHELL_PATH, prerender: { outputPath: "/404", crawlLinks: false } },
    }),
    viteReact(),
  ],
});
