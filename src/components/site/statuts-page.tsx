import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/reveal";
import { SplitText } from "@/components/motion/split-text";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language";

const ARTICLES = [
  {
    id: "preamble",
    title: "Préambule",
    body: "Toute désignation de personne, de statut ou de fonction dans les présents statuts vise indifféremment l'homme ou la femme.",
  },
  {
    id: "art1",
    title: "1. Constitution et nom",
    body: "Sous le nom « Geneva Commodities Student Club » (GCSC), ci-après « l'association », est créée une association de droit civil à but idéal organisée conformément au Code civil suisse. L'identité publique de l'association est Geneva University Commodities Club (GUCC).",
  },
  {
    id: "art2",
    title: "2. Siège",
    body: "Son siège est à Genève.",
  },
  {
    id: "art3",
    title: "3. Buts",
    body: "L'association a pour buts de mener les activités suivantes au sein de l'Université de Genève, et en faveur de ses étudiant-e-s : Formation (ateliers de commodity trading, finance de marché, droit maritime et ESG) ; Analyse (marchés physiques et financiers : agricoles, énergie, métaux, et simulations de hedging) ; Conférences (tables rondes, panels, enjeux géopolitiques, économiques et environnementaux) ; Networking (pont entre les étudiants de l'UNIGE et les professionnels du négoce genevois et international). L'association est affranchie de toute orientation et rattachement de nature politique ou religieux.",
  },
  {
    id: "art4",
    title: "4. Membres",
    body: "Peut devenir membre : (1) tout-e étudiant-e immatriculé-e à l'Université de Genève qui souscrit à ses buts, sur demande écrite auprès du Comité ; (2) à titre exceptionnel, des étudiant-e-s d'une autre Haute École et/ou Université ; (3) des ancien-ne-s étudiant-e-s de l'UNIGE, dans la limite de l'alinéa 4. Le Comité n'admet une demande au sens de l'alinéa 3 que si elle ne fait pas descendre la proportion de membres immatriculé-e-s à l'UNIGE sous le seuil de 51 %, conformément aux décisions du Rectorat du 30 juin 2014 et du 27 avril 2016.",
  },
  {
    id: "art5",
    title: "5. Démission",
    body: "Chaque membre a le droit de se retirer de l'association en tout temps par simple lettre écrite adressée au Comité.",
  },
  {
    id: "art6",
    title: "6. Perte de la qualité de membre",
    body: "La qualité de membre s'éteint par l'exmatriculation de l'Université de Genève ; par démission écrite ; par exclusion prononcée par l'Assemblée générale ; en cas de non-paiement de la cotisation annuelle après rappel resté sans effet ; par décès du membre.",
  },
  {
    id: "art7",
    title: "7. Exclusion",
    body: "Sur proposition du Comité, l'Assemblée générale peut exclure un membre qui, par son comportement ou par ses déclarations, contreviendrait gravement aux buts et aux intérêts de l'association.",
  },
  {
    id: "art8",
    title: "8. Organes",
    body: "Les organes de l'association sont l'Assemblée générale (AG), le Comité et les vérificateurs-trices aux comptes.",
  },
  {
    id: "art9",
    title: "9. Assemblée générale",
    body: "L'AG est l'organe suprême. Elle définit la politique générale, élit et révoque le Comité et les vérificateurs aux comptes, fixe les cotisations, approuve les rapports et les comptes, prononce l'adhésion et l'exclusion, modifie les statuts et peut dissoudre l'association. Elle se réunit au moins deux fois par an, une fois par semestre. Décisions à la majorité simple, sauf modification des statuts et dissolution (majorité des 2/3). Une AG extraordinaire peut être convoquée par le Comité ou sur demande d'un cinquième des membres.",
  },
  {
    id: "art10",
    title: "10. Le Comité",
    body: "Le Comité est composé de 3 membres au minimum : Président-e, Vice-Président-e, Trésorier-ère. Ils doivent rester immatriculés à l'UNIGE pendant leur mandat (six mois, renouvelable). Le Comité gère les affaires courantes, représente l'association et établit les comptes. La signature est collective à deux parmi le Président, le Vice-Président et le Trésorier.",
  },
  {
    id: "art11",
    title: "11. Vérificateurs aux comptes",
    body: "Deux au moins, non membres du Comité, élus par l'AG pour six mois, renouvelable. Ils vérifient les comptes et soumettent leur rapport à l'AG.",
  },
  {
    id: "art12",
    title: "12. Ressources",
    body: "Les ressources proviennent des cotisations, de dons, de subventions ainsi que de partenariats.",
  },
  {
    id: "art13",
    title: "13. Responsabilité",
    body: "Les membres ne sont pas responsables personnellement des dettes sociales, qui ne sont garanties que par l'actif social de l'association.",
  },
  {
    id: "art14",
    title: "14. Exercice social",
    body: "L'exercice social commence le 1er septembre et se termine le 31 août. Le Comité tient une comptabilité simple des recettes et des dépenses.",
  },
  {
    id: "art15",
    title: "15. Protection des données",
    body: "L'association traite les données personnelles de ses membres (nom, prénom, coordonnées, statut d'immatriculation) dans le seul but de la gestion de l'association et de ses activités. Ces données ne sont transmises à des tiers qu'avec l'accord explicite du membre concerné. Chaque membre peut demander l'accès, la rectification ou la suppression de ses données auprès du Comité.",
  },
  {
    id: "art16",
    title: "16. Modification des statuts",
    body: "Toute modification doit être approuvée par l'AG à la majorité qualifiée des 2/3 des membres présents, et communiquée au Rectorat de l'Université de Genève avant son approbation en AG.",
  },
  {
    id: "art17",
    title: "17. Dissolution",
    body: "L'AG peut dissoudre l'association par un vote à la majorité des 2/3 des membres présents. L'éventuel solde actif après liquidation est attribué à une association à but similaire.",
  },
  {
    id: "art18",
    title: "18. Entrée en vigueur",
    body: "Les présents statuts ont été adoptés par l'Assemblée générale constitutive le 1er septembre 2026, à Genève. Membres fondateurs signataires : Jérémy Lambert, Président ; Aris Ismajli, Vice-Président ; Evan Bonnafous Vignaud, Trésorier.",
  },
];

