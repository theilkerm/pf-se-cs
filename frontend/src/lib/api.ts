// lib/api.ts
export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${path}`;

  console.log('fetch URL:', url); // Debug için

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const headers: HeadersInit = { ...defaultHeaders, ...(options.headers || {}) };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg = (await res.json())?.message || msg; } catch {}
    throw new Error(msg);
  }

  try { return await res.json(); } catch { return null as any; }
}
