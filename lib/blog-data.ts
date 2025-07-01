export interface BlogAuthor {
  name: string
  avatar: string
  bio: string
  isVerified: boolean
}

export interface BlogPost {
  id: number
  title: string
  description: string
  excerpt: string
  category: string
  readTime: string
  views: number
  likes: number
  comments: number
  publishDate: string
  author: BlogAuthor
  image: string
  tags: string[]
  featured?: boolean
  trending?: boolean
  content: string
  translations?: Partial<Record<import("./translations").Language, {
    title?: string
    description?: string
    excerpt?: string
    content?: string
  }>>
}

export const blogPosts: BlogPost[] = [
  {
    id: 101,
    title: "Minha Jornada de 90 Dias com Jejum 16:8",
    description: "Como o jejum intermitente transformou minha vida e rotina diária",
    excerpt:
      "Há 3 meses decidi experimentar o jejum 16:8 e os resultados me surpreenderam! Aqui conto tudo sobre minha experiência, os desafios e as conquistas.",
    category: "experiences",
    readTime: "5 min",
    views: 1850,
    likes: 124,
    comments: 23,
    publishDate: "2025-06-18",
    author: {
      name: "Marina Santos",
      avatar: "MS",
      bio: "Praticante de jejum intermitente há 2 anos",
      isVerified: false,
    },
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Experiência Pessoal", "16:8", "Transformação"],
    featured: false,
    trending: true,
    content:
      "Depois de 90 dias seguindo o protocolo 16:8, percebi mudanças incríveis no meu nível de energia e foco. Compartilho minhas dificuldades iniciais e como consegui superá-las.",
    translations: {
      en: {
        title: "My 90-Day Journey with 16:8 Fasting",
        description: "How intermittent fasting changed my daily life",
        excerpt:
          "Three months ago I decided to try the 16:8 fast and the results surprised me! Here I share my experience, challenges and achievements.",
        content:
          "After 90 days following the 16:8 protocol I noticed amazing changes in my energy and focus levels. I share the initial struggles and how I overcame them.",
      },
      es: {
        title: "Mi Viaje de 90 Días con el Ayuno 16:8",
        description: "Cómo el ayuno intermitente transformó mi vida diaria",
        excerpt:
          "Hace 3 meses decidí probar el ayuno 16:8 y los resultados me sorprendieron. ¡Aquí cuento todo sobre mi experiencia, los desafíos y los logros!",
        content:
          "Tras 90 días siguiendo el protocolo 16:8 noté cambios increíbles en mi nivel de energía y concentración. Comparto mis dificultades iniciales y cómo las superé.",
      },
      fr: {
        title: "Mon Parcours de 90 Jours avec le Jeûne 16:8",
        description: "Comment le jeûne intermittent a transformé ma routine",
        excerpt:
          "Il y a trois mois j'ai décidé d'essayer le jeûne 16:8 et les résultats m'ont surpris ! Je raconte ici mon expérience, les défis et les réussites.",
        content:
          "Après 90 jours suivant le protocole 16:8 j'ai constaté des changements incroyables dans mon niveau d'énergie et de concentration. Je partage les difficultés initiales et comment je les ai surmontées.",
      },
    },
  },
  {
    id: 102,
    title: "5 Erros que Cometi no Meu Primeiro Mês de Jejum",
    description: "Aprenda com os meus erros para ter uma jornada mais suave",
    excerpt:
      "No início, cometi alguns erros básicos que atrapalharam meus resultados. Compartilho aqui os principais para que você não passe pelo mesmo! 😅",
    category: "experiences",
    readTime: "4 min",
    views: 1420,
    likes: 89,
    comments: 31,
    publishDate: "2025-06-16",
    author: {
      name: "Carlos Mendes",
      avatar: "CM",
      bio: "Iniciante no jejum intermitente",
      isVerified: false,
    },
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Erros Comuns", "Iniciante", "Dicas"],
    content:
      "Durante o primeiro mês eu me sabotei algumas vezes com lanches fora de hora e pouca hidratação. Aqui estão os principais deslizes e como corrigi-los.",
  },
  {
    id: 103,
    title: "Receita: Smoothie Perfeito para Quebrar o Jejum",
    description: "Uma receita nutritiva e deliciosa para sua primeira refeição",
    excerpt:
      "Depois de testar várias combinações, encontrei a receita perfeita! Rico em nutrientes e super saboroso. Vou ensinar o passo a passo! 🥤",
    category: "recipes",
    readTime: "3 min",
    views: 980,
    likes: 67,
    comments: 15,
    publishDate: "2025-06-14",
    author: {
      name: "Chef Ana Paula",
      avatar: "AP",
      bio: "Culinarista especializada em alimentação saudável",
      isVerified: true,
    },
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Receita", "Smoothie", "Quebra-Jejum"],
    content:
      "Compartilho minha receita favorita de smoothie para quebrar o jejum. É simples, rápido e cheio de sabor.",
  },
  {
    id: 104,
    title: "Como Manter a Motivação nos Dias Difíceis",
    description: "Estratégias para não desistir quando a vontade de comer bater forte",
    excerpt:
      "Todos temos aqueles dias em que a fome parece insuportável. Aqui estão minhas estratégias favoritas para manter o foco! 💪",
    category: "motivation",
    readTime: "4 min",
    views: 1230,
    likes: 95,
    comments: 28,
    publishDate: "2025-06-12",
    author: {
      name: "Psicóloga Laura Dias",
      avatar: "LD",
      bio: "Especialista em mudança de hábitos",
      isVerified: true,
    },
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Motivação", "Mindset", "Persistência"],
    trending: true,
    content:
      "Motivação pode faltar nos piores momentos. Comparto técnicas de psicologia para se manter firme no objetivo.",
  },
  {
    id: 105,
    title: "Dica Rápida: Como Lidar com a Fome Social",
    description: "O que fazer quando todos estão comendo e você está em jejum",
    excerpt:
      "Aquele momento constrangedor quando você está em jejum e todos estão comendo... Tenho algumas dicas que funcionam! 🤝",
    category: "quickTips",
    readTime: "2 min",
    views: 890,
    likes: 52,
    comments: 19,
    publishDate: "2025-06-10",
    author: {
      name: "Roberto Silva",
      avatar: "RS",
      bio: "Praticante de jejum há 3 anos",
      isVerified: false,
    },
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Dica Rápida", "Social", "Estratégia"],
    content:
      "Quando todos estão comendo é difícil manter o foco. Veja como driblo essas situações de forma educada e sem sair do jejum.",
  },
  {
    id: 106,
    title: "Por Que Quase Desisti (E Como Não Desisti)",
    description: "Minha crise de motivação na terceira semana e como superei",
    excerpt:
      "Na terceira semana, pensei seriamente em desistir. A balança não se mexia e eu estava frustrada. Mas algo mudou... ✨",
    category: "motivation",
    readTime: "6 min",
    views: 1560,
    likes: 118,
    comments: 42,
    publishDate: "2025-06-08",
    author: {
      name: "Juliana Costa",
      avatar: "JC",
      bio: "Transformação em andamento",
      isVerified: false,
    },
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Superação", "Motivação", "Persistência"],
    content:
      "Compartilho o momento em que quase desisti do jejum e o que me fez continuar firme até hoje.",
  },
  {
    id: 107,
    title: "Jejum no Trabalho: Minhas Estratégias",
    description: "Como manter o jejum mesmo com a rotina corrida do escritório",
    excerpt:
      "Trabalhar 8h por dia e manter o jejum pode ser desafiador. Compartilho minhas estratégias que realmente funcionam! 💼",
    category: "quickTips",
    readTime: "4 min",
    views: 1340,
    likes: 78,
    comments: 25,
    publishDate: "2025-06-06",
    author: {
      name: "Pedro Oliveira",
      avatar: "PO",
      bio: "Executivo e praticante de jejum",
      isVerified: false,
    },
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Trabalho", "Rotina", "Estratégia"],
    content:
      "Como conciliar a rotina de escritório e o jejum? Estas dicas me ajudam diariamente.",
  },
  {
    id: 108,
    title: "Celebrando Meus Primeiros 10kg Perdidos! 🎉",
    description: "Um marco importante na minha jornada de emagrecimento",
    excerpt:
      "Hoje completei 4 meses de jejum e perdi 10kg! Quero compartilhar essa alegria e algumas reflexões sobre o processo. 🎊",
    category: "experiences",
    readTime: "5 min",
    views: 2100,
    likes: 156,
    comments: 38,
    publishDate: "2025-06-04",
    author: {
      name: "Fernanda Lima",
      avatar: "FL",
      bio: "Em transformação há 4 meses",
      isVerified: false,
    },
    image: "/placeholder.svg?height=200&width=300",
    tags: ["Conquista", "Emagrecimento", "Celebração"],
    featured: true,
    content:
      "Após meses de dedicação, alcancei a marca de 10kg perdidos e me sinto renovada. Veja minhas lições aprendidas.",
  },
]

export function getBlogPostById(id: number, lang?: import("./translations").Language): BlogPost | undefined {
  const post = blogPosts.find((p) => p.id === id)
  if (!post) return undefined
  if (lang && post.translations?.[lang]) {
    return { ...post, ...post.translations[lang]! }
  }
  return post
}
