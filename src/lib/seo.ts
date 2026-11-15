/** SEO helpers: one canonical URL, title, description and Open Graph set per prerendered page. */
import { LINKEDIN_COMPANY_URL } from "@/lib/news";

export const SITE_URL = "https://www.gucc.ch";
export const SITE_NAME = "GUCC · Geneva University Commodities Club";

/**
 * Google Search Console "HTML tag" token. Leave empty until Rafael copies the content value
 * from Search Console (Settings → Ownership verification → HTML tag). Preferred alternative:
 * a DNS TXT record on gucc.ch (Domain property), which needs no code change.
 */
export const GOOGLE_SITE_VERIFICATION = "jXFLlS7c8mnt_LJbI21pLtgw-PBL7M9zcTFZJ54cpxg";

export const DEFAULT_DESCRIPTION =
  "GUCC, the Geneva University Commodities Club: student association of the University of Geneva (UNIGE) for commodity trading. Training, market analysis, conferences and networking in Geneva.";

export function pageHead(path: string, title: string, description: string = DEFAULT_DESCRIPTION) {
  const url = `${SITE_URL}${path === "/" ? "/" : `${path.replace(/\/$/, "")}/`}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Geneva University Commodities Club",
  alternateName: "GUCC",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo-badge.png`,
  image: `${SITE_URL}/og.png`,
  email: "gucc.geneva@gmail.com",
  foundingDate: "2026-09-01",
  description: DEFAULT_DESCRIPTION,
  address: { "@type": "PostalAddress", addressLocality: "Genève", addressCountry: "CH" },
  parentOrganization: { "@type": "CollegeOrUniversity", name: "Université de Genève", url: "https://www.unige.ch/" },
  founder: ["Jeremy Lambert", "Aris Ismajli", "Mamadou Bah", "Rafael Calado"].map((name) => ({ "@type": "Person", name })),
  sameAs: [LINKEDIN_COMPANY_URL],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "GUCC · Geneva University Commodities Club",
  alternateName: ["GUCC", "gucc.ch"],
  url: `${SITE_URL}/`,
  inLanguage: ["en", "fr"],
  publisher: { "@id": `${SITE_URL}/#organization` },
};
