import { createFileRoute } from "@tanstack/react-router";
import { MissionsPage } from "@/components/pages/missions-page";
import { Shell } from "@/components/site/shell";
import { missionsPage } from "@/lib/pages";

export const Route = createFileRoute("/missions")({
  head: () => ({
    meta: [
      { title: missionsPage.meta.en },
      { name: "description", content: missionsPage.lead.en },
    ],
  }),
  component: () => (
    <Shell>
      <MissionsPage />
    </Shell>
  ),
});
