import { useAuth } from '@/context/AuthContext'; // mevcutsa
// Eğer hook kullanmak istemiyorsan global event veya callback enjekte edebilirsin.

export async function fetcher(endpoint: string, options: RequestInit = {}) {
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${base}${path}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const headers: HeadersInit = { ...defaultHeaders, ...(options.headers || {}) };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    // 401 özel ele alınsın
    if (res.status === 401) {
      // isteğe göre localStorage temizleyip login'e gönder
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    let msg = `HTTP ${res.status}`;
    try { msg = (await res.json())?.message || msg; } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return null as any; }
}
