/**
 * Copy for the dedicated Missions, Markets and News pages (EN and FR).
 * General, factual explanations only: nothing here describes events, partners or numbers of the club.
 */

type L = { en: string; fr: string };
type LL = { en: string[]; fr: string[] };

export const seeMore: L = { en: "See more", fr: "En savoir plus" };

export const missionsPage = {
  meta: {
    en: "Missions · Geneva University Commodities Club",
    fr: "Missions · Geneva University Commodities Club",
  },
  kicker: { en: "Missions", fr: "Missions" },
  title: { en: "Four missions. One craft: trading.", fr: "Quatre missions. Un seul métier : le négoce." },
  lead: {
    en: "Training, analysis, conferences and networking are four doors into the same profession. Together they form the club's programme, built for students of the University of Geneva.",
    fr: "Formation, analyse, conférences et networking sont quatre portes vers un même métier. Ensemble, elles forment le programme du club, pensé pour les étudiants de l'Université de Genève.",
  },
  scroll: { en: "Scroll through the four missions", fr: "Faites défiler les quatre missions" },
  focus: { en: "What it covers", fr: "Ce que cela couvre" },
  outroTitle: { en: "The first activities are on their way.", fr: "Les premières activités arrivent." },
  outroBody: {
    en: "Workshops, expert panels and networking will be announced on our News page and on LinkedIn.",
    fr: "Ateliers, panels d'experts et networking seront annoncés sur notre page Actualités et sur LinkedIn.",
  },
  outroNews: { en: "Read the news", fr: "Lire les actualités" },
  outroJoin: { en: "Join the club", fr: "Rejoindre le club" },
  items: {
    formation: {
      intro: {
        en: "Workshops are designed to move from the lecture hall to the desk: how a physical trade is structured, priced, financed, shipped and hedged.",
        fr: "Les ateliers font passer de l'auditoire au desk : comment un deal physique est structuré, valorisé, financé, expédié et couvert.",
      },
      topics: {
        en: [
          "Anatomy of a physical trade, from purchase to delivery",
          "Incoterms, letters of credit and trade finance",
          "Shipping and maritime law: charter parties, bills of lading",
          "ESG and responsible sourcing questions in the sector",
        ],
        fr: [
          "Anatomie d'un deal physique, de l'achat à la livraison",
          "Incoterms, lettres de crédit et trade finance",
          "Shipping et droit maritime : chartes-parties, connaissements",
          "Questions ESG et d'approvisionnement responsable du secteur",
        ],
      } as LL,
    },
    analyse: {
      intro: {
        en: "Markets are read on two levels: the physical flows of barrels, tonnes and bushels, and the financial instruments built on top of them.",
        fr: "Les marchés se lisent à deux niveaux : les flux physiques de barils, de tonnes et de boisseaux, et les instruments financiers construits par-dessus.",
      },
      topics: {
        en: [
          "Supply and demand balances for energy, metals and agriculture",
          "Futures curves, spreads and basis",
          "Hedging simulations and risk management",
          "Case studies built from public market data",
        ],
        fr: [
          "Bilans offre et demande pour l'énergie, les métaux et les agricoles",
          "Courbes à terme, spreads et base",
          "Simulations de couverture et gestion du risque",
          "Études de cas construites sur des données de marché publiques",
        ],
      } as LL,
    },
    conferences: {
      intro: {
        en: "The club aims to bring practitioners and academics into the university to discuss what moves international trade.",
        fr: "Le club veut faire venir praticiens et académiques à l'université pour débattre de ce qui fait bouger le commerce international.",
      },
      topics: {
        en: [
          "Roundtables on geopolitics and trade routes",
          "Expert panels on markets and the energy transition",
          "Thematic evenings on regulation and transparency",
          "Formats designed for students of the University of Geneva",
        ],
        fr: [
          "Tables rondes sur la géopolitique et les routes commerciales",
          "Panels d'experts sur les marchés et la transition énergétique",
          "Soirées thématiques sur la régulation et la transparence",
          "Des formats pensés pour les étudiants de l'Université de Genève",
        ],
      } as LL,
    },
    networking: {
      intro: {
        en: "Geneva brings together trading houses, banks, inspection companies, shipping firms and international organisations. The club wants its members to meet them.",
        fr: "Genève réunit maisons de négoce, banques, sociétés d'inspection, armateurs et organisations internationales. Le club veut que ses membres les rencontrent.",
      },
      topics: {
        en: [
          "Meetings with professionals of the Geneva trading ecosystem",
          "Insights into trading, operations, risk and trade finance careers",
          "Links with alumni and other student associations",
          "A small circle of ten members, close to the desks",
        ],
        fr: [
          "Rencontres avec les professionnels de l'écosystème genevois du négoce",
          "Regards sur les métiers du trading, des opérations, du risque et du trade finance",
          "Des liens avec les alumni et d'autres associations étudiantes",
          "Un petit cercle de dix membres, proche des desks",
        ],
      } as LL,
    },
  },
};

