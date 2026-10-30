import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "gucc-membership-request";

type Status = "unige" | "other" | "alumni";

function schema(required: string, emailMsg: string, consentMsg: string) {
  return z.object({
    first: z.string().trim().min(1, required),
    last: z.string().trim().min(1, required),
    email: z.string().trim().email(emailMsg),
    status: z.enum(["unige", "other", "alumni"]),
    programme: z.string().trim().min(1, required),
    message: z.string().trim().min(1, required),
    consent: z.boolean().refine((v) => v === true, { message: consentMsg }),
  });
}

function composeLetter(
  lang: "fr" | "en",
  data: {
    first: string;
    last: string;
    email: string;
    status: Status;
    programme: string;
    message: string;
  },
) {
  const statusLabel =
    lang === "fr"
      ? { unige: "étudiant·e immatriculé·e à l'Université de Genève", other: "étudiant·e d'une autre haute école / université", alumni: "ancien·ne étudiant·e de l'Université de Genève" }
      : { unige: "student enrolled at the University of Geneva", other: "student at another university / college", alumni: "alumnus/alumna of the University of Geneva" };

  if (lang === "fr") {
    return `Comité du Geneva University Commodities Club
Objet : demande d'admission

Mesdames, Messieurs,

Je soussigné·e ${data.first} ${data.last} (${data.email}), ${statusLabel[data.status]}, programme : ${data.programme}, souhaite devenir membre du Geneva University Commodities Club et souscris à ses buts.

Motivation :
${data.message}

Je forme par la présente ma demande écrite auprès du Comité.

Cordialement,
${data.first} ${data.last}`;
  }

  return `Committee of the Geneva University Commodities Club
Re: membership application

Dear Committee,

I, ${data.first} ${data.last} (${data.email}), ${statusLabel[data.status]}, programme: ${data.programme}, wish to become a member of the Geneva University Commodities Club and subscribe to its aims.

Motivation:
${data.message}

I hereby submit my written request to the Committee.

Yours sincerely,
${data.first} ${data.last}`;
}

export function JoinForm() {
  const { t, lang } = useLanguage();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("unige");
  const [programme, setProgramme] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [letter, setLetter] = useState<string | null>(null);

  const parsedSchema = useMemo(
    () => schema(t.join.errors.required, t.join.errors.email, t.join.errors.consent),
    [t],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = parsedSchema.safeParse({
      first,
      last,
      email,
      status,
      programme,
      message,
      consent: consent ? true : false,
    });
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    const text = composeLetter(lang, result.data);
    setLetter(text);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...result.data, at: Date.now(), lang }));
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t.join.copied);
    } catch {
      toast.success(t.join.saved);
    }
  }

  async function copyAgain() {
    if (!letter) return;
    await navigator.clipboard.writeText(letter);
    toast.success(t.join.copied);
  }

  const field = "space-y-1.5";
  const labelCls = "block font-display text-xs uppercase tracking-[0.16em] text-steel";
  const errCls = "font-serif text-xs text-down";

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={field}>
          <label htmlFor="first" className={labelCls}>
            {t.join.fields.first}
          </label>
          <Input id="first" value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" />
          {errors.first ? <p className={errCls}>{errors.first}</p> : null}
        </div>
        <div className={field}>
          <label htmlFor="last" className={labelCls}>
            {t.join.fields.last}
          </label>
          <Input id="last" value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" />
          {errors.last ? <p className={errCls}>{errors.last}</p> : null}
        </div>
      </div>
      <div className={field}>
        <label htmlFor="email" className={labelCls}>
          {t.join.fields.email}
        </label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        {errors.email ? <p className={errCls}>{errors.email}</p> : null}
      </div>
      <div className={field}>
        <p className={labelCls}>{t.join.fields.status}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["unige", "other", "alumni"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setStatus(code)}
              className={cn(
                "h-11 rounded-md px-3 text-left font-serif text-sm transition-[background-color,box-shadow] duration-[var(--motion-quick)]",
                status === code
                  ? "bg-copper text-ink"
                  : "bg-ink/30 text-paper shadow-[0_0_0_1px_rgb(224_138_46_/_0.3)] hover:bg-copper/15",
              )}
            >
              {t.join.status[code]}
            </button>
          ))}
        </div>
      </div>
      <div className={field}>
        <label htmlFor="programme" className={labelCls}>
          {t.join.fields.programme}
        </label>
        <Input id="programme" value={programme} onChange={(e) => setProgramme(e.target.value)} />
        {errors.programme ? <p className={errCls}>{errors.programme}</p> : null}
      </div>
      <div className={field}>
        <label htmlFor="message" className={labelCls}>
          {t.join.fields.message}
        </label>
        <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
        {errors.message ? <p className={errCls}>{errors.message}</p> : null}
      </div>
      <label className="flex items-start gap-3 text-sm text-ice">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 size-4 shrink-0 accent-copper"
        />
        <span>{t.join.fields.consent}</span>
      </label>
      {errors.consent ? <p className={errCls}>{errors.consent}</p> : null}
      <Button type="submit" size="lg">
        {t.join.submit}
      </Button>

      {letter ? (
        <div className="space-y-3 rounded-xl bg-ink/50 p-4 shadow-[0_0_0_1px_rgb(244_240_230_/_0.1)]">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-xs uppercase tracking-[0.16em] text-steel">{t.join.preview}</p>
            <Button type="button" variant="secondary" size="sm" onClick={copyAgain}>
              {t.join.copyBtn}
            </Button>
          </div>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap font-serif text-sm leading-relaxed text-paper">{letter}</pre>
        </div>
      ) : null}
    </form>
  );
}
