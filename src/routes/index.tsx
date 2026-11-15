import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/site/home-page";
import { Shell } from "@/components/site/shell";
import { pageHead, SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/")({ head: () => pageHead("/", SITE_NAME), component: Home });

function Home() {
  return (
    <Shell>
      <HomePage />
    </Shell>
  );
}