export const marketsPage = {
  meta: {
    en: "Markets · Geneva University Commodities Club",
    fr: "Marchés · Geneva University Commodities Club",
  },
  kicker: { en: "Markets", fr: "Marchés" },
  title: { en: "The world in three books.", fr: "Le monde en trois carnets." },
  lead: {
    en: "Energy, metals and agriculture are the three pillars of the trade we study. Pick a desk, read each commodity and see why Geneva matters for it.",
    fr: "Énergie, métaux et agricoles sont les trois piliers du négoce que nous étudions. Choisissez un desk, lisez chaque matière première et voyez pourquoi Genève compte pour elle.",
  },
  dataNote: {
    en: "Crude, gas, gold and silver show the last published quote with its 24 hour move. The others are reference levels, not a live feed.",
    fr: "Le brut, le gaz, l'or et l'argent affichent le dernier cours publié et sa variation sur 24 h. Les autres sont des niveaux de référence, pas un flux en direct.",
  },
  whyGeneva: { en: "Why Geneva", fr: "Pourquoi Genève" },
  prev: { en: "24 h ago", fr: "Il y a 24 h" },
  now: { en: "Last", fr: "Dernier" },
  referenceLevel: { en: "Reference level", fr: "Niveau de référence" },
  live: { en: "Last published quote", fr: "Dernier cours publié" },
  desks: {
    energy: {
      lead: {
        en: "Crude oil, refined products and natural gas power transport, industry and heating. Their prices react to production decisions, inventories, refinery margins and geopolitics.",
        fr: "Pétrole brut, produits raffinés et gaz naturel alimentent transport, industrie et chauffage. Leurs prix réagissent aux décisions de production, aux stocks, aux marges de raffinage et à la géopolitique.",
      },
      geneva: {
        en: "Geneva hosts the trading desks of several of the world's largest independent energy traders, as well as the banks, inspection companies and shipping firms that finance, certify and carry their cargoes.",
        fr: "Genève accueille les desks de plusieurs des plus grands négociants indépendants en énergie au monde, ainsi que les banques, sociétés d'inspection et armateurs qui financent, certifient et transportent leurs cargaisons.",
      },
    },
    metals: {
      lead: {
        en: "Precious metals store value, base metals build the economy. Gold and silver follow rates and risk appetite, copper and aluminium follow industry, construction and electrification.",
        fr: "Les métaux précieux conservent la valeur, les métaux de base construisent l'économie. L'or et l'argent suivent les taux et l'appétit pour le risque, le cuivre et l'aluminium suivent l'industrie, la construction et l'électrification.",
      },
      geneva: {
        en: "Switzerland is a global hub for metals: Swiss refineries process a large share of the world's gold, and major mining and metals traders operate from the Lake Geneva region and Zug.",
        fr: "La Suisse est une plaque tournante mondiale des métaux : ses raffineries traitent une grande part de l'or mondial, et de grands négociants miniers et de métaux opèrent depuis la région lémanique et Zoug.",
      },
    },
    ag: {
      lead: {
        en: "Grains and softs feed the world. Weather, harvests, export policies and freight routes drive their prices, which makes them a direct read on food security.",
        fr: "Céréales et softs nourrissent le monde. Météo, récoltes, politiques d'exportation et routes maritimes font leurs prix, ce qui en fait une lecture directe de la sécurité alimentaire.",
      },
      geneva: {
        en: "The Lake Geneva region is home to leading merchants of grains, oilseeds, sugar, coffee and cotton, and much of the freight that moves these crops is chartered from the same area.",
        fr: "La région lémanique abrite de grands négociants en céréales, oléagineux, sucre, café et coton, et une bonne partie du fret qui transporte ces récoltes est affrétée depuis la même région.",
      },
    },
  },
  commodities: {
    BRENT: {
      en: "The benchmark for North Sea crude, used to price a large part of the crude oil traded internationally.",
      fr: "La référence du brut de mer du Nord, utilisée pour fixer le prix d'une grande partie du pétrole échangé à l'international.",
    },
    WTI: {
      en: "West Texas Intermediate, the US crude benchmark delivered at Cushing, Oklahoma. Its spread to Brent reflects transport costs and regional balances.",
      fr: "West Texas Intermediate, la référence américaine livrée à Cushing, Oklahoma. Son écart avec le Brent reflète le transport et les équilibres régionaux.",
    },
    NATGAS: {
      en: "Henry Hub natural gas, the US reference price. Gas links power generation, heating, industry and LNG shipping.",
      fr: "Le gaz naturel Henry Hub, prix de référence américain. Le gaz relie production d'électricité, chauffage, industrie et transport de GNL.",
    },
    GOLD: {
      en: "Store of value and central bank reserve asset. It tends to react to real interest rates, the dollar and periods of uncertainty.",
      fr: "Valeur refuge et actif de réserve des banques centrales. Il réagit aux taux réels, au dollar et aux périodes d'incertitude.",
    },
    SILVER: {
      en: "Half precious, half industrial: used in solar panels and electronics as well as in jewellery and investment.",
      fr: "Moitié précieux, moitié industriel : utilisé dans les panneaux solaires et l'électronique autant que dans la bijouterie et l'investissement.",
    },
    COPPER: {
      en: "The metal of electrification, found in grids, motors and buildings. Its price is often read as a barometer of global industry.",
      fr: "Le métal de l'électrification, présent dans les réseaux, les moteurs et les bâtiments. Son prix est souvent lu comme un baromètre de l'industrie mondiale.",
    },
    ALU: {
      en: "Light, recyclable and energy intensive to produce, so its cost is closely tied to power prices. Used in transport, packaging and construction.",
      fr: "Léger, recyclable et très énergivore à produire, son coût est étroitement lié au prix de l'électricité. Utilisé dans le transport, l'emballage et la construction.",
    },
    WHEAT: {
      en: "The world's first calorie. Weather, export policies and Black Sea corridors move its price.",
      fr: "La première calorie du monde. Météo, politiques d'exportation et corridors de la mer Noire font bouger son prix.",
    },
    CORN: {
      en: "Feed, food and ethanol at once. The United States, Brazil, Argentina and Ukraine are among the leading exporters.",
      fr: "À la fois aliment du bétail, nourriture et éthanol. Les États-Unis, le Brésil, l'Argentine et l'Ukraine figurent parmi les principaux exportateurs.",
    },
    COCOA: {
      en: "Grown mostly in West Africa, especially Côte d'Ivoire and Ghana. Weather and crop disease make it one of the most volatile soft commodities.",
      fr: "Cultivé surtout en Afrique de l'Ouest, notamment en Côte d'Ivoire et au Ghana. Météo et maladies des cultures en font l'un des softs les plus volatils.",
    },
  } as Record<string, L>,
};

export const newsPage = {
  meta: {
    en: "News · Geneva University Commodities Club",
    fr: "Actualités · Geneva University Commodities Club",
  },
  kicker: { en: "News", fr: "Actualités" },
  title: { en: "The club's logbook.", fr: "Le carnet du club." },
  lead: {
    en: "Announcements, events and milestones of the Geneva University Commodities Club, published first on LinkedIn.",
    fr: "Annonces, événements et étapes du Geneva University Commodities Club, publiés d'abord sur LinkedIn.",
  },
  latest: { en: "Latest", fr: "À la une" },
  timeline: { en: "Timeline", fr: "Chronologie" },
  next: { en: "Next entry", fr: "Prochaine entrée" },
  nextBody: {
    en: "Our next posts will appear here. Follow the club on LinkedIn to see them first.",
    fr: "Nos prochaines publications apparaîtront ici. Suivez le club sur LinkedIn pour les voir en premier.",
  },
  ring: { en: "Follow GUCC on LinkedIn · ", fr: "Suivre le GUCC sur LinkedIn · " },
};
