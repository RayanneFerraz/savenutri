export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  readTime: number
  image: string
  author: string
  publishedAt: string
  tags: string[]
}

const articlesData: Article[] = [
  {
    id: "1",
    title: "The Science Behind Intermittent Fasting",
    excerpt: "Discover the biological mechanisms that make intermittent fasting effective for weight loss and health.",
    content: "Intermittent fasting works by changing the way your body processes food and energy...",
    category: "Science",
    readTime: 8,
    image: "/science-of-fasting.png",
    author: "Dr. Sarah Johnson",
    publishedAt: "2024-01-15",
    tags: ["science", "health", "metabolism"],
  },
  {
    id: "2",
    title: "Common Mistakes in Intermittent Fasting",
    excerpt: "Learn about the most common pitfalls and how to avoid them for better results.",
    content: "Many people make these common mistakes when starting intermittent fasting...",
    category: "Tips",
    readTime: 6,
    image: "/placeholder.svg?height=200&width=300&text=Mistakes",
    author: "Mike Chen",
    publishedAt: "2024-01-10",
    tags: ["tips", "mistakes", "beginner"],
  },
  {
    id: "3",
    title: "Breaking Your Fast: What to Eat",
    excerpt: "The best foods to break your fast and maximize the benefits of intermittent fasting.",
    content: "When breaking your fast, it's important to choose the right foods...",
    category: "Nutrition",
    readTime: 5,
    image: "/placeholder.svg?height=200&width=300&text=Breaking+Fast",
    author: "Lisa Rodriguez",
    publishedAt: "2024-01-05",
    tags: ["nutrition", "food", "breaking-fast"],
  },
]

export const articlesDatabase = articlesData
export default articlesData
export type { Article }
