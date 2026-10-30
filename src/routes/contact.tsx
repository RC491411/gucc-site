import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/site/contact-page";
import { Shell } from "@/components/site/shell";

export type ContactSearch = { interest?: string };

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    interest: typeof search.interest === "string" ? search.interest : undefined,
  }),
  component: Contact,
});

function Contact() {
  return (
    <Shell>
      <ContactPage />
    </Shell>
  );
}