export function StatutsPage() {
  const { lang } = useLanguage();
  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <Link
          to="/"
          className="inline-flex h-11 items-center gap-2 font-display text-sm uppercase tracking-widest text-copper hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          {lang === "fr" ? "Retour" : "Back"}
        </Link>
        <p className="mt-8 font-display text-xs uppercase tracking-widest text-copper">
          Association étudiante · Genève
        </p>
        <SplitText
          as="h1"
          by="chars"
          immediate
          delay={150}
          text={lang === "fr" ? "Statuts" : "Bylaws"}
          className="mt-3 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-5xl"
        />
        <p className="mt-4 font-serif text-lg italic text-navy/70">Connecting Academia to Global Trade</p>
        <p className="mt-6 font-serif text-base leading-relaxed text-navy/80">
          {lang === "fr"
            ? "Texte adopté le 1er septembre 2026 à Genève. L'identité visuelle et le nom d'usage de l'association sont Geneva University Commodities Club ; les statuts constitutifs mentionnent également Geneva Commodities Student Club (GCSC)."
            : "Adopted on 1 September 2026 in Geneva. The public name and identity of the association is Geneva University Commodities Club; the constitutive bylaws also record Geneva Commodities Student Club (GCSC). The authentic legal text is in French."}
        </p>
        <div className="mt-12 space-y-8">
          {ARTICLES.map((a, i) => (
            <Reveal key={a.id} delay={i < 3 ? 300 + i * 100 : 0}>
            <article className="group/art relative border-t border-navy/10 pt-6">
              <span aria-hidden className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-copper transition-transform duration-[var(--motion-emphasis)] ease-[var(--ease-smooth-out)] group-hover/art:scale-x-100" />
              <h2 className="font-display text-lg font-semibold uppercase tracking-[0.08em]">{a.title}</h2>
              <p className="mt-2 font-serif text-base leading-relaxed text-navy/80">{a.body}</p>
            </article>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
