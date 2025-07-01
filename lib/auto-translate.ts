export type { Language } from './translations'

// Simple in-memory and localStorage cache
const cache = new Map<string, string>()

export async function autoTranslate(text: string, target: string): Promise<string> {
  if (!text) return text
  if (typeof window === 'undefined') return text

  const key = `${target}:${text}`
  if (cache.has(key)) return cache.get(key) as string
  const stored = localStorage.getItem(key)
  if (stored) {
    cache.set(key, stored)
    return stored
  }
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_KEY
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target })
      }
    )
    if (!res.ok) throw new Error('translate failed')
    const data = await res.json()
    const translated = data.data.translations[0].translatedText as string
    cache.set(key, translated)
    localStorage.setItem(key, translated)
    return translated
  } catch {
    return text
  }
}

export async function translateArticle(article: any, lang: string) {
  const copy = { ...article }
  copy.title = await autoTranslate(article.title, lang)
  copy.description = await autoTranslate(article.description, lang)
  copy.category = await autoTranslate(article.category, lang)
  copy.tags = await Promise.all(article.tags.map((t: string) => autoTranslate(t, lang)))
  copy.content = await Promise.all(
    article.content.map(async (section: any) => {
      const sec = { ...section }
      sec.title = await autoTranslate(section.title, lang)
      if (section.content) sec.content = await autoTranslate(section.content, lang)
      if (section.subsections) {
        sec.subsections = await Promise.all(
          section.subsections.map(async (sub: any) => ({
            ...sub,
            title: await autoTranslate(sub.title, lang),
            content: await autoTranslate(sub.content, lang)
          }))
        )
      }
      if (section.items) {
        sec.items = await Promise.all(section.items.map((it: string) => autoTranslate(it, lang)))
      }
      return sec
    })
  )
  return copy
}

export async function translateRecipe(recipe: any, lang: string) {
  const copy = { ...recipe }
  copy.title = await autoTranslate(recipe.title, lang)
  copy.description = await autoTranslate(recipe.description, lang)
  copy.category = await autoTranslate(recipe.category, lang)
  copy.tags = await Promise.all(recipe.tags.map((t: string) => autoTranslate(t, lang)))
  copy.ingredients = await Promise.all(
    recipe.ingredients.map(async (ing: any) => ({
      ...ing,
      item: await autoTranslate(ing.item, lang)
    }))
  )
  return copy
}
