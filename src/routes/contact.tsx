import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/site/contact-page";
import { Shell } from "@/components/site/shell";
import { pageHead } from "@/lib/seo";

export type ContactSearch = { interest?: string };

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    interest: typeof search.interest === "string" ? search.interest : undefined,
  }),
  head: () => pageHead("/contact", "Contact · GUCC Geneva University Commodities Club", "Write to the GUCC, the Geneva University Commodities Club, at gucc.geneva@gmail.com or through the contact form."),
  component: Contact,
});

function Contact() {
  return (
    <Shell>
      <ContactPage />
    </Shell>
  );
}
