import { createFileRoute } from "@tanstack/react-router";
import { MarketsPage } from "@/components/pages/markets-page";
import { Shell } from "@/components/site/shell";
import { pageHead } from "@/lib/seo";
import { marketsPage } from "@/lib/pages";

export const Route = createFileRoute("/markets")({
  head: () => pageHead("/markets", `${marketsPage.meta.en.replace(" · Geneva University Commodities Club", "")} · GUCC Geneva University Commodities Club`, marketsPage.lead.en),
  component: () => (
    <Shell>
      <MarketsPage />
    </Shell>
  ),
});
