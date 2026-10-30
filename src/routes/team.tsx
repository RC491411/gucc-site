import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { TeamPage } from "@/components/site/team-page";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [{ title: "Team · Geneva University Commodities Club" }],
  }),
  component: Team,
});

function Team() {
  return (
    <Shell>
      <TeamPage />
    </Shell>
  );
}
