import { createFileRoute } from "@tanstack/react-router";
import { MissionsPage } from "@/components/pages/missions-page";
import { Shell } from "@/components/site/shell";
import { pageHead } from "@/lib/seo";
import { missionsPage } from "@/lib/pages";

export const Route = createFileRoute("/missions")({
  head: () => pageHead("/missions", `${missionsPage.meta.en.replace(" · Geneva University Commodities Club", "")} · GUCC Geneva University Commodities Club`, missionsPage.lead.en),
  component: () => (
    <Shell>
      <MissionsPage />
    </Shell>
  ),
});
