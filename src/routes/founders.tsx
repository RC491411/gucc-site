import { createFileRoute } from "@tanstack/react-router";
import { FoundersPage } from "@/components/site/founders-page";
import { Shell } from "@/components/site/shell";

export const Route = createFileRoute("/founders")({
  head: () => ({
    meta: [{ title: "Founders · Geneva University Commodities Club" }],
  }),
  component: Founders,
});

function Founders() {
  return (
    <Shell>
      <FoundersPage />
    </Shell>
  );
}
