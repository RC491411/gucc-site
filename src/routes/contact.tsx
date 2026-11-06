import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/site/contact-page";
import { Shell } from "@/components/site/shell";

export type ContactSearch = { interest?: string };

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    interest: typeof search.interest === "string" ? search.interest : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact · Geneva University Commodities Club" },
      { name: "description", content: "Write to the Geneva University Commodities Club at gucc.geneva@gmail.com or through the contact form." },
    ],
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
