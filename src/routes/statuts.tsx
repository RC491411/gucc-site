import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";
import { StatutsPage } from "@/components/site/statuts-page";

export const Route = createFileRoute("/statuts")({ component: Statuts });

function Statuts() {
  return (
    <Shell>
      <StatutsPage />
    </Shell>
  );
}
