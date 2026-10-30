import { createFileRoute } from "@tanstack/react-router";
import { MarketsPage } from "@/components/pages/markets-page";
import { Shell } from "@/components/site/shell";
import { marketsPage } from "@/lib/pages";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: marketsPage.meta.en },
      { name: "description", content: marketsPage.lead.en },
    ],
  }),
  component: () => (
    <Shell>
      <MarketsPage />
    </Shell>
  ),
});
