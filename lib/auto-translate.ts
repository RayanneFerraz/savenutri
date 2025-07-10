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
