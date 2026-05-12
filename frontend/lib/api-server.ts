import { extractList } from './api-helpers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  isEmpty: boolean;
}

/**
 * Server-side fetch wrapper for Next.js Server Components.
 * Handles both single objects and arrays with proper typing.
 */
export async function serverApiFetch<T>(
  endpoint: string,
  options: {
    single?: boolean;
    revalidate?: number;
  } = {}
): Promise<ApiResult<T | T[]>> {
  const { single = false, revalidate = 3600 } = options;
  const url = `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      next: { revalidate },
    });

    if (!response.ok) {
      const errorMsg = `API Error: ${response.status} ${response.statusText}`;
      console.error(errorMsg, { url, status: response.status });
      return { data: null, error: errorMsg, isEmpty: false };
    }

    const data = await response.json();

    if (single) {
      // For single objects, return the object directly
      return { data: data as T, error: null, isEmpty: false };
    } else {
      // For lists, extract and return array
      const items = extractList<T>(data);
      return { data: items, error: null, isEmpty: items.length === 0 };
    }
  } catch (error) {
    const errorMsg = `API Exception: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg, { url, error });
    return { data: null, error: errorMsg, isEmpty: false };
  }
}

/**
 * Legacy function for backward compatibility - returns empty array on error
 * @deprecated Use serverApiFetch with proper error handling
 */
export async function serverApiFetchLegacy<T>(endpoint: string, options: RequestInit = {}): Promise<T[]> {
  const result = await serverApiFetch<T>(endpoint, { ...options, single: false });
  if (result.error || !result.data) {
    console.warn('serverApiFetchLegacy: API failed, returning empty array', { endpoint, error: result.error });
    return [];
  }
  return result.data as T[];
}
