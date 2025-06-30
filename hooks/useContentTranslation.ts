"use client"

import { useLanguage } from "@/context/languageContext"

export interface MultiLangString {
  en: string
  pt: string
  es: string
  fr: string
}

// Mapeamento de traduções para títulos e categorias comuns
const contentTranslations = {
  // Categorias de Artigos
  Ciência: {
    en: "Science",
    pt: "Ciência",
    es: "Ciencia",
    fr: "Science",
    ru: "Наука",
    hi: "विज्ञान",
  },
  Fundamentos: {
    en: "Fundamentals",
    pt: "Fundamentos",
    es: "Fundamentos",
    fr: "Fondamentaux",
    ru: "Основы",
    hi: "बुनियादी बातें",
  },
  Benefícios: {
    en: "Benefits",
    pt: "Benefícios",
    es: "Beneficios",
    fr: "Avantages",
    ru: "Преимущества",
    hi: "लाभ",
  },
  Mitos: {
    en: "Myths",
    pt: "Mitos",
    es: "Mitos",
    fr: "Mythes",
    ru: "Мифы",
    hi: "मिथक",
  },
  Preparação: {
    en: "Preparation",
    pt: "Preparação",
    es: "Preparación",
    fr: "Préparation",
    ru: "Подготовка",
    hi: "तैयारी",
  },
  Protocolos: {
    en: "Protocols",
    pt: "Protocolos",
    es: "Protocolos",
    fr: "Protocoles",
    ru: "Протоколы",
    hi: "प्रोटोकॉल",
  },
  Alimentação: {
    en: "Nutrition",
    pt: "Alimentação",
    es: "Alimentación",
    fr: "Nutrition",
    ru: "Питание",
    hi: "पोषण",
  },
  Desafios: {
    en: "Challenges",
    pt: "Desafios",
    es: "Desafíos",
    fr: "Défis",
    ru: "Вызовы",
    hi: "चुनौतियां",
  },
  Potencializadores: {
    en: "Enhancers",
    pt: "Potencializadores",
    es: "Potenciadores",
    fr: "Améliorateurs",
    ru: "Усилители",
    hi: "बढ़ाने वाले",
  },
  "Estilo de Vida": {
    en: "Lifestyle",
    pt: "Estilo de Vida",
    es: "Estilo de Vida",
    fr: "Mode de vie",
    ru: "Образ жизни",
    hi: "जीवन शैली",
  },
  Monitoramento: {
    en: "Monitoring",
    pt: "Monitoramento",
    es: "Monitoreo",
    fr: "Surveillance",
    ru: "Мониторинг",
    hi: "निगरानी",
  },

  // Categorias de Receitas
  "Almoço/Jantar": {
    en: "Lunch/Dinner",
    pt: "Almoço/Jantar",
    es: "Almuerzo/Cena",
    fr: "Déjeuner/Dîner",
    ru: "Обед/Ужин",
    hi: "दोपहर/रात का खाना",
  },
  Lanches: {
    en: "Snacks",
    pt: "Lanches",
    es: "Aperitivos",
    fr: "Collations",
    ru: "Закуски",
    hi: "नाश्ता",
  },
  Bebidas: {
    en: "Beverages",
    pt: "Bebidas",
    es: "Bebidas",
    fr: "Boissons",
    ru: "Напитки",
    hi: "पेय",
  },
  Saladas: {
    en: "Salads",
    pt: "Saladas",
    es: "Ensaladas",
    fr: "Salades",
    ru: "Салаты",
    hi: "सलाद",
  },
  Sobremesas: {
    en: "Desserts",
    pt: "Sobremesas",
    es: "Postres",
    fr: "Desserts",
    ru: "Десерты",
    hi: "मिठाई",
  },

  // Dificuldades
  Fácil: {
    en: "Easy",
    pt: "Fácil",
    es: "Fácil",
    fr: "Facile",
    ru: "Легко",
    hi: "आसान",
  },
  Médio: {
    en: "Medium",
    pt: "Médio",
    es: "Medio",
    fr: "Moyen",
    ru: "Средний",
    hi: "मध्यम",
  },
  Difícil: {
    en: "Hard",
    pt: "Difícil",
    es: "Difícil",
    fr: "Difficile",
    ru: "Сложный",
    hi: "कठिन",
  },

  // Títulos comuns de artigos
  "A Ciência por Trás do Jejum Intermitente": {
    en: "The Science Behind Intermittent Fasting",
    pt: "A Ciência por Trás do Jejum Intermitente",
    es: "La Ciencia Detrás del Ayuno Intermitente",
    fr: "La Science derrière le Jeûne Intermittent",
    ru: "Наука интервального голодания",
    hi: "आंतरायिक उपवास के पीछे का विज्ञान",
  },
  "Como Começar o Jejum Intermitente": {
    en: "How to Start Intermittent Fasting",
    pt: "Como Começar o Jejum Intermitente",
    es: "Cómo Empezar el Ayuno Intermitente",
    fr: "Comment Commencer le Jeûne Intermittent",
    ru: "Как начать интервальное голодание",
    hi: "आंतरायिक उपवास कैसे शुरू करें",
  },
  "Protocolo 16:8 - Guia Completo": {
    en: "16:8 Protocol - Complete Guide",
    pt: "Protocolo 16:8 - Guia Completo",
    es: "Protocolo 16:8 - Guía Completa",
    fr: "Protocole 16:8 - Guide Complet",
    ru: "Протокол 16:8 - Полное руководство",
    hi: "16:8 प्रोटोकॉल - पूर्ण गाइड",
  },
  "Benefícios do Jejum para o Cérebro": {
    en: "Fasting Benefits for the Brain",
    pt: "Benefícios do Jejum para o Cérebro",
    es: "Beneficios del Ayuno para el Cerebro",
    fr: "Avantages du Jeûne pour le Cerveau",
    ru: "Преимущества голодания для мозга",
    hi: "मस्तिष्क के लिए उपवास के लाभ",
  },
  "Mitos e Verdades sobre Jejum": {
    en: "Myths and Truths about Fasting",
    pt: "Mitos e Verdades sobre Jejum",
    es: "Mitos y Verdades sobre el Ayuno",
    fr: "Mythes et Vérités sur le Jeûne",
    ru: "Мифы и правда о голодании",
    hi: "उपवास के बारे में मिथक और सच्चाई",
  },
} as const

export const useContentTranslation = () => {
  const { language, t } = useLanguage()

  const translateContent = (content: string | MultiLangString): string => {
    if (typeof content === "string") {
      // If it's a string, treat it as a translation key
      return t(content as any)
    } else if (typeof content === "object" && content !== null && language in content) {
      // If it's a MultiLangString object, return the text for the current language
      return content[language as keyof MultiLangString] || content.en
    }
    return "" // Fallback for undefined content
  }

  return { translateContent }
}
