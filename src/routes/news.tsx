import { createFileRoute } from "@tanstack/react-router";
import { NewsPage } from "@/components/pages/news-page";
import { Shell } from "@/components/site/shell";
import { newsPage } from "@/lib/pages";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: newsPage.meta.en },
      { name: "description", content: newsPage.lead.en },
    ],
  }),
  component: () => (
    <Shell>
      <NewsPage />
    </Shell>
  ),
});
