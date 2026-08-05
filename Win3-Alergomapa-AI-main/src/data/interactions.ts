import { InteractionRule } from '../types';

export const INTERACTION_RULES: InteractionRule[] = [
  // LÉK vs POTRAVINA/DIETA
  {
    id: "med_diet_euthyrox_soy",
    triggerType: "medication",
    triggerKeywords: ["euthyrox", "letrox", "levothyroxin", "syntroxine"],
    targetType: "diet",
    targetKeywords: ["sója", "sojov", "tofu", "tempeh"],
    severity: "WARNING",
    message: "Sója může snižovat vstřebávání levothyroxinu. Udržujte časový odstup.",
    timeSpacingHours: 4,
    description: "Sojové bílkoviny mohou vázat levothyroxin ve střevě a snižovat tak jeho účinnost."
  },
  {
    id: "med_diet_abx_milk",
    triggerType: "medication",
    triggerKeywords: ["doxycyklin", "tetracyklin", "ciprofloxacin", "ofloxacin", "antibiotik"],
    targetType: "diet",
    targetKeywords: ["mléko", "jogurt", "sýr", "tvaroh", "syrovátka", "kefír", "kravsk", "bkm"],
    severity: "CRITICAL",
    message: "Mléčné výrobky a vápník blokují vstřebávání těchto antibiotik.",
    timeSpacingHours: 2,
    description: "Vápník v mléčných výrobcích tvoří s tetracykliny a chinolony nevstřebatelné komplexy."
  },
  
  // LÉK vs DOPLNĚK / LÉK
  {
    id: "med_supp_euthyrox_calcium",
    triggerType: "medication",
    triggerKeywords: ["euthyrox", "letrox", "levothyroxin", "syntroxine"],
    targetType: "supplement",
    targetKeywords: ["vápník", "calcium", "kalcium", "železo", "ferrum", "hořčík", "magnesium"],
    severity: "CRITICAL",
    message: "Minerály snižují vstřebávání hormonu štítné žlázy. Dodržujte přísný časový odstup.",
    timeSpacingHours: 4
  },
  {
    id: "supp_supp_calcium_iron",
    triggerType: "supplement",
    triggerKeywords: ["vápník", "calcium", "kalcium"],
    targetType: "supplement",
    targetKeywords: ["železo", "ferrum", "sorbifer", "maltofer", "tardyferon"],
    severity: "WARNING",
    message: "Vápník brání vstřebávání železa. Neužívejte tyto doplňky společně.",
    timeSpacingHours: 2
  },

  // ZKŘÍŽENÉ IMUNOLOGICKÉ REAKCE
  {
    id: "allergy_cross_milk_goat",
    triggerType: "allergy",
    triggerKeywords: ["kravsk", "bkm", "abkm", "mléko"],
    targetType: "diet",
    targetKeywords: ["kozí", "ovčí"],
    severity: "CRITICAL",
    message: "Vysoké riziko zkřížené reakce: Alergie na kravskou bílkovinu (ABKM) znamená zkříženou alergii i na kozí a ovčí mléko.",
    description: "Kozí a ovčí bílkoviny jsou homologní s kravskými z více než 80 %, téměř vždy dochází k alergické reakci."
  },
  {
    id: "allergy_cross_birch_apple",
    triggerType: "allergy",
    triggerKeywords: ["bříz", "birch"],
    targetType: "diet",
    targetKeywords: ["jablko", "mrkev", "celer", "třešně", "lískový", "ořech"],
    severity: "WARNING",
    message: "Riziko orálního alergického syndromu (OAS) při alergii na břízu.",
    description: "Zkřížená reakce s čerstvým ovocem a zeleninou. Tepelnou úpravou se alergen většinou zničí."
  }
];
