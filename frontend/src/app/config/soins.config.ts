export interface SoinItem {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  imageUrl: string;
  imageAlt: string;
  icon: string;
}

export const CLINICAL_DISCLAIMER = 'Les indications et les résultats peuvent varier selon la situation clinique. Une consultation est nécessaire pour proposer un traitement adapté.';

export const SOINS_LIST: SoinItem[] = [
  {
    id: 'couronne-zircone',
    title: 'Couronnes en zircone',
    shortDescription: 'Les couronnes en zircone permettent de restaurer une dent fragilisée ou abîmée tout en offrant un résultat résistant, esthétique et proche de l’apparence naturelle des dents.',
    detailedDescription: 'La zircone est un matériau reconnu pour sa solidité et son rendu esthétique. Une couronne peut être proposée pour protéger une dent endommagée, restaurer sa forme ou améliorer l’harmonie du sourire. Une consultation est nécessaire pour déterminer la solution adaptée à chaque patient.',
    imageUrl: 'assets/images/soins/couronne-zircone.png',
    imageAlt: 'Couronne dentaire esthétique en zircone',
    icon: 'diamond'
  },
  {
    id: 'restauration-composite',
    title: 'Restaurations en composite',
    shortDescription: 'Le composite est un matériau esthétique utilisé pour réparer une dent cariée, cassée ou usée en respectant sa teinte naturelle.',
    detailedDescription: 'La restauration en composite permet de reconstruire une partie de la dent avec un matériau dont la couleur est choisie pour se rapprocher des dents naturelles. Elle peut être utilisée pour traiter certaines caries ou corriger de petites imperfections dentaires.',
    imageUrl: 'assets/images/soins/restauration-composite.png',
    imageAlt: 'Restauration dentaire en résine composite naturelle',
    icon: 'healing'
  },
  {
    id: 'prothese-amovible',
    title: 'Prothèses amovibles',
    shortDescription: 'Les prothèses amovibles remplacent une ou plusieurs dents absentes afin d’améliorer la mastication, le confort et l’esthétique du sourire.',
    detailedDescription: 'Partielle ou complète, une prothèse amovible est conçue selon la situation bucco-dentaire du patient. Elle doit être adaptée avec précision et entretenue régulièrement pour préserver le confort et la santé de la bouche.',
    imageUrl: 'assets/images/soins/prothese-amovible.png',
    imageAlt: 'Prothèse dentaire amovible esthétique et confortable',
    icon: 'dentistry'
  },
  {
    id: 'detartrage',
    title: 'Détartrage',
    shortDescription: 'Le détartrage élimine le tartre et la plaque dentaire difficiles à retirer par le brossage quotidien.',
    detailedDescription: 'Réalisé au cabinet, le détartrage participe à la prévention des problèmes gingivaux et aide à maintenir une bonne hygiène bucco-dentaire. La fréquence recommandée dépend de l’état des dents et des gencives de chaque patient.',
    imageUrl: 'assets/images/soins/detartrage.png',
    imageAlt: 'Soin de détartrage et hygiène dentaire professionnelle',
    icon: 'cleaning_services'
  },
  {
    id: 'blanchiment-dentaire',
    title: 'Blanchiment dentaire',
    shortDescription: 'Le blanchiment dentaire vise à éclaircir la teinte des dents grâce à un traitement encadré et adapté au sourire du patient.',
    detailedDescription: 'Avant le traitement, un examen bucco-dentaire permet de vérifier que le blanchiment convient au patient. Le résultat peut varier selon la teinte initiale, l’état des dents et les habitudes quotidiennes.',
    imageUrl: 'assets/images/soins/blanchiment-dentaire.png',
    imageAlt: 'Sourire naturel après traitement de blanchiment dentaire',
    icon: 'auto_awesome'
  }
];

export const SOINS_TITLES: string[] = SOINS_LIST.map(s => s.title);
