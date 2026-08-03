export const MEDICATION_EDUCATION_DATA = [
  {
    id: "antihistamines",
    name: "Antihistaminika (Zyrtec, Xyzal, Analergin...)",
    description: "Léky tlumící alergickou reakci blokováním histaminu. Tvoří základní kámen léčby většiny alergií.",
    rules: [
      "Některá starší (např. Dithiaden, Zodac) mohou způsobovat ospalost – je lepší je užívat večer.",
      "Většinu moderních antihistaminik lze užívat nalačno i s jídlem.",
      "Při akutních potížích začínají působit zhruba do 30–60 minut."
    ],
    mistakes: [
      "Užívání nepravidelně jen při nejhorších příznacích. V pylové sezóně je mnohem efektivnější plynulé každodenní krytí.",
      "Kombinace s alkoholem, která může výrazně zvýšit tlumivý efekt a únavu."
    ],
    interactions: [
      "Opatrnost je nutná při současném užívání léků na spaní, uklidnění nebo antidepresiv."
    ]
  },
  {
    id: "nasal_sprays",
    name: "Kortikoidní spreje do nosu (Nasonex, Avamys...)",
    description: "Působí silně protizánětlivě přímo na sliznici nosu. Jsou nejúčinnější dlouhodobou prevencí alergické rýmy.",
    rules: [
      "Nutné užívat pravidelně každý den. Plný účinek nastupuje postupně až po několika dnech užívání.",
      "Před aplikací je nutné se důkladně vysmrkat.",
      "Při aplikaci směřujte trysku mírně ven, pryč od nosní přepážky (směrem k uchu)."
    ],
    mistakes: [
      "Stříkání kolmo přímo na nosní přepážku (může vést k vysušení a krvácení z nosu).",
      "Příliš silné popotažení po vstřiku. Lék by měl zůstat v nose, pokud steče do krku, ztrácí tam účinek.",
      "Předčasné vysazení spreje ihned po mírném zlepšení stavu."
    ],
    interactions: []
  },
  {
    id: "epinephrine",
    name: "Adrenalinové pero (EpiPen, Emerade...)",
    description: "Pohotovostní život zachraňující lék pro případ anafylaktického šoku (těžké alergické reakce).",
    rules: [
      "Aplikuje se silným přitlačením do vnější strany stehna (lze aplikovat i přes oblečení).",
      "Po aplikaci je VŽDY nutné zavolat záchrannou službu (155).",
      "Pero musíte nosit neustále při sobě. Chraňte jej před extrémními teplotami (nesmí zmrznout ani se přehřát na slunci)."
    ],
    mistakes: [
      "Strach z použití. Je vždy lepší aplikovat adrenalin zbytečně, než pozdě.",
      "Aplikace do žíly, hýždě nebo prstu (aplikujte pouze do svalu na stehně).",
      "Prošlá expirace. Pravidelně kontrolujte datum spotřeby a roztok (nesmí být zakalený)."
    ],
    interactions: []
  },
  {
    id: "inhalers",
    name: "Inhalátory na astma (Ventolin, Symbicort...)",
    description: "Léky sloužící k rychlému roztažení dýchacích cest (úlevové) nebo k potlačení chronického zánětu v plicích (udržovací).",
    rules: [
      "Základní postup: vydechnout mimo inhalátor, hluboce se nadechnout z inhalátoru a ZADRŽET DECH na 5-10 sekund.",
      "U dětí a při problémech s koordinací je zásadní používat inhalační nástavec (spacer).",
      "Po použití kortikoidních inhalátorů si vždy důkladně vypláchněte ústa a vykloktejte vodou."
    ],
    mistakes: [
      "Špatná technika nádechu, kvůli které lék skončí jen v krku místo v plicích.",
      "Nevypláchnutí úst po kortikoidech, což často vede ke vzniku kvasinkové infekce (moučnivky) v ústech.",
      "Nenošení úlevového inhalátoru neustále při sobě."
    ],
    interactions: []
  },
  {
    id: "thyroid",
    name: "Hormony štítné žlázy (Euthyrox, Letrox...)",
    description: "Léčba snížené funkce štítné žlázy. Velmi často se předepisuje pacientům s autoimunitními alergiemi.",
    rules: [
      "Užívejte striktně NALAČNO, ideálně hned po probuzení.",
      "Zapíjejte výhradně čistou vodou.",
      "Jídlo konzumujte nejdříve 30 minut (ideálně až 60 minut) po užití léku."
    ],
    mistakes: [
      "Zapíjení léku kávou, mlékem, džusem nebo čajem. To výrazně snižuje vstřebatelnost hormonu.",
      "Nedodržení časového odstupu od jídla."
    ],
    interactions: [
      "Vápník, železo, sója a antacida (léky na pálení žáhy) zásadně blokují vstřebávání léku. Nutný je odstup minimálně 4 hodiny!"
    ]
  }
];
