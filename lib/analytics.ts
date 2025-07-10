'use client';

export class AnalyticsService {
  static async initializeSession() {
    if (typeof window === 'undefined') {
      console.log('Analytics: Skipping initialization on server side');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || '/api/analytics';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event: 'session_start' }),
      });

      if (!response.ok) {
        throw new Error(`Analytics: Failed to fetch from ${apiUrl}`);
      }

      console.log('Analytics: Session initialized successfully');
    } catch (error) {
      console.error('Analytics: Failed to fetch', error);
    }
  }
}
