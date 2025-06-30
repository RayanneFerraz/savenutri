"use client"

import { useLanguage } from "@/context/languageContext"

// Define the type for multi-language strings that can be either string or string array
type MultiLangString = {
  en: string | string[]
  pt: string | string[]
  es: string | string[]
  fr: string | string[]
}

// Content translations for recipe ingredients, instructions, and other content
const contentTranslations: Record<string, MultiLangString> = {
  // Recipe categories
  "Café da Manhã": {
    en: "Breakfast",
    pt: "Café da Manhã",
    es: "Desayuno",
    fr: "Petit-déjeuner",
  },
  Almoço: {
    en: "Lunch",
    pt: "Almoço",
    es: "Almuerzo",
    fr: "Déjeuner",
  },
  Jantar: {
    en: "Dinner",
    pt: "Jantar",
    es: "Cena",
    fr: "Dîner",
  },
  Lanche: {
    en: "Snack",
    pt: "Lanche",
    es: "Merienda",
    fr: "Collation",
  },
  Bebidas: {
    en: "Beverages",
    pt: "Bebidas",
    es: "Bebidas",
    fr: "Boissons",
  },
  Sobremesas: {
    en: "Desserts",
    pt: "Sobremesas",
    es: "Postres",
    fr: "Desserts",
  },

  // Recipe difficulty levels
  Fácil: {
    en: "Easy",
    pt: "Fácil",
    es: "Fácil",
    fr: "Facile",
  },
  Médio: {
    en: "Medium",
    pt: "Médio",
    es: "Medio",
    fr: "Moyen",
  },
  Difícil: {
    en: "Hard",
    pt: "Difícil",
    es: "Difícil",
    fr: "Difficile",
  },

  // Article categories
  Ciência: {
    en: "Science",
    pt: "Ciência",
    es: "Ciencia",
    fr: "Science",
  },
  Fundamentos: {
    en: "Fundamentals",
    pt: "Fundamentos",
    es: "Fundamentos",
    fr: "Fondamentaux",
  },
  Benefícios: {
    en: "Benefits",
    pt: "Benefícios",
    es: "Beneficios",
    fr: "Avantages",
  },
  Mitos: {
    en: "Myths",
    pt: "Mitos",
    es: "Mitos",
    fr: "Mythes",
  },
  Preparação: {
    en: "Preparation",
    pt: "Preparação",
    es: "Preparación",
    fr: "Préparation",
  },
  Protocolos: {
    en: "Protocols",
    pt: "Protocolos",
    es: "Protocolos",
    fr: "Protocoles",
  },
  Alimentação: {
    en: "Nutrition",
    pt: "Alimentação",
    es: "Alimentación",
    fr: "Alimentation",
  },
  Desafios: {
    en: "Challenges",
    pt: "Desafios",
    es: "Desafíos",
    fr: "Défis",
  },
  Potencializadores: {
    en: "Enhancers",
    pt: "Potencializadores",
    es: "Potenciadores",
    fr: "Amplificateurs",
  },
  "Estilo de Vida": {
    en: "Lifestyle",
    pt: "Estilo de Vida",
    es: "Estilo de Vida",
    fr: "Mode de vie",
  },
  Monitoramento: {
    en: "Monitoring",
    pt: "Monitoramento",
    es: "Monitoreo",
    fr: "Surveillance",
  },

  // Common recipe ingredients
  Ovos: {
    en: "Eggs",
    pt: "Ovos",
    es: "Huevos",
    fr: "Œufs",
  },
  Abacate: {
    en: "Avocado",
    pt: "Abacate",
    es: "Aguacate",
    fr: "Avocat",
  },
  Salmão: {
    en: "Salmon",
    pt: "Salmão",
    es: "Salmón",
    fr: "Saumon",
  },
  Azeite: {
    en: "Olive Oil",
    pt: "Azeite",
    es: "Aceite de Oliva",
    fr: "Huile d'olive",
  },
  Limão: {
    en: "Lemon",
    pt: "Limão",
    es: "Limón",
    fr: "Citron",
  },
  Sal: {
    en: "Salt",
    pt: "Sal",
    es: "Sal",
    fr: "Sel",
  },
  Pimenta: {
    en: "Pepper",
    pt: "Pimenta",
    es: "Pimienta",
    fr: "Poivre",
  },
  Alho: {
    en: "Garlic",
    pt: "Alho",
    es: "Ajo",
    fr: "Ail",
  },
  Cebola: {
    en: "Onion",
    pt: "Cebola",
    es: "Cebolla",
    fr: "Oignon",
  },
  Tomate: {
    en: "Tomato",
    pt: "Tomate",
    es: "Tomate",
    fr: "Tomate",
  },
  Espinafre: {
    en: "Spinach",
    pt: "Espinafre",
    es: "Espinaca",
    fr: "Épinard",
  },
  Queijo: {
    en: "Cheese",
    pt: "Queijo",
    es: "Queso",
    fr: "Fromage",
  },
  Frango: {
    en: "Chicken",
    pt: "Frango",
    es: "Pollo",
    fr: "Poulet",
  },
  Brócolis: {
    en: "Broccoli",
    pt: "Brócolis",
    es: "Brócoli",
    fr: "Brocoli",
  },
  "Couve-flor": {
    en: "Cauliflower",
    pt: "Couve-flor",
    es: "Coliflor",
    fr: "Chou-fleur",
  },
  Abobrinha: {
    en: "Zucchini",
    pt: "Abobrinha",
    es: "Calabacín",
    fr: "Courgette",
  },
  Pimentão: {
    en: "Bell Pepper",
    pt: "Pimentão",
    es: "Pimiento",
    fr: "Poivron",
  },
  Cogumelos: {
    en: "Mushrooms",
    pt: "Cogumelos",
    es: "Champiñones",
    fr: "Champignons",
  },
  Manjericão: {
    en: "Basil",
    pt: "Manjericão",
    es: "Albahaca",
    fr: "Basilic",
  },
  Orégano: {
    en: "Oregano",
    pt: "Orégano",
    es: "Orégano",
    fr: "Origan",
  },
  Salsa: {
    en: "Parsley",
    pt: "Salsa",
    es: "Perejil",
    fr: "Persil",
  },
  Cebolinha: {
    en: "Chives",
    pt: "Cebolinha",
    es: "Cebollino",
    fr: "Ciboulette",
  },
  Manteiga: {
    en: "Butter",
    pt: "Manteiga",
    es: "Mantequilla",
    fr: "Beurre",
  },
  "Creme de leite": {
    en: "Heavy Cream",
    pt: "Creme de leite",
    es: "Crema de leche",
    fr: "Crème fraîche",
  },
  "Leite de coco": {
    en: "Coconut Milk",
    pt: "Leite de coco",
    es: "Leche de coco",
    fr: "Lait de coco",
  },
  "Óleo de coco": {
    en: "Coconut Oil",
    pt: "Óleo de coco",
    es: "Aceite de coco",
    fr: "Huile de coco",
  },
  Amêndoas: {
    en: "Almonds",
    pt: "Amêndoas",
    es: "Almendras",
    fr: "Amandes",
  },
  Nozes: {
    en: "Walnuts",
    pt: "Nozes",
    es: "Nueces",
    fr: "Noix",
  },
  Castanhas: {
    en: "Cashews",
    pt: "Castanhas",
    es: "Anacardos",
    fr: "Noix de cajou",
  },
  "Sementes de chia": {
    en: "Chia Seeds",
    pt: "Sementes de chia",
    es: "Semillas de chía",
    fr: "Graines de chia",
  },
  Linhaça: {
    en: "Flaxseed",
    pt: "Linhaça",
    es: "Linaza",
    fr: "Graines de lin",
  },
  Água: {
    en: "Water",
    pt: "Água",
    es: "Agua",
    fr: "Eau",
  },
  Vinagre: {
    en: "Vinegar",
    pt: "Vinagre",
    es: "Vinagre",
    fr: "Vinaigre",
  },
  Mostarda: {
    en: "Mustard",
    pt: "Mostarda",
    es: "Mostaza",
    fr: "Moutarde",
  },
  Paprica: {
    en: "Paprika",
    pt: "Paprica",
    es: "Pimentón",
    fr: "Paprika",
  },
  Cominho: {
    en: "Cumin",
    pt: "Cominho",
    es: "Comino",
    fr: "Cumin",
  },
  Açafrão: {
    en: "Turmeric",
    pt: "Açafrão",
    es: "Cúrcuma",
    fr: "Curcuma",
  },
  Gengibre: {
    en: "Ginger",
    pt: "Gengibre",
    es: "Jengibre",
    fr: "Gingembre",
  },
  Canela: {
    en: "Cinnamon",
    pt: "Canela",
    es: "Canela",
    fr: "Cannelle",
  },
  Baunilha: {
    en: "Vanilla",
    pt: "Baunilha",
    es: "Vainilla",
    fr: "Vanille",
  },
  "Cacau em pó": {
    en: "Cocoa Powder",
    pt: "Cacau em pó",
    es: "Cacao en polvo",
    fr: "Poudre de cacao",
  },
  Stevia: {
    en: "Stevia",
    pt: "Stevia",
    es: "Stevia",
    fr: "Stévia",
  },
  Eritritol: {
    en: "Erythritol",
    pt: "Eritritol",
    es: "Eritritol",
    fr: "Érythritol",
  },
}

export function useContentTranslation() {
  const { language } = useLanguage()

  const translateContent = (content: string | string[] | MultiLangString): string | string[] => {
    // If content is already a string or string array, try to find translation
    if (typeof content === "string") {
      const translation = contentTranslations[content]
      if (translation) {
        const translatedValue = translation[language as keyof MultiLangString]
        return translatedValue || translation.en || content
      }
      return content
    }

    // If content is an array of strings, translate each item
    if (Array.isArray(content)) {
      return content.map((item) => {
        const translation = contentTranslations[item]
        if (translation) {
          const translatedValue = translation[language as keyof MultiLangString]
          return (translatedValue as string) || (translation.en as string) || item
        }
        return item
      })
    }

    // If content is a MultiLangString object, return the appropriate language
    if (content && typeof content === "object" && "en" in content) {
      const translatedValue = content[language as keyof MultiLangString]
      return translatedValue || content.en || ""
    }

    return content as string
  }

  return { translateContent }
}
