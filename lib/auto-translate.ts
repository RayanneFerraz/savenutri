export type { Language } from "./translations"

// Simple in-memory and localStorage cache
const cache = new Map<string, string>()

// Batch translation queue
const translationQueue = new Map<string, { texts: string[]; resolve: Function[]; reject: Function[] }>()
const BATCH_SIZE = 50
const BATCH_DELAY = 100 // ms

export async function autoTranslate(text: string, target: string): Promise<string> {
  if (!text) return text
  if (typeof window === "undefined") return text

  const key = `${target}:${text}`
  if (cache.has(key)) return cache.get(key) as string
  const stored = localStorage.getItem(key)
  if (stored) {
    cache.set(key, stored)
    return stored
  }

  return new Promise((resolve, reject) => {
    const queueKey = target
    if (!translationQueue.has(queueKey)) {
      translationQueue.set(queueKey, { texts: [], resolve: [], reject: [] })

      // Process batch after delay
      setTimeout(() => processBatch(queueKey), BATCH_DELAY)
    }

    const queue = translationQueue.get(queueKey)!
    queue.texts.push(text)
    queue.resolve.push(resolve)
    queue.reject.push(reject)

    // Process immediately if batch is full
    if (queue.texts.length >= BATCH_SIZE) {
      processBatch(queueKey)
    }
  })
}

async function processBatch(queueKey: string) {
  const queue = translationQueue.get(queueKey)
  if (!queue || queue.texts.length === 0) return

  translationQueue.delete(queueKey)

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_KEY
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: queue.texts, target: queueKey }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) throw new Error("translate failed")
    const data = await res.json()
    const translations = data.data.translations

    // Cache and resolve all translations
    queue.texts.forEach((text, index) => {
      const translated = translations[index]?.translatedText || text
      const key = `${queueKey}:${text}`
      cache.set(key, translated)
      localStorage.setItem(key, translated)
      queue.resolve[index](translated)
    })
  } catch (error) {
    // Return original texts on error
    queue.texts.forEach((text, index) => {
      queue.resolve[index](text)
    })
  }
}

export async function translateArticle(article: any, lang: string) {
  const copy = { ...article }

  try {
    const translations = await Promise.allSettled([
      autoTranslate(article.title, lang),
      autoTranslate(article.description, lang),
      autoTranslate(article.category, lang),
      ...article.tags.map((t: string) => autoTranslate(t, lang)),
    ])

    copy.title = translations[0].status === "fulfilled" ? translations[0].value : article.title
    copy.description = translations[1].status === "fulfilled" ? translations[1].value : article.description
    copy.category = translations[2].status === "fulfilled" ? translations[2].value : article.category
    copy.tags = article.tags.map((tag: string, index: number) => {
      const result = translations[3 + index]
      return result.status === "fulfilled" ? result.value : tag
    })

    // Translate content sections in parallel
    copy.content = await Promise.all(
      article.content.map(async (section: any) => {
        const sec = { ...section }
        const sectionTranslations = await Promise.allSettled([
          autoTranslate(section.title, lang),
          section.content ? autoTranslate(section.content, lang) : Promise.resolve(null),
        ])

        sec.title = sectionTranslations[0].status === "fulfilled" ? sectionTranslations[0].value : section.title
        if (section.content) {
          sec.content = sectionTranslations[1].status === "fulfilled" ? sectionTranslations[1].value : section.content
        }

        if (section.subsections) {
          sec.subsections = await Promise.all(
            section.subsections.map(async (sub: any) => {
              const subTranslations = await Promise.allSettled([
                autoTranslate(sub.title, lang),
                autoTranslate(sub.content, lang),
              ])
              return {
                ...sub,
                title: subTranslations[0].status === "fulfilled" ? subTranslations[0].value : sub.title,
                content: subTranslations[1].status === "fulfilled" ? subTranslations[1].value : sub.content,
              }
            }),
          )
        }

        if (section.items) {
          const itemTranslations = await Promise.allSettled(section.items.map((it: string) => autoTranslate(it, lang)))
          sec.items = section.items.map((item: string, index: number) => {
            const result = itemTranslations[index]
            return result.status === "fulfilled" ? result.value : item
          })
        }

        return sec
      }),
    )
  } catch (error) {
    console.warn("Translation failed, using original content:", error)
  }

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
      item: await autoTranslate(ing.item, lang),
    })),
  )
  return copy
}
