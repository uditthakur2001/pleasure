// import injectionImg from "@/assets/product-injection.jpg";
// import bolusImg from "@/assets/product-bolus.jpg";
// import powderImg from "@/assets/product-powder.jpg";
// import syrupImg from "@/assets/product-syrup.jpg";
// import pecImg from "@/assets/p-cef.png";
// import zoonilImg from "@/assets/zoonil.png";
// Category images
import injectionImg from "@/assets/product-injection.jpg";
import bolusImg from "@/assets/product-bolus.jpg";
import powderImg from "@/assets/product-powder.jpg";
import syrupImg from "@/assets/product-syrup.jpg";



// P-CEF range
import pcefXp from "@/assets/p-cef.png";
import pcefForte from "@/assets/p-cef-forte.jpg";
import pcef3 from "@/assets/pcef-3.jpg";
import pcef3ii from "@/assets/pcef-3-ii.jpg";
import pcefSb from "@/assets/pcef-sb.i.jpg";
import pcefSbii from "@/assets/pcef-sb.ii.jpg";

// CSURE
import csure1 from "@/assets/csure.i.jpg";
import csure2 from "@/assets/csure.ii.jpg";

// F-STAR PLUS
import fstarPlus1 from "@/assets/f-star-plus.i.png";
import fstarPlus2 from "@/assets/f-star-plus.ii.jpg";

// FMS-C
import fmsC1 from "@/assets/fms-c.i.jpg";
import fmsC2 from "@/assets/fms-c.ii.png";

// Mastanil
import mastanil1 from "@/assets/mastanil.i.jpg";
import mastanil2 from "@/assets/mastanil.ii.jpg";

// ZOONIL
import zoonil from "@/assets/zoonil.png";
import zoonilPlus1 from "@/assets/zoonil-plus.png";
import zoonilPlus2 from "@/assets/zoonil-plus.ii.jpg";

// Others
import utroC from "@/assets/utro-c.png";
import permethrin1 from "@/assets/permethrin1.jpg";
import permethrin2 from "@/assets/permethrin2.jpg";

export type ProductCategory = "Injection" | "Bolus" | "Powder" | "Syrup";

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  images: string[];
  composition: string;
  indications: string[];
  dosage: string;
  benefits: string[];
  packSize?: string;
}

export const categories: ProductCategory[] = [
  "Injection",
  "Bolus",
  "Powder",
  "Syrup",
];

