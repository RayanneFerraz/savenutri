export interface Recipe {
  id: number
  title: {
    en: string
    pt: string
    es: string
    fr: string
  }
  description: {
    en: string
    pt: string
    es: string
    fr: string
  }
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  prepTime: number
  cookTime: number
  servings: number
  rating: number
  reviews: number
  image: string
  tags: string[]
  ingredients: {
    en: string[]
    pt: string[]
    es: string[]
    fr: string[]
  }
  instructions: {
    en: string[]
    pt: string[]
    es: string[]
    fr: string[]
  }
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

const recipesData: { [key: string]: Recipe } = {
  "1": {
    id: 1,
    title: {
      en: "Protein-Rich Breakfast Bowl",
      pt: "Bowl de Café da Manhã Rico em Proteína",
      es: "Bowl de Desayuno Rico en Proteína",
      fr: "Bol de Petit-Déjeuner Riche en Protéines",
    },
    description: {
      en: "A nutritious and filling breakfast bowl perfect for breaking your fast",
      pt: "Um bowl nutritivo e satisfatório perfeito para quebrar seu jejum",
      es: "Un bowl nutritivo y satisfactorio perfecto para romper tu ayuno",
      fr: "Un bol nutritif et rassasiant parfait pour rompre votre jeûne",
    },
    category: "Breakfast",
    difficulty: "Easy",
    prepTime: 10,
    cookTime: 5,
    servings: 1,
    rating: 4.7,
    reviews: 156,
    image: "/placeholder.svg?height=200&width=300&text=Protein+Bowl",
    tags: ["protein", "healthy", "quick"],
    ingredients: {
      en: [
        "1 cup Greek yogurt",
        "1/2 cup rolled oats",
        "1 tablespoon chia seeds",
        "1/2 banana, sliced",
        "1/4 cup blueberries",
        "1 tablespoon almond butter",
        "1 teaspoon honey",
        "1/4 cup chopped almonds",
      ],
      pt: [
        "1 xícara de iogurte grego",
        "1/2 xícara de aveia em flocos",
        "1 colher de sopa de sementes de chia",
        "1/2 banana fatiada",
        "1/4 xícara de mirtilos",
        "1 colher de sopa de pasta de amêndoa",
        "1 colher de chá de mel",
        "1/4 xícara de amêndoas picadas",
      ],
      es: [
        "1 taza de yogur griego",
        "1/2 taza de avena en hojuelas",
        "1 cucharada de semillas de chía",
        "1/2 plátano en rodajas",
        "1/4 taza de arándanos",
        "1 cucharada de mantequilla de almendra",
        "1 cucharadita de miel",
        "1/4 taza de almendras picadas",
      ],
      fr: [
        "1 tasse de yaourt grec",
        "1/2 tasse de flocons d'avoine",
        "1 cuillère à soupe de graines de chia",
        "1/2 banane tranchée",
        "1/4 tasse de myrtilles",
        "1 cuillère à soupe de beurre d'amande",
        "1 cuillère à café de miel",
        "1/4 tasse d'amandes hachées",
      ],
    },
    instructions: {
      en: [
        "In a bowl, combine Greek yogurt and rolled oats",
        "Add chia seeds and mix well",
        "Top with sliced banana and blueberries",
        "Drizzle with almond butter and honey",
        "Sprinkle chopped almonds on top",
        "Let sit for 5 minutes to allow oats to soften",
        "Enjoy immediately",
      ],
      pt: [
        "Em uma tigela, combine iogurte grego e aveia em flocos",
        "Adicione sementes de chia e misture bem",
        "Cubra com banana fatiada e mirtilos",
        "Regue com pasta de amêndoa e mel",
        "Polvilhe amêndoas picadas por cima",
        "Deixe descansar por 5 minutos para a aveia amolecer",
        "Aproveite imediatamente",
      ],
      es: [
        "En un bowl, combina yogur griego y avena en hojuelas",
        "Agrega semillas de chía y mezcla bien",
        "Cubre con plátano en rodajas y arándanos",
        "Rocía con mantequilla de almendra y miel",
        "Espolvorea almendras picadas encima",
        "Deja reposar 5 minutos para que la avena se ablande",
        "Disfruta inmediatamente",
      ],
      fr: [
        "Dans un bol, combinez yaourt grec et flocons d'avoine",
        "Ajoutez les graines de chia et mélangez bien",
        "Garnissez avec la banane tranchée et les myrtilles",
        "Arrosez avec le beurre d'amande et le miel",
        "Saupoudrez les amandes hachées sur le dessus",
        "Laissez reposer 5 minutes pour que l'avoine ramollisse",
        "Dégustez immédiatement",
      ],
    },
    nutrition: {
      calories: 420,
      protein: 25,
      carbs: 45,
      fat: 18,
    },
  },
  "2": {
    id: 2,
    title: {
      en: "Mediterranean Quinoa Salad",
      pt: "Salada de Quinoa Mediterrânea",
      es: "Ensalada de Quinoa Mediterránea",
      fr: "Salade de Quinoa Méditerranéenne",
    },
    description: {
      en: "A fresh and healthy salad packed with Mediterranean flavors",
      pt: "Uma salada fresca e saudável repleta de sabores mediterrâneos",
      es: "Una ensalada fresca y saludable llena de sabores mediterráneos",
      fr: "Une salade fraîche et saine pleine de saveurs méditerranéennes",
    },
    category: "Lunch",
    difficulty: "Easy",
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    rating: 4.8,
    reviews: 203,
    image: "/placeholder.svg?height=200&width=300&text=Quinoa+Salad",
    tags: ["mediterranean", "vegetarian", "healthy"],
    ingredients: {
      en: [
        "1 cup quinoa",
        "2 cups vegetable broth",
        "1 cucumber, diced",
        "1 cup cherry tomatoes, halved",
        "1/2 red onion, thinly sliced",
        "1/2 cup kalamata olives",
        "1/2 cup feta cheese, crumbled",
        "1/4 cup fresh parsley, chopped",
        "3 tablespoons olive oil",
        "2 tablespoons lemon juice",
        "1 teaspoon dried oregano",
        "Salt and pepper to taste",
      ],
      pt: [
        "1 xícara de quinoa",
        "2 xícaras de caldo de vegetais",
        "1 pepino cortado em cubos",
        "1 xícara de tomates cereja cortados pela metade",
        "1/2 cebola roxa fatiada finamente",
        "1/2 xícara de azeitonas kalamata",
        "1/2 xícara de queijo feta esfarelado",
        "1/4 xícara de salsa fresca picada",
        "3 colheres de sopa de azeite",
        "2 colheres de sopa de suco de limão",
        "1 colher de chá de orégano seco",
        "Sal e pimenta a gosto",
      ],
      es: [
        "1 taza de quinoa",
        "2 tazas de caldo de vegetales",
        "1 pepino cortado en cubos",
        "1 taza de tomates cherry cortados por la mitad",
        "1/2 cebolla roja en rodajas finas",
        "1/2 taza de aceitunas kalamata",
        "1/2 taza de queso feta desmenuzado",
        "1/4 taza de perejil fresco picado",
        "3 cucharadas de aceite de oliva",
        "2 cucharadas de jugo de limón",
        "1 cucharadita de orégano seco",
        "Sal y pimienta al gusto",
      ],
      fr: [
        "1 tasse de quinoa",
        "2 tasses de bouillon de légumes",
        "1 concombre coupé en dés",
        "1 tasse de tomates cerises coupées en deux",
        "1/2 oignon rouge émincé",
        "1/2 tasse d'olives kalamata",
        "1/2 tasse de fromage feta émietté",
        "1/4 tasse de persil frais haché",
        "3 cuillères à soupe d'huile d'olive",
        "2 cuillères à soupe de jus de citron",
        "1 cuillère à café d'origan séché",
        "Sel et poivre au goût",
      ],
    },
    instructions: {
      en: [
        "Rinse quinoa under cold water until water runs clear",
        "In a saucepan, bring vegetable broth to a boil",
        "Add quinoa, reduce heat, cover and simmer for 15 minutes",
        "Remove from heat and let stand 5 minutes, then fluff with a fork",
        "Let quinoa cool completely",
        "In a large bowl, combine cooled quinoa, cucumber, tomatoes, and red onion",
        "Add olives, feta cheese, and parsley",
        "In a small bowl, whisk together olive oil, lemon juice, and oregano",
        "Pour dressing over salad and toss gently",
        "Season with salt and pepper",
        "Refrigerate for at least 30 minutes before serving",
      ],
      pt: [
        "Enxágue a quinoa em água fria até a água sair limpa",
        "Em uma panela, ferva o caldo de vegetais",
        "Adicione a quinoa, reduza o fogo, tampe e cozinhe por 15 minutos",
        "Retire do fogo e deixe descansar 5 minutos, depois solte com um garfo",
        "Deixe a quinoa esfriar completamente",
        "Em uma tigela grande, combine quinoa fria, pepino, tomates e cebola roxa",
        "Adicione azeitonas, queijo feta e salsa",
        "Em uma tigela pequena, misture azeite, suco de limão e orégano",
        "Despeje o molho sobre a salada e misture delicadamente",
        "Tempere com sal e pimenta",
        "Refrigere por pelo menos 30 minutos antes de servir",
      ],
      es: [
        "Enjuaga la quinoa bajo agua fría hasta que el agua salga clara",
        "En una cacerola, hierve el caldo de vegetales",
        "Agrega la quinoa, reduce el fuego, tapa y cocina a fuego lento por 15 minutos",
        "Retira del fuego y deja reposar 5 minutos, luego esponja con un tenedor",
        "Deja que la quinoa se enfríe completamente",
        "En un bowl grande, combina quinoa fría, pepino, tomates y cebolla roja",
        "Agrega aceitunas, queso feta y perejil",
        "En un bowl pequeño, mezcla aceite de oliva, jugo de limón y orégano",
        "Vierte el aderezo sobre la ensalada y mezcla suavemente",
        "Sazona con sal y pimienta",
        "Refrigera por al menos 30 minutos antes de servir",
      ],
      fr: [
        "Rincez le quinoa à l'eau froide jusqu'à ce que l'eau soit claire",
        "Dans une casserole, portez le bouillon de légumes à ébullition",
        "Ajoutez le quinoa, réduisez le feu, couvrez et laissez mijoter 15 minutes",
        "Retirez du feu et laissez reposer 5 minutes, puis aérez avec une fourchette",
        "Laissez le quinoa refroidir complètement",
        "Dans un grand bol, combinez quinoa refroidi, concombre, tomates et oignon rouge",
        "Ajoutez les olives, le fromage feta et le persil",
        "Dans un petit bol, fouettez ensemble huile d'olive, jus de citron et origan",
        "Versez la vinaigrette sur la salade et mélangez délicatement",
        "Assaisonnez avec sel et poivre",
        "Réfrigérez au moins 30 minutes avant de servir",
      ],
    },
    nutrition: {
      calories: 380,
      protein: 14,
      carbs: 42,
      fat: 18,
    },
  },
  "3": {
    id: 3,
    title: {
      en: "Grilled Chicken with Vegetables",
      pt: "Frango Grelhado com Legumes",
      es: "Pollo a la Parrilla con Verduras",
      fr: "Poulet Grillé aux Légumes",
    },
    description: {
      en: "Simple and healthy grilled chicken breast with colorful vegetables",
      pt: "Peito de frango grelhado simples e saudável com legumes coloridos",
      es: "Pechuga de pollo a la parrilla simple y saludable con verduras coloridas",
      fr: "Poitrine de poulet grillée simple et saine avec des légumes colorés",
    },
    category: "Lunch/Dinner",
    difficulty: "Easy",
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    rating: 4.6,
    reviews: 178,
    image: "/placeholder.svg?height=200&width=300&text=Grilled+Chicken",
    tags: ["protein", "healthy", "low-carb"],
    ingredients: {
      en: [
        "2 chicken breasts (6 oz each)",
        "1 zucchini, sliced",
        "1 bell pepper, sliced",
        "1 red onion, sliced",
        "2 tablespoons olive oil",
        "1 teaspoon garlic powder",
        "1 teaspoon dried herbs",
        "Salt and pepper to taste",
        "Lemon wedges for serving",
      ],
      pt: [
        "2 peitos de frango (170g cada)",
        "1 abobrinha fatiada",
        "1 pimentão fatiado",
        "1 cebola roxa fatiada",
        "2 colheres de sopa de azeite",
        "1 colher de chá de alho em pó",
        "1 colher de chá de ervas secas",
        "Sal e pimenta a gosto",
        "Fatias de limão para servir",
      ],
      es: [
        "2 pechugas de pollo (170g cada una)",
        "1 calabacín en rodajas",
        "1 pimiento en rodajas",
        "1 cebolla roja en rodajas",
        "2 cucharadas de aceite de oliva",
        "1 cucharadita de ajo en polvo",
        "1 cucharadita de hierbas secas",
        "Sal y pimienta al gusto",
        "Gajos de limón para servir",
      ],
      fr: [
        "2 poitrines de poulet (170g chacune)",
        "1 courgette tranchée",
        "1 poivron tranché",
        "1 oignon rouge tranché",
        "2 cuillères à soupe d'huile d'olive",
        "1 cuillère à café d'ail en poudre",
        "1 cuillère à café d'herbes séchées",
        "Sel et poivre au goût",
        "Quartiers de citron pour servir",
      ],
    },
    instructions: {
      en: [
        "Preheat grill or grill pan to medium-high heat",
        "Season chicken breasts with salt, pepper, and garlic powder",
        "Brush chicken with 1 tablespoon olive oil",
        "Grill chicken for 6-7 minutes per side until cooked through",
        "Meanwhile, toss vegetables with remaining olive oil and herbs",
        "Grill vegetables for 8-10 minutes, turning occasionally",
        "Let chicken rest for 5 minutes before slicing",
        "Serve chicken with grilled vegetables and lemon wedges",
      ],
      pt: [
        "Preaqueça a grelha ou frigideira grill em fogo médio-alto",
        "Tempere os peitos de frango com sal, pimenta e alho em pó",
        "Pincele o frango com 1 colher de sopa de azeite",
        "Grelhe o frango por 6-7 minutos de cada lado até cozinhar completamente",
        "Enquanto isso, misture os legumes com o azeite restante e ervas",
        "Grelhe os legumes por 8-10 minutos, virando ocasionalmente",
        "Deixe o frango descansar por 5 minutos antes de fatiar",
        "Sirva o frango com legumes grelhados e fatias de limão",
      ],
      es: [
        "Precalienta la parrilla o sartén grill a fuego medio-alto",
        "Sazona las pechugas de pollo con sal, pimienta y ajo en polvo",
        "Pincela el pollo con 1 cucharada de aceite de oliva",
        "Asa el pollo por 6-7 minutos por lado hasta que esté cocido",
        "Mientras tanto, mezcla las verduras con el aceite restante y hierbas",
        "Asa las verduras por 8-10 minutos, volteando ocasionalmente",
        "Deja reposar el pollo por 5 minutos antes de cortar",
        "Sirve el pollo con verduras asadas y gajos de limón",
      ],
      fr: [
        "Préchauffez le grill ou la poêle grill à feu moyen-vif",
        "Assaisonnez les poitrines de poulet avec sel, poivre et ail en poudre",
        "Badigeonnez le poulet avec 1 cuillère à soupe d'huile d'olive",
        "Grillez le poulet 6-7 minutes de chaque côté jusqu'à cuisson complète",
        "Pendant ce temps, mélangez les légumes avec l'huile restante et les herbes",
        "Grillez les légumes 8-10 minutes en retournant occasionnellement",
        "Laissez reposer le poulet 5 minutes avant de trancher",
        "Servez le poulet avec les légumes grillés et les quartiers de citron",
      ],
    },
    nutrition: {
      calories: 320,
      protein: 35,
      carbs: 12,
      fat: 15,
    },
  },
}

// -----------------------------
// Legacy-style exports — keeps old pages working
// -----------------------------

// Convert the recipe object map into an ordered array.
export const recipesDatabase: Recipe[] = Object.values(recipesData).sort((a, b) => a.id - b.id)

// Helper to fetch a recipe by id (used in multiple pages)
export function getRecipeById(id: number) {
  return recipesDatabase.find((recipe) => recipe.id === id)
}

// (Optional) still export the object map as default
export default recipesData
