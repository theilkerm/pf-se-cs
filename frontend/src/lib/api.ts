// frontend/src/lib/api.ts

function buildUrl(endpoint: string) {
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Automatically prepend /api/v1 if not already present
  if (!path.startsWith('/api/v1')) {
    return `${base}/api/v1${path}`;
  }
  
  return `${base}${path}`;
}

/**
 * Plain fetcher — does not mutate localStorage.
 * Throws Error on non-2xx responses.
 */
export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const url = buildUrl(endpoint);

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // If sending FormData, don't force Content-Type
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = isFormData
    ? { ...(options.headers || {}) }
    : { ...defaultHeaders, ...(options.headers || {}) };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Authed fetcher — only adds Authorization header.
 * Usage: authedFetcher(token, '/admin/things')
 */
export async function authedFetcher(
  token: string,
  endpoint: string,
  options: RequestInit = {}
) {
  const headers: HeadersInit = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  return fetcher(endpoint, { ...options, headers });
}
