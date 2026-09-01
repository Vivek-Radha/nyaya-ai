/**
 * Centralized API configuration and request helpers for NyayaAI.
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

// In production, use configured API base URL without trailing slash.
// In local development, fallback to http://localhost:8000 if not specified.
export const API_BASE_URL = (rawBaseUrl && rawBaseUrl.trim())
  ? rawBaseUrl.trim().replace(/\/$/, '')
  : (import.meta.env.DEV ? 'http://localhost:8000' : '');

/**
 * Constructs a fully qualified API endpoint URL.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Human-friendly error message formatter that catches network errors,
 * CORS blockages, timeouts, and Render free-tier cold starts.
 */
export function formatApiError(err: unknown, defaultMsg: string = 'An unexpected error occurred'): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (err.name === 'AbortError' || msg.includes('timeout') || msg.includes('aborted')) {
      return 'Request timed out. The backend server might still be waking up from a cold start. Please wait 30 seconds and try again.';
    }
    if (
      (err.name === 'TypeError' && (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed'))) ||
      msg.includes('cannot connect')
    ) {
      return 'Unable to reach the NyayaAI backend server. If the backend is waking up from a cold start (Render free tier), please wait 30-45 seconds and try again.';
    }
    return err.message;
  }
  return typeof err === 'string' ? err : defaultMsg;
}

/**
 * Fetch wrapper with timeout support to handle slow/cold-start backend connections gracefully.
 */
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 60000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
    return response;
  } catch (error) {
    throw new Error(formatApiError(error));
  } finally {
    clearTimeout(timeoutId);
  }
}
