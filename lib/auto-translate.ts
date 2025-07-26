'use client';

import { cache } from 'react';

export const autoTranslate = cache(async (text: string, targetLang: string) => {
  if (typeof window === 'undefined') {
    console.log('Auto-translate: Skipping on server side');
    return text;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    console.error('Auto-translate: Missing Google Translate API key');
    return text;
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch translation');
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Auto-translate: Failed to fetch', error);
    return text;
  }
});

// Utility helpers to translate entire article or recipe objects
import type { Article, ContentSection } from './articles-data';
import type { Language } from './translations';

// Minimal recipe type used for translation
interface Recipe {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  ingredients: { item: string; amount: string; calories: number }[];
  originalCategory?: string;
  [key: string]: any;
}

// Translate a single content section of an article
async function translateSection(
  section: ContentSection,
  lang: Language
): Promise<ContentSection> {
  return {
    ...section,
    title: await autoTranslate(section.title, lang),
    content: section.content
      ? await autoTranslate(section.content, lang)
      : undefined,
    subsections: section.subsections
      ? await Promise.all(
          section.subsections.map(async (sub) => ({
            title: await autoTranslate(sub.title, lang),
            content: await autoTranslate(sub.content, lang),
          }))
        )
      : undefined,
    items: section.items
      ? await Promise.all(section.items.map((i) => autoTranslate(i, lang)))
      : undefined,
  };
}

export async function translateArticle(
  article: Article,
  lang: Language
): Promise<Article> {
  if (lang === 'pt') return article;
  const content = await Promise.all(
    article.content.map((s) => translateSection(s, lang))
  );
  const tags = await Promise.all(article.tags.map((t) => autoTranslate(t, lang)));
  return {
    ...article,
    originalCategory: article.category,
    title: await autoTranslate(article.title, lang),
    description: await autoTranslate(article.description, lang),
    category: await autoTranslate(article.category, lang),
    tags,
    content,
  };
}

export async function translateRecipe(
  recipe: Recipe,
  lang: Language
): Promise<Recipe> {
  if (lang === 'pt') return recipe;
  const ingredients = await Promise.all(
    recipe.ingredients.map(async (ing) => ({
      ...ing,
      item: await autoTranslate(ing.item, lang),
    }))
  );
  const tags = await Promise.all(recipe.tags.map((t) => autoTranslate(t, lang)));
  return {
    ...recipe,
    originalCategory: recipe.category,
    title: await autoTranslate(recipe.title, lang),
    description: await autoTranslate(recipe.description, lang),
    category: await autoTranslate(recipe.category, lang),
    difficulty: await autoTranslate(recipe.difficulty, lang),
    tags,
    ingredients,
  };
}

