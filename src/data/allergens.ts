import { AllergenInfo } from "../types";

export const ALLERGENS: AllergenInfo[] = [
  {
    id: "alder",
    name: "Olše",
    apiField: "alder_pollen",
    color: "#fb923c", // orange-400
    crossAllergies: ["Jablko", "Třešeň", "Broskev", "Lískový ořech", "Celer"],
    description: "Kvete velmi brzy zjara. Často reaguje zkříženě s břízou a lískou.",
  },
  {
    id: "birch",
    name: "Bříza",
    apiField: "birch_pollen",
    color: "#facc15", // yellow-400
    crossAllergies: ["Jablko", "Hruška", "Třešeň", "Lískový ořech", "Mrkev", "Celer", "Sójové boby", "Arašídy"],
    description: "Jeden z nejagresivnějších jarních alergenů. Vysoké riziko zkřížených potravinových alergií.",
  },
  {
    id: "grass",
    name: "Trávy",
    apiField: "grass_pollen",
    color: "#4ade80", // green-400
    crossAllergies: ["Rajče", "Pšenice", "Žito", "Meloun", "Arašídy", "Sója"],
    description: "Nejčastější příčina senné rýmy v létě. Zahrnuje srhu, bojínek, jilek a další.",
  },
  {
    id: "mugwort",
    name: "Pelyněk",
    apiField: "mugwort_pollen",
    color: "#a78bfa", // purple-400
    crossAllergies: ["Celer", "Mrkev", "Koření (kmín, fenykl, koriandr)", "Heřmánek", "Slunečnice"],
    description: "Pozdně letní až podzimní alergen, typický plevel na rumištích.",
  },
  {
    id: "olive",
    name: "Oliva",
    apiField: "olive_pollen",
    color: "#94a3b8", // slate-400
    crossAllergies: ["Jasan", "Ptačí zob", "Šeřík", "Zlatice"],
    description: "Významný alergen zejména ve Středomoří, relevantní při cestování na jih Evropy.",
  },
  {
    id: "ragweed",
    name: "Ambrózie",
    apiField: "ragweed_pollen",
    color: "#f472b6", // pink-400
    crossAllergies: ["Banán", "Meloun", "Okurka", "Cuketa", "Heřmánek"],
    description: "Pozdně letní agresivní plevel. Produkuje enormní množství pylu.",
  },
  {
    id: "hazel",
    name: "Líska",
    apiField: "alder_pollen",
    color: "#d97706", // amber-600
    crossAllergies: ["Jablko", "Broskev", "Třešeň", "Lískový ořech"],
    description: "Spolu s olší první jarní alergen. Data v aplikaci jsou proxy odvozená z příbuzné olše/břízy.",
  },
  {
    id: "ash",
    name: "Jasan",
    apiField: "olive_pollen",
    color: "#475569", // slate-600
    crossAllergies: ["Oliva", "Ptačí zob", "Šeřík", "Zlatice"],
    description: "Patří do stejné čeledi jako oliva (olivovníkovité), data vychází ze společných modelů.",
  },
  {
    id: "timothy",
    name: "Bojínek",
    apiField: "grass_pollen",
    color: "#22c55e", // green-500
    crossAllergies: ["Rajče", "Pšenice", "Žito", "Sója"],
    description: "Významný zástupce trav (lipnicovité). Sledován společně v celkové kategorii trav.",
  }
];

export const KNOWN_CROSS_REACTIONS: Record<string, string[]> = {
  'kočka': ['Vepřové maso (tzv. Pork-cat syndrom)'],
  'pes': ['Hovězí maso', 'Mléko (vzácně)'],
  'peří': ['Vaječný žloutek', 'Drůbeží maso (tzv. Bird-egg syndrom)'],
  'ptáci': ['Vaječný žloutek', 'Drůbeží maso (tzv. Bird-egg syndrom)'],
  'roztoč': ['Korýši', 'Krevety', 'Krab', 'Šneci', 'Ústřice'],
  'plísně': ['Houby', 'Sýry s plísní', 'Kynuté pečivo', 'Víno', 'Pivo'],
  'latex': ['Banán', 'Kiwi', 'Avokádo', 'Kaštan', 'Papája (Latex-fruit syndrom)'],
  'mléko': ['Hovězí maso', 'Kozí a ovčí mléko'],
  'arašídy': ['Sója', 'Čočka', 'Hrách', 'Fazole', 'Lupina'],
  'vlašské ořechy': ['Pekanové ořechy'],
  'lískové ořechy': ['Vlašské ořechy', 'Para ořechy', 'Mandle'],
  'pšenice': ['Žito', 'Ječmen', 'Oves'],
  'jablko': ['Hruška', 'Broskev', 'Třešeň', 'Mrkev'],
  'ryby': ['Jiné druhy ryb (vysoké riziko zkřížení)'],
  'korýši': ['Roztoči', 'Měkkýši', 'Hmyz']
};

export function getAqiStatus(aqi: number): { label: string; color: string; advice: string } {
  if (aqi <= 20) return { label: "Velmi dobrá", color: "text-blue-500", advice: "Ideální čas pro venkovní aktivity a větrání." };
  if (aqi <= 40) return { label: "Dobrá", color: "text-green-500", advice: "Kvalita ovzduší je uspokojivá, běžné venkovní aktivity jsou bez omezení." };
  if (aqi <= 60) return { label: "Střední", color: "text-yellow-500", advice: "Citlivé osoby mohou zaznamenat mírné podráždění. Zvažte zkrácení náročných aktivit venku." };
  if (aqi <= 80) return { label: "Zhoršená", color: "text-orange-500", advice: "Omezte dlouhodobý pobyt venku, pokud patříte mezi citlivé skupiny. Zavřete okna." };
  if (aqi <= 100) return { label: "Špatná", color: "text-red-500", advice: "Vyhněte se fyzické námaze venku. Doporučuje se použít čističku vzduchu." };
  return { label: "Velmi špatná", color: "text-purple-600", advice: "Zůstaňte uvnitř a omezte fyzickou aktivitu. Závažné zdravotní riziko pro alergiky a astmatiky." };
}

export function getPollenLevel(value: number): { label: string; color: string; score: number } {
  if (value < 1) return { label: "Žádný / Nízký", color: "text-green-500", score: 0 };
  if (value < 10) return { label: "Střední", color: "text-yellow-500", score: 1 };
  if (value < 50) return { label: "Vysoký", color: "text-orange-500", score: 2 };
  return { label: "Velmi vysoký", color: "text-red-500", score: 3 };
}
