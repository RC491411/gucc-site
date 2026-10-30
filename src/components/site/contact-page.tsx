import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { useState, type FormEvent, type MouseEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/language";

const EMAIL = "info@guccgeneva.com";

function mailTo(subject?: string, body?: string) {
  const parts: string[] = [];
  if (subject) parts.push(`subject=${encodeURIComponent(subject)}`);
  if (body) parts.push(`body=${encodeURIComponent(body)}`);
  return parts.length ? `mailto:${EMAIL}?${parts.join("&")}` : `mailto:${EMAIL}`;
}

function launchMail(href: string, copiedMsg: string) {
  try {
    window.open(href, "_blank", "noopener,noreferrer");
  } catch {
    /* preview iframes block mailto navigation */
  }
  void navigator.clipboard.writeText(EMAIL).then(
    () => toast.success(copiedMsg),
    () => toast.message(EMAIL),
  );
}

export function ContactPage() {
  const { t, lang } = useLanguage();
  const c = t.contactPage;
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onMailClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    launchMail(e.currentTarget.href, c.copied);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const schema = z.object({
      name: z.string().trim().min(1, c.errors.required),
      from: z.string().trim().email(c.errors.email),
      message: z.string().trim().min(1, c.errors.required),
    });
    const parsed = schema.safeParse({ name, from, message });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    const subject =
      lang === "fr"
        ? "Question au Geneva University Commodities Club"
        : "Question for the Geneva University Commodities Club";
    const body = `${parsed.data.message}

—
${parsed.data.name}
${parsed.data.from}`;
    launchMail(mailTo(subject, body), c.copied);
  }

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <Link
          to="/"
          className="inline-flex h-11 items-center gap-2 font-display text-sm uppercase tracking-widest text-copper hover:text-wheat"
        >
          <ArrowLeft className="size-4" />
          {lang === "fr" ? "Retour" : "Back"}
        </Link>
        <p className="mt-10 font-display text-xs uppercase tracking-widest text-copper">{c.kicker}</p>
        <h1 className="mt-3 max-w-2xl pr-1 font-display text-3xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-6xl">
          {c.title}
        </h1>
        <p className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-ice">{c.lead}</p>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <article className="flex min-h-80 flex-col justify-between rounded-xl bg-navy p-6 shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)] sm:p-8 lg:aspect-square">
            <div>
              <p className="font-display text-xs uppercase tracking-widest text-wheat">{c.emailLabel}</p>
              <a
                href={mailTo()}
                onClick={onMailClick}
                className="mt-6 block break-all font-display text-3xl font-semibold uppercase leading-none tracking-tight text-paper underline-offset-4 hover:text-wheat hover:underline sm:text-4xl"
              >
                {EMAIL}
              </a>
              <p className="mt-6 font-serif text-base text-ice">{c.place}</p>
            </div>
            <Button asChild size="lg" className="mt-8 w-fit">
              <a href={mailTo()} onClick={onMailClick}>
                <Mail className="size-4" />
                {c.write}
              </a>
            </Button>
          </article>

          <article className="flex min-h-80 flex-col rounded-xl bg-paper p-6 text-ink shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)] sm:p-8 lg:aspect-square">
            <p className="font-display text-xs uppercase tracking-widest text-copper">{c.cardKicker}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold uppercase leading-none tracking-tight sm:text-3xl">
              {c.cardTitle}
            </h2>
            <form className="mt-6 flex flex-1 flex-col gap-3" onSubmit={onSubmit}>
              <label className="block">
                <span className="mb-1.5 block font-display text-xs uppercase tracking-widest text-navy/60">
                  {c.name}
                </span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="bg-navy/10 text-ink"
                />
                {errors.name ? <p className="mt-1 font-serif text-sm text-down">{errors.name}</p> : null}
              </label>
              <label className="block">
                <span className="mb-1.5 block font-display text-xs uppercase tracking-widest text-navy/60">
                  {c.emailField}
                </span>
                <Input
                  type="email"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  autoComplete="email"
                  className="bg-navy/10 text-ink"
                />
                {errors.from ? <p className="mt-1 font-serif text-sm text-down">{errors.from}</p> : null}
              </label>
              <label className="block flex-1">
                <span className="mb-1.5 block font-display text-xs uppercase tracking-widest text-navy/60">
                  {c.message}
                </span>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-24 bg-navy/10 text-ink"
                />
                {errors.message ? <p className="mt-1 font-serif text-sm text-down">{errors.message}</p> : null}
              </label>
              <Button type="submit" className="mt-auto w-fit">
                <Mail className="size-4" />
                {c.send}
              </Button>
            </form>
          </article>
        </div>
      </div>
    </div>
  );
}
