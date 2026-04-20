import { getApiBase } from '../../config/api';

export function learnHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export function learnUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBase()}/learn${p}`;
}
