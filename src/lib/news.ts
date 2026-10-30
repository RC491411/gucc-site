/**
 * Club news, newest first. To publish a new item (for example after a LinkedIn post),
 * add an entry at the top of NEWS. Images go in /public/news/.
 */

export const LINKEDIN_COMPANY_URL = "https://www.linkedin.com/company/geneva-university-commodities-club/";

export type NewsItem = {
  id: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  title: { en: string; fr: string };
  summary: { en: string; fr: string };
  image?: string;
  /** Public LinkedIn post URL, if the item was posted there. */
  linkedin?: string;
  /** Internal link (route) when the item points to a page of this site. */
  href?: string;
  tag: { en: string; fr: string };
};

export const NEWS: NewsItem[] = [
  {
    id: "official-launch",
    date: "2026-10-27",
    tag: { en: "Announcement", fr: "Annonce" },
    title: {
      en: "Commodities have a new home at the University of Geneva",
      fr: "Les matières premières ont une nouvelle maison à l'Université de Genève",
    },
    summary: {
      en: "Every day, a large share of the world's oil, grain, coffee and metals is traded from Geneva. GUCC is now officially a student association of the Université de Genève: energy, metals, agriculture, shipping and trade finance in one club. Workshops, expert panels and networking are coming soon.",
      fr: "Chaque jour, une grande part du pétrole, des céréales, du café et des métaux du monde se négocie depuis Genève. Le GUCC est désormais officiellement une association étudiante de l'Université de Genève : énergie, métaux, agricoles, shipping et trade finance réunis dans un seul club. Ateliers, panels d'experts et networking arrivent bientôt.",
    },
    image: "/news/launch.jpg",
    linkedin:
      "https://www.linkedin.com/posts/geneva-university-commodities-club_commodities-geneva-unige-activity-7520752731444101120-732a",
  },
  {
    id: "bylaws",
    date: "2026-09-01",
    tag: { en: "Foundation", fr: "Fondation" },
    title: {
      en: "Bylaws adopted in Geneva",
      fr: "Statuts adoptés à Genève",
    },
    summary: {
      en: "The association's bylaws were adopted on 1 September 2026 in Geneva. They set out the club's aims, its governance by a Committee and General Assembly, and its membership rules.",
      fr: "Les statuts de l'association ont été adoptés le 1er septembre 2026 à Genève. Ils fixent les buts du club, sa gouvernance par un Comité et une Assemblée générale, et ses règles d'adhésion.",
    },
    href: "/statuts",
  },
];

export function formatNewsDate(iso: string, lang: "en" | "fr") {
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-CH" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Zurich",
  }).format(d);
}
