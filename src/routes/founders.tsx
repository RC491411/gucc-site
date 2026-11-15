import { createFileRoute } from "@tanstack/react-router";
import { FoundersPage } from "@/components/site/founders-page";
import { Shell } from "@/components/site/shell";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/founders")({
  head: () => pageHead("/founders", "Founders · GUCC Geneva University Commodities Club", "Meet the four co-founders of the GUCC, the Geneva University Commodities Club: Jeremy Lambert, Aris Ismajli, Mamadou Bah and Rafael Calado."),
  component: Founders,
});

function Founders() {
  return (
    <Shell>
      <FoundersPage />
    </Shell>
  );
}
