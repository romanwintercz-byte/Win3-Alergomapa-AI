export const ALLERGY_EDUCATION_DATA = [
  {
    id: "milk",
    name: "Mléčná bílkovina (BKM)",
    description: "Alergie na bílkovinu kravského mléka (ABKM) není to samé jako intolerance laktózy. Při ABKM vadí jakákoliv část mléčné bílkoviny (kasein, syrovátka), nejen mléčný cukr (laktóza).",
    hiddenNames: ["Kasein", "Kaseinát", "Syrovátka", "Sušené podmáslí", "Laktalbumin", "Laktoglobulin", "Mléčná sušina", "Tvaroh", "Jogurtová kultura", "Syřidlo živočišného původu"],
    risks: ["Pečivo (potírá se mlékem pro lesk)", "Uzeniny (často obsahují mléčnou bílkovinu jako pojivo)", "Margaríny (mohou obsahovat syrovátku)", "Léky a doplňky stravy (laktóza může být kontaminována bílkovinou)"],
    tips: ["Hledejte produkty označené 'Vegan' - ty ze zákona nesmí obsahovat mléko.", "Kozí a ovčí mléko má velmi podobnou bílkovinu a často způsobuje zkříženou reakci (nedoporučuje se jako náhrada)."]
  },
  {
    id: "egg",
    name: "Vejce",
    description: "Alergie na vejce se často týká bílku, ale z důvodu kontaminace se musí vyřadit celé vejce.",
    hiddenNames: ["Albumin", "Ovomucin", "Ovomucoid", "Lysozym (E1105)", "Vaječná melanž", "Lecitin (pokud je specifikován jako vaječný - E322)", "Žloutek", "Bílek"],
    risks: ["Těstoviny", "Pečivo (potírání)", "Pěny, marshmallow", "Klarifikované nápoje (některá vína se čiští vaječným bílkem)", "Očkování (některé vakcíny se pěstují na kuřecích embryích)"],
    tips: ["Při pečení můžete vejce nahradit rozmačkaným banánem, jablečným pyré, lněným semínkem nebo chia semínky namočenými ve vodě.", "Pozor na lesklé pečivo v pekárnách."]
  },
  {
    id: "soy",
    name: "Sója",
    description: "Sója je velmi častý alergen a široce používané aditivum v potravinářství.",
    hiddenNames: ["Sójový lecitin (E322)", "Sójová bílkovina", "Edamame", "Tofu", "Tempeh", "Miso", "Sójová omáčka", "Tamari", "Sójový olej (může obsahovat stopy bílkoviny)"],
    risks: ["Uzeniny (párky, salámy)", "Čokolády a cukrovinky (často obsahují sójový lecitin)", "Asijská kuchyně", "Pečivo (sójová mouka)"],
    tips: ["Sójový lecitin někdy alergikům nevadí (obsahuje minimum bílkoviny), ale u silných anafylaktiků je lepší se mu vyhnout.", "Pozor na interakci se štítnou žlázou (sója ovlivňuje vstřebávání levothyroxinu)."]
  },
  {
    id: "wheat",
    name: "Pšenice a Lepek",
    description: "Je důležité rozlišovat alergii na pšenici (imunitní reakce) a celiakii (autoimunitní onemocnění vyvolané lepkem).",
    hiddenNames: ["Pšeničný škrob", "Modifikovaný škrob (pokud není uveden původ)", "Bulgur", "Kuskus", "Špalda", "Semolina", "Pšeničný slad", "Strouhanka"],
    risks: ["Omáčky a polévky (zahušťování)", "Uzeniny", "Smažená jídla (trojobal)", "Oves (často kontaminován pšenicí, pokud není certifikovaný bezlepkový)"],
    tips: ["Špalda, kamut a jednozrnka jsou odrůdy pšenice a obsahují stejné alergeny.", "Hledejte symbol přeškrtnutého klasu pro zaručeně bezlepkové potraviny."]
  },
  {
    id: "nuts",
    name: "Ořechy a Arašídy",
    description: "Arašídy jsou luštěniny, zatímco stromové ořechy (vlašské, lískové, mandle, kešu atd.) patří botanicky jinam. Často se ale vyskytují alergie na obojí.",
    hiddenNames: ["Nugát", "Marcipán", "Pesto (často piniové, kešu nebo vlašské ořechy)", "Gianduja", "Mandlová pasta", "Arašídový olej"],
    risks: ["Čokolády (vysoké riziko kontaminace)", "Asijská jídla (často arašídy)", "Cereálie a müsli", "Zákusky a dorty"],
    tips: ["Ořechové oleje lisované za studena obsahují alergenní bílkoviny. Rafinované oleje by teoreticky měly být čisté, ale riziko kontaminace zůstává.", "Mnoho alergiků na ořechy snese kokos a muškátový oříšek (nejsou to pravé ořechy)."]
  }
];