export const products: Product[] = [
  {
    slug: "p-cef-xp",
    name: "P-CEF XP",
    tagline: "Cefoperazone + Sulbactam Injection",
    category: "Injection",
    images:[ pcefXp,
      injectionImg,
      syrupImg
    ],
    composition: "Cefoperazone Sodium 3 g + Sulbactam Sodium 1.5 g (per vial)",
    indications: [
      "Mastitis in dairy cattle",
      "Respiratory tract infections",
      "Urinary tract infections",
      "Septicemia and soft tissue infections",
    ],
    dosage:
      "Large animals: 1 vial (4.5 g) IV/IM once or twice daily for 3–5 days, or as directed by a veterinarian.",
    benefits: [
      "Broad-spectrum bactericidal action",
      "Effective against beta-lactamase producing organisms",
      "Rapid onset, sustained tissue levels",
    ],
    packSize: "4.5 g vial with diluent",
  },
  {
    slug: "p-cef-sb-4-5",
    name: "P-CEF SB 4.5 gm",
    tagline: "Ceftriaxone + Sulbactam Injection",
    category: "Injection",
    images: [pcefSb,pcefSbii],
    composition: "Ceftriaxone Sodium 3 g + Sulbactam Sodium 1.5 g",
    indications: [
      "Severe systemic infections",
      "Pneumonia and respiratory infections",
      "Post-surgical prophylaxis",
    ],
    dosage:
      "1 vial IV/IM once daily for 3–5 days as advised by a veterinarian.",
    benefits: [
      "Extended spectrum cephalosporin",
      "Once-a-day dosing convenience",
      "Reliable beta-lactamase protection",
    ],
    packSize: "4.5 g vial with diluent",
  },
  {
    slug: "enroff",
    name: "ENROFF",
    tagline: "Enrofloxacin Injection 10%",
    category: "Injection",
    images: [injectionImg],
    composition: "Enrofloxacin 100 mg per ml",
    indications: [
      "Bacterial enteritis & calf scours",
      "Bovine respiratory disease complex",
      "Skin and soft tissue infections",
    ],
    dosage:
      "Cattle/buffalo: 1 ml per 40 kg body weight, IM/SC once daily for 3 days.",
    benefits: [
      "Broad-spectrum fluoroquinolone",
      "Excellent tissue penetration",
      "Fast clinical recovery",
    ],
    packSize: "30 ml & 100 ml vials",
  },
  {
    slug: "noflam",
    name: "NOFLAM",
    tagline: "Piroxicam + Paracetamol Injection",
    category: "Injection",
    images: [injectionImg],
    composition: "Piroxicam 20 mg + Paracetamol 150 mg per ml",
    indications: [
      "Post-operative pain & inflammation",
      "Musculoskeletal pain, lameness",
      "Pyrexia of bacterial / viral origin",
    ],
    dosage: "Large animals: 10–15 ml deep IM once daily for 3 days.",
    benefits: [
      "Powerful anti-inflammatory action",
      "Reliable antipyretic effect",
      "Quick relief from pain",
    ],
    packSize: "30 ml vial",
  },
  {
    slug: "zoonil",
    name: "ZOONIL",
    tagline: "Albendazole + Ivermectin Bolus",
    category: "Bolus",
    images: [bolusImg],
    composition: "Albendazole 1500 mg + Ivermectin 100 mg per bolus",
    indications: [
      "Mixed infestations of round, tape and flukes",
      "External parasites — ticks, mites, lice",
      "Strongyle and ascarid infections",
    ],
    dosage: "1 bolus per 200–250 kg body weight, orally as a single dose.",
    benefits: [
      "Broad-spectrum endectocide",
      "Single-dose convenience",
      "Improves growth & milk yield",
    ],
    packSize: "Strip of 4 boluses",
  },
  {
    slug: "vita-hp",
    name: "VITA-HP",
    tagline: "High-Potency Vitamin Tonic",
    category: "Syrup",
    images: [syrupImg],
    composition: "Vitamins A, D3, E, B-Complex with essential minerals",
    indications: [
      "Vitamin & mineral deficiency",
      "Poor growth, weakness, anorexia",
      "Stress, post-illness recovery",
    ],
    dosage:
      "Cattle/buffalo: 50–100 ml daily; calves: 20–30 ml daily for 5–7 days.",
    benefits: [
      "Restores vitality & appetite",
      "Improves milk yield & fertility",
      "Boosts immunity",
    ],
    packSize: "1 L & 5 L pack",
  },
  {
    slug: "liv-sure",
    name: "LIV-SURE",
    tagline: "Herbal Liver Tonic",
    category: "Syrup",
    images: [syrupImg],
    composition:
      "Andrographis, Phyllanthus, Boerhavia, Tephrosia, Eclipta extracts",
    indications: [
      "Liver dysfunction & jaundice",
      "Aflatoxicosis",
      "Loss of appetite, indigestion",
    ],
    dosage:
      "Cattle: 50 ml twice daily; calves: 20 ml twice daily for 7–10 days.",
    benefits: [
      "Hepato-protective & restorative",
      "Improves digestion and FCR",
      "Supports detoxification",
    ],
    packSize: "1 L & 5 L pack",
  },
  {
    slug: "cal-d-sure",
    name: "CAL-D SURE",
    tagline: "Calcium + Phosphorus + Vitamin D3",
    category: "Syrup",
    images: [syrupImg],
    composition: "Calcium 25 mg, Phosphorus 11.5 mg, Vitamin D3 600 IU per ml",
    indications: [
      "Milk fever & hypocalcemia",
      "Weak bones, rickets in calves",
      "Improved milk production",
    ],
    dosage: "Cattle: 100 ml daily; calves: 30–50 ml daily.",
    benefits: [
      "Strong bones & teeth",
      "Higher milk yield",
      "Better reproductive performance",
    ],
    packSize: "1 L & 5 L pack",
  },
  {
    slug: "lepta-d",
    name: "LEPTA-D",
    tagline: "Mineral Mixture Powder",
    category: "Powder",
    images: [powderImg],
    composition:
      "Chelated minerals — Zn, Cu, Mn, Fe, Co, I, Se with vitamins A, D3, E",
    indications: [
      "Mineral deficiency syndromes",
      "Anestrus, repeat breeding",
      "Low milk yield, poor growth",
    ],
    dosage: "Cattle/buffalo: 50 g daily; calves: 20 g daily, mixed with feed.",
    benefits: [
      "Highly bioavailable chelated minerals",
      "Improves fertility and conception",
      "Enhances milk production & quality",
    ],
    packSize: "1 kg, 5 kg & 25 kg pack",
  },
  {
    slug: "p-cef-forte",
    name: "P-CEF FORTE",
    tagline: "Ceftriaxone Injection",
    category: "Injection",
    images: [pcefForte],
    composition: "Ceftriaxone Injection",
    indications: ["Mastitis", "Pneumonia", "Post-operative infections"],
    dosage: "5–6 mg/kg body weight",
    benefits: ["Fast absorption", "High surface area"],
  },

  {
    slug: "c-sure",
    name: "C-SURE",
    tagline: "Ascorbic Acid Injection",
    category: "Injection",
    images: [csure1, csure2],
    composition: "Vitamin C (Ascorbic Acid)",
    indications: ["Stress", "Mastitis", "Recovery"],
    dosage: "5–10 ml",
    benefits: ["Boost immunity", "Improves recovery"],
  },

  {
    slug: "i-perdone",
    name: "I-PERDONE",
    tagline: "Isoflupredone Injection",
    category: "Injection",
    images: [injectionImg],
    composition: "Isoflupredone",
    indications: ["Ketosis", "Inflammation"],
    dosage: "As directed",
    benefits: ["Fast acting", "Multi-purpose"],
  },

  {
    slug: "b-choline",
    name: "B-CHOLINE",
    tagline: "Choline Chloride Injection",
    category: "Injection",
    images: [injectionImg],
    composition: "Choline Chloride + B-Complex",
    indications: ["Liver disorders", "Fatty liver"],
    dosage: "5–10 ml",
    benefits: ["Improves metabolism"],
  },

  {
    slug: "f-star-plus",
    name: "F-STAR PLUS",
    tagline: "Piroxicam + Paracetamol Bolus",
    category: "Bolus",
    images: [fstarPlus1, fstarPlus2],
    composition: "Piroxicam + Paracetamol + Serratiopeptidase",
    indications: ["Pain", "Fever", "Inflammation"],
    dosage: "2 bolus daily",
    benefits: ["Fast relief"],
  },

  {
    slug: "vetofex",
    name: "VETOFEX",
    tagline: "Ofloxacin Bolus",
    category: "Bolus",
    images: [bolusImg],
    composition: "Ofloxacin",
    indications: ["Diarrhea", "Respiratory infections"],
    dosage: "As directed",
    benefits: ["Strong antibacterial"],
  },

  {
    slug: "vetofex-iu",
    name: "VETOFEX-IU",
    tagline: "Ofloxacin + Ornidazole Liquid",
    category: "Syrup",
    images: [syrupImg],
    composition: "Ofloxacin + Ornidazole",
    indications: ["Gynecological infections", "Uterine infections"],
    dosage: "As directed",
    benefits: ["Broad spectrum"],
  },

  {
    slug: "zoonil-plus",
    name: "ZOONIL PLUS",
    tagline: "Advanced Dewormer",
    category: "Bolus",
    images: [zoonilPlus1,zoonilPlus2],
    composition: "Oxyclozanide + Levamisole + Silymarin",
    indications: ["Roundworms", "Flukes"],
    dosage: "As directed",
    benefits: ["Improves milk yield"],
  },

  {
    slug: "zoonil-injection",
    name: "ZOONIL INJECTION",
    tagline: "Ivermectin Injection",
    category: "Injection",
    images: [zoonil],
    composition: "Ivermectin",
    indications: ["Parasites", "Ticks"],
    dosage: "1 ml per 50 kg",
    benefits: ["Long action"],
  },

  {
    slug: "zoonil-xp-soap",
    name: "ZOONIL XP SOAP",
    tagline: "Anti-parasitic Soap",
    category: "Powder",
    images: [
      // permethrin1,
       permethrin2],
    composition: "Permethrin",
    indications: ["Ticks", "Lice"],
    dosage: "External use",
    benefits: ["Kills parasites"],
  },

  {
    slug: "fms-c",
    name: "FMS-C",
    tagline: "Flunixin + Magnesium Bolus",
    category: "Bolus",
    images: [fmsC1, fmsC2],
    composition: "Flunixin + Serratiopeptidase",
    indications: ["Pain", "Fever"],
    dosage: "As directed",
    benefits: ["Fast pain relief"],
  },

  {
    slug: "mastanil",
    name: "MASTANIL",
    tagline: "Mastitis Control Powder",
    category: "Powder",
    images: [mastanil1, mastanil2],
    composition: "Multi-action formula",
    indications: ["Mastitis", "Milk drop"],
    dosage: "20 gm daily",
    benefits: ["Improves milk quality"],
  },

  {
    slug: "min-sure-gold",
    name: "MIN SURE GOLD",
    tagline: "Chelated Powder Supplement",
    category: "Powder",
    images: [powderImg],
    composition: "Minerals + Vitamins",
    indications: ["Fertility", "Milk production"],
    dosage: "50 gm daily",
    benefits: ["Boost performance"],
  },

  {
    slug: "utro-c",
    name: "UTRO-C",
    tagline: "Uterine Tonic",
    category: "Syrup",
    images: [utroC],
    composition: "Herbal formulation",
    indications: ["Retention of placenta", "Infertility"],
    dosage: "As directed",
    benefits: ["Improves fertility"],
  },

  {
    slug: "milkover",
    name: "MILKOVER",
    tagline: "Milk Enhancer Syrup",
    category: "Syrup",
    images: [syrupImg],
    composition: "Minerals + Vitamins",
    indications: ["Low milk yield"],
    dosage: "As directed",
    benefits: ["Increases milk"],
  },

  {
    slug: "cal-d-sure-advance",
    name: "CAL-D SURE ADVANCE",
    tagline: "Calcium Gel",
    category: "Syrup",
    images: [syrupImg],
    composition: "Calcium + Vitamin D",
    indications: ["Milk fever"],
    dosage: "As directed",
    benefits: ["Strong bones"],
  },
];

export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);
