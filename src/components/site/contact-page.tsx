import { Link, useSearch } from "@tanstack/react-router";
import { AlertTriangle, Check, ChevronRight, Loader2, Mail, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SplitText } from "@/components/motion/split-text";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

export const CONTACT_EMAIL = "gucc.geneva@gmail.com";
/** FormSubmit relays the form to the club inbox (no backend, no API key). */
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

const INTERESTS = ["join", "question", "partnership", "other"] as const;
type Interest = (typeof INTERESTS)[number];
type State = "idle" | "sending" | "success" | "activation" | "error";

function mailTo() {
  return `mailto:${CONTACT_EMAIL}`;
}


type FormSubmitResult = {
  ok: boolean;
  needsActivation: boolean;
  message: string;
};

async function postFormSubmit(payload: Record<string, string>): Promise<FormSubmitResult> {
  const parse = async (res: Response): Promise<FormSubmitResult> => {
    const raw = await res.text();
    let data: { success?: string | boolean; message?: string } = {};
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      /* Cloudflare / HTML error pages are not JSON */
    }
    const message = String(data.message ?? raw ?? "");
    const needsActivation = /activat|confirm your email|confirmation link|needs activation/i.test(message);
    const success =
      data.success === true ||
      data.success === "true" ||
      (/^\s*ok\s*$/i.test(message) && res.ok);
    // Activation replies are often success:"false" with an activation message.
    if (needsActivation) return { ok: false, needsActivation: true, message };
    return { ok: Boolean(res.ok && success), needsActivation: false, message };
  };

  // Documented AJAX path: JSON body + Accept application/json.
  let res = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  // Origin outages (Cloudflare 5xx) or empty bodies: retry once as urlencoded.
  if (res.status >= 500 || res.status === 408 || res.status === 429) {
    res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams(payload),
    });
  }

  return parse(res);
}

