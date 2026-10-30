import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/site/contact-page";
import { Shell } from "@/components/site/shell";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  return (
    <Shell>
      <ContactPage />
    </Shell>
  );
}
