export type { Language } from "./translations"

interface TranslationCache {
  [key: string]: string
}

const translationCache: TranslationCache = {}

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

// Batch translation function
async function batchTranslate(texts: string[], targetLanguage: string): Promise<string[]> {
  if (targetLanguage === "pt") {
    return texts
  }

  const cacheKey = `${targetLanguage}_${texts.join("|")}`
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey].split("|")
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(texts.join("\n|||SEPARATOR|||\n"))}`,
      {
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error("Translation failed")
    }

    const data = await response.json()
    const translatedText = data[0]?.map((item: any) => item[0]).join("") || texts.join("\n|||SEPARATOR|||\n")
    const translatedTexts = translatedText.split("\n|||SEPARATOR|||\n")

    // Cache the result
    translationCache[cacheKey] = translatedTexts.join("|")

    return translatedTexts.length === texts.length ? translatedTexts : texts
  } catch (error) {
    console.warn("Translation failed, using original text:", error)
    return texts
  }
}

export async function translateArticle(article: any, targetLanguage: string) {
  if (targetLanguage === "pt") {
    return article
  }

  try {
    // Collect all texts to translate
    const textsToTranslate: string[] = [
      article.title,
      article.description,
      article.category,
      article.author,
      ...article.tags,
    ]

    // Add content texts
    const contentTexts: string[] = []
    article.content.forEach((section: any) => {
      contentTexts.push(section.title)
      if (section.content) contentTexts.push(section.content)
      if (section.subsections) {
        section.subsections.forEach((sub: any) => {
          contentTexts.push(sub.title, sub.content)
        })
      }
      if (section.items) {
        contentTexts.push(...section.items)
      }
    })

    textsToTranslate.push(...contentTexts)

    // Batch translate all texts
    const translatedTexts = await batchTranslate(textsToTranslate, targetLanguage)

    let textIndex = 0
    const translatedArticle = {
      ...article,
      title: translatedTexts[textIndex++] || article.title,
      description: translatedTexts[textIndex++] || article.description,
      category: translatedTexts[textIndex++] || article.category,
      author: translatedTexts[textIndex++] || article.author,
      tags: article.tags.map(() => translatedTexts[textIndex++] || ""),
    }

    // Translate content
    translatedArticle.content = article.content.map((section: any) => {
      const translatedSection = {
        ...section,
        title: translatedTexts[textIndex++] || section.title,
      }

      if (section.content) {
        translatedSection.content = translatedTexts[textIndex++] || section.content
      }

      if (section.subsections) {
        translatedSection.subsections = section.subsections.map((sub: any) => ({
          ...sub,
          title: translatedTexts[textIndex++] || sub.title,
          content: translatedTexts[textIndex++] || sub.content,
        }))
      }

      if (section.items) {
        translatedSection.items = section.items.map(() => translatedTexts[textIndex++] || "")
      }

      return translatedSection
    })

    return translatedArticle
  } catch (error) {
    console.warn("Article translation failed, using original:", error)
    return article
  }
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
