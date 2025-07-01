import type { Article, ContentSection } from "./articles-data"
import type { Recipe } from "./recipes-data"
import type { Language } from "./translations"

const cache: Record<string, string> = {}

export async function translate(text: string, to: Language, from = "pt"): Promise<string> {
  const key = `${from}:${to}:${text}`
  if (cache[key]) return cache[key]
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const data = await res.json()
    const translated = (data[0] as any[]).map((part) => part[0]).join("")
    cache[key] = translated
    return translated
  } catch {
    return text
  }
}

export async function translateArticle(article: Article, lang: Language): Promise<Article> {
  const content: ContentSection[] = []
  for (const sec of article.content) {
    const translatedSec: ContentSection = { ...sec }
    translatedSec.title = await translate(sec.title, lang)
    if (sec.content) translatedSec.content = await translate(sec.content, lang)
    if (sec.items) translatedSec.items = await Promise.all(sec.items.map((i) => translate(i, lang)))
    if (sec.subsections) {
      translatedSec.subsections = []
      for (const sub of sec.subsections) {
        translatedSec.subsections.push({
          title: await translate(sub.title, lang),
          content: await translate(sub.content, lang),
        })
      }
    }
    content.push(translatedSec)
  }
  return {
    ...article,
    title: await translate(article.title, lang),
    description: await translate(article.description, lang),
    category: await translate(article.category, lang),
    tags: await Promise.all(article.tags.map((t) => translate(t, lang))),
    content,
  }
}

export async function translateRecipe(recipe: Recipe, lang: Language): Promise<Recipe> {
  return {
    ...recipe,
    title: await translate(recipe.title, lang),
    description: await translate(recipe.description, lang),
    category: await translate(recipe.category, lang),
    difficulty: await translate(recipe.difficulty, lang),
    tags: await Promise.all(recipe.tags.map((t) => translate(t, lang))),
    ingredients: await Promise.all(
      recipe.ingredients.map(async (ing) => ({
        ...ing,
        item: await translate(ing.item, lang),
      }))
    ),
  }
}

export interface BlogPostForTranslate {
  id: number
  title: string
  description: string
  excerpt: string
  content: string
  tags: string[]
}

export async function translateBlogPost(post: BlogPostForTranslate, lang: Language): Promise<BlogPostForTranslate> {
  return {
    ...post,
    title: await translate(post.title, lang),
    description: await translate(post.description, lang),
    excerpt: await translate(post.excerpt, lang),
    content: await translate(post.content, lang),
    tags: await Promise.all(post.tags.map((t) => translate(t, lang))),
  }
}
