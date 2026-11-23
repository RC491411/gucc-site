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
    id: "round-table-save-the-date",
    date: "2026-11-17",
    tag: { en: "Event", fr: "Événement" },
    title: {
      en: "Save the date: Is Geneva still the hub that moves the world?",
      fr: "Save the date : Genève est-elle toujours le hub qui fait bouger le monde ?",
    },
    summary: {
      en: "Our first round table: Thursday 10 December 2026 at 18:30, Uni Mail, room MR060, University of Geneva. Geneva is one of the world's leading commodity trading hubs, but with competition from Dubai and Singapore, new regulations and shifting trade flows, can it keep its place? Moderated by Mathilde de Mareuil. Free entry, limited seats, followed by a networking apéro. Registration via the LinkedIn post.",
      fr: "Notre première table ronde : jeudi 10 décembre 2026 à 18h30, Uni Mail, salle MR060, Université de Genève. Genève est l'un des principaux hubs mondiaux du négoce de matières premières, mais face à la concurrence de Dubaï et de Singapour, aux nouvelles réglementations et à l'évolution des flux commerciaux, peut-elle garder sa place ? Modération : Mathilde de Mareuil. Entrée libre, places limitées, suivie d'un apéro networking. Inscription via le post LinkedIn.",
    },
    image: "/news/round-table-save-the-date.jpg",
    linkedin:
      "https://www.linkedin.com/posts/geneva-university-commodities-club_commodities-geneva-unige-activity-7528359299929255936-BSMa",
  },
  {
    id: "speaker-dave-behrends",
    date: "2026-11-23",
    tag: { en: "Speaker", fr: "Intervenant" },
    title: {
      en: "Meet the speaker: Dave Behrends, Sucafina",
      fr: "Intervenant : Dave Behrends, Sucafina",
    },
    summary: {
      en: "Dave Behrends, Managing Partner and Head of Trading at Sucafina, joins our round table on 10 December. He brings a hands-on perspective from the trading desk of a Geneva-based commodity merchant on how physical trade is evolving.",
      fr: "Dave Behrends, Managing Partner et Head of Trading chez Sucafina, rejoint notre table ronde du 10 décembre. Il apporte un regard concret, depuis la salle de trading d'un négociant genevois, sur l'évolution du négoce physique.",
    },
    image: "/news/speaker-dave-behrends.jpg",
    linkedin:
      "https://www.linkedin.com/posts/geneva-university-commodities-club_commodities-geneva-unige-activity-7530532643990441984-5h73",
  },
  {
    id: "speaker-deia-markova",
    date: "2026-11-19",
    tag: { en: "Speaker", fr: "Intervenante" },
    title: {
      en: "Meet the speaker: Deia Markova, BGN",
      fr: "Intervenante : Deia Markova, BGN",
    },
    summary: {
      en: "Deia Markova, Executive Director, Finance, ESG & Strategy at BGN, joins our round table on 10 December. Working at the crossroads of finance, strategy and sustainability, she shares her perspective on the forces shaping Geneva's future as a commodity hub.",
      fr: "Deia Markova, Executive Director, Finance, ESG & Strategy chez BGN, rejoint notre table ronde du 10 décembre. Au croisement de la finance, de la stratégie et de la durabilité, elle partage son regard sur les forces qui façonnent l'avenir de Genève comme hub des matières premières.",
    },
    image: "/news/speaker-deia-markova.jpg",
    linkedin:
      "https://www.linkedin.com/posts/geneva-university-commodities-club_commodities-geneva-unige-activity-7529092157077602305-I5Lu",
  },
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
