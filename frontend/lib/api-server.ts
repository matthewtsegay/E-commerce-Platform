import { extractList } from './api-helpers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Basic server-side fetch wrapper for Next.js Server Components.
 * This does NOT handle authentication as it's intended for public data
 * like product lists and collections on the homepage.
 */
export async function serverApiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T[]> {
  const url = `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      next: { revalidate: 3600, ...(options.next || {}) }, // Default 1 hour revalidation
    });

    if (!response.ok) {
      console.error(`API Fetch Error: ${response.status} ${response.statusText} for ${url}`);
      return [];
    }

    const data = await response.json();
    return extractList<T>(data);
  } catch (error) {
    console.error(`API Fetch Exception for ${url}:`, error);
    return [];
  }
}
