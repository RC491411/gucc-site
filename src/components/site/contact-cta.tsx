import { CtaOrb } from "@/components/site/cta-orb";
import { useLanguage } from "@/lib/language";

export function ContactCta() {
  const { t } = useLanguage();
  return <CtaOrb to="/contact" search={{ interest: "join" }} label={t.join.cta} ring={t.join.ring} />;
}
