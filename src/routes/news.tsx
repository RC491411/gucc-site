import { createFileRoute } from "@tanstack/react-router";
import { NewsPage } from "@/components/pages/news-page";
import { Shell } from "@/components/site/shell";
import { pageHead } from "@/lib/seo";
import { newsPage } from "@/lib/pages";

export const Route = createFileRoute("/news")({
  head: () => pageHead("/news", `${newsPage.meta.en.replace(" · Geneva University Commodities Club", "")} · GUCC Geneva University Commodities Club`, newsPage.lead.en),
  component: () => (
    <Shell>
      <NewsPage />
    </Shell>
  ),
});