export function ContactPage() {
  const { t, lang } = useLanguage();
  const c = t.contactPage;
  const search = useSearch({ from: "/contact" });
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [programme, setProgramme] = useState("");
  const [interest, setInterest] = useState<Interest>("question");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<State>("idle");
  const formCard = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wanted = search.interest;
    if (wanted && (INTERESTS as readonly string[]).includes(wanted)) {
      setInterest(wanted as Interest);
    }
  }, [search.interest]);

  function onMailClick(e: MouseEvent<HTMLAnchorElement>) {
    // Some embedded previews block mailto navigation: try it, and copy the address as a fallback.
    e.preventDefault();
    try {
      window.open(e.currentTarget.href, "_blank", "noopener,noreferrer");
    } catch {
      /* ignore */
    }
    void navigator.clipboard?.writeText(CONTACT_EMAIL).then(
      () => toast.success(c.copied),
      () => toast.message(CONTACT_EMAIL),
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
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
        if (typeof key === "string" && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setState("sending");

    // Bots fill the hidden field: pretend it worked and send nothing.
    if (honey) {
      setState("success");
      return;
    }

    const payload: Record<string, string> = {
      name: parsed.data.name,
      email: parsed.data.from,
      programme: programme.trim() || "(not given)",
      request: t.contactPage.interests[interest],
      message: parsed.data.message,
      language: lang.toUpperCase(),
      _subject: "New message from gucc website",
      _template: "table",
      _captcha: "false",
      _replyto: parsed.data.from,
    };

    try {
      const result = await postFormSubmit(payload);
      if (result.needsActivation) {
        setState("activation");
        return;
      }
      if (!result.ok) throw new Error(result.message || "send failed");
      setState("success");
      setName("");
      setFrom("");
      setProgramme("");
      setMessage("");
    } catch {
      setState("error");
    }
  }

  const labelCls = "mb-1.5 block font-display text-xs uppercase tracking-widest text-navy/60";
  const errCls = "mt-1 font-serif text-sm text-down";

  return (
    <div className="relative overflow-hidden bg-ink text-paper">
      <div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_70%_10%,black,transparent_60%)]" />
      <div aria-hidden className="hero-glow absolute -right-40 -top-20 size-[38rem] rounded-full" />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-display text-xs uppercase tracking-widest text-steel">
          <Link to="/" className="hover:text-wheat">GUCC</Link>
          <ChevronRight className="size-3 text-copper" />
          <span className="text-ice">{c.kicker}</span>
        </nav>
        <p className="mt-10 flex items-center gap-3 font-display text-xs uppercase tracking-widest text-copper">
          <span className="font-mono text-wheat">06 / 06</span>
          <span className="hero-rule h-px w-12 bg-copper" />
          {c.kicker}
        </p>
        <SplitText
          as="h1"
          by="chars"
          immediate
          delay={150}
          stagger={22}
          text={c.title}
          className="mt-4 max-w-3xl pr-1 font-display text-4xl font-semibold uppercase leading-[0.92] tracking-tight sm:text-7xl"
        />
        <Reveal delay={350}>
          <p className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-ice">{c.lead}</p>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <Reveal delay={450} className="h-full">
            <article
              data-tilt="6"
              className="glow-card flex h-full min-h-72 flex-col justify-between rounded-xl bg-navy p-6 shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)] sm:p-8"
            >
              <div>
                <p className="font-display text-xs uppercase tracking-widest text-wheat">{c.emailLabel}</p>
                <a
                  href={mailTo()}
                  onClick={onMailClick}
                  className="mt-6 block break-all font-display text-3xl font-semibold uppercase leading-none tracking-tight text-paper underline-offset-4 hover:text-wheat hover:underline sm:text-4xl"
                >
                  {CONTACT_EMAIL}
                </a>
                <p className="mt-6 font-serif text-base text-ice">{c.place}</p>
              </div>
              <Button asChild size="lg" variant="secondary" className="mt-8 w-fit">
                <a href={mailTo()} onClick={onMailClick}>
                  <Mail className="size-4" />
                  {c.write}
                </a>
              </Button>
            </article>
          </Reveal>

          <Reveal delay={600} className="h-full">
            <div
              id="form"
              ref={formCard}
              className="relative h-full scroll-mt-28 overflow-hidden rounded-xl bg-paper p-6 text-ink shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)] sm:p-8"
            >
              {state === "success" ? (
                <div className="form-success flex min-h-[28rem] flex-col items-start justify-center" role="status" aria-live="polite">
                  <span className="success-badge flex size-20 items-center justify-center rounded-full bg-copper text-ink">
                    <Check className="size-10" strokeWidth={3} />
                  </span>
                  <h2 className="mt-8 font-display text-4xl font-semibold uppercase leading-none tracking-tight">
                    {c.successTitle}
                  </h2>
                  <p className="mt-4 max-w-md font-serif text-lg leading-relaxed text-navy/80">{c.successBody}</p>
                  <Button type="button" className="mt-8" onClick={() => setState("idle")}>
                    {c.again}
                  </Button>
                </div>
              ) : (
                <>
                  <p className="font-display text-xs uppercase tracking-widest text-copper">{c.formKicker}</p>
                  <h2 className="mt-3 font-display text-2xl font-semibold uppercase leading-none tracking-tight sm:text-3xl">
                    {c.formTitle}
                  </h2>
                  <p className="mt-3 font-serif text-base text-navy/70">{c.formLead}</p>
                  <form className="mt-6 grid gap-4" onSubmit={onSubmit} noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className={labelCls}>{c.name}</span>
                        <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="bg-navy/10 text-ink" />
                        {errors.name ? <p className={errCls}>{errors.name}</p> : null}
                      </label>
                      <label className="block">
                        <span className={labelCls}>{c.emailField}</span>
                        <Input
                          type="email"
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          autoComplete="email"
                          className="bg-navy/10 text-ink"
                        />
                        {errors.from ? <p className={errCls}>{errors.from}</p> : null}
                      </label>
                    </div>
                    <label className="block">
                      <span className={labelCls}>{c.programme}</span>
                      <Input
                        value={programme}
                        onChange={(e) => setProgramme(e.target.value)}
                        placeholder={c.programmeHint}
                        className="bg-navy/10 text-ink placeholder:text-navy/40"
                      />
                    </label>
                    <fieldset>
                      <legend className={labelCls}>{c.interest}</legend>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {INTERESTS.map((key) => (
                          <button
                            key={key}
                            type="button"
                            data-magnetic="0.2"
                            aria-pressed={interest === key}
                            onClick={() => setInterest(key)}
                            className={cn(
                              "h-11 rounded-md px-3 font-display text-xs uppercase tracking-widest transition-[background-color,color,box-shadow] duration-[var(--motion-quick)]",
                              interest === key
                                ? "bg-navy text-paper shadow-[0_0_0_1px_rgb(21_66_71)]"
                                : "bg-navy/5 text-navy shadow-[0_0_0_1px_rgb(224_138_46_/_0.45)] hover:bg-copper/15",
                            )}
                          >
                            {c.interests[key]}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <label className="block">
                      <span className={labelCls}>{c.message}</span>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="min-h-36 bg-navy/10 text-ink"
                      />
                      {errors.message ? <p className={errCls}>{errors.message}</p> : null}
                    </label>
                    {/* Honeypot for spam bots: hidden from people and assistive tech. */}
                    <input
                      type="text"
                      name="_honey"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honey}
                      onChange={(e) => setHoney(e.target.value)}
                      aria-hidden
                      className="absolute -left-[9999px] size-px opacity-0"
                    />
                    {state === "activation" ? (
                      <div role="status" className="flex gap-3 rounded-md bg-copper/15 p-4 text-ink shadow-[0_0_0_1px_rgb(224_138_46_/_0.55)]">
                        <Mail className="mt-0.5 size-5 shrink-0 text-copper" />
                        <div>
                          <p className="font-display text-sm uppercase tracking-wider">{c.activationTitle}</p>
                          <p className="mt-1 font-serif text-sm text-navy/80">{c.activationBody}</p>
                        </div>
                      </div>
                    ) : null}
                    {state === "error" ? (
                      <div role="alert" className="form-error flex gap-3 rounded-md bg-down/10 p-4 text-ink shadow-[0_0_0_1px_rgb(224_90_72_/_0.5)]">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-down" />
                        <div>
                          <p className="font-display text-sm uppercase tracking-wider">{c.errorTitle}</p>
                          <p className="mt-1 font-serif text-sm text-navy/80">
                            {c.errorBody}{" "}
                            <a href={mailTo()} className="underline underline-offset-2">
                              {CONTACT_EMAIL}
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <Button type="submit" size="lg" disabled={state === "sending"} className="min-w-48">
                        {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                        {state === "sending" ? c.sending : c.send}
                      </Button>
                      <p className="font-serif text-sm text-navy/60">
                        {c.fallback}{" "}
                        <a href={mailTo()} className="text-navy underline underline-offset-2 hover:text-copper">
                          {CONTACT_EMAIL}
                        </a>
                      </p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
