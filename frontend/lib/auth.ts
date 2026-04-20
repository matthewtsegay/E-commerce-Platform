export function setAuthCookies(access: string, refresh: string, role: 'admin' | 'user') {
  document.cookie = `access_token=${access}; path=/; max-age=900; samesite=lax`;
  document.cookie = `refresh_token=${refresh}; path=/; max-age=2592000; samesite=lax`;
  document.cookie = `user_role=${role}; path=/; max-age=2592000; samesite=lax`;
}

export function clearAuthCookies() {
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export function sanitizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith('/')) return '/';
  if (nextPath.startsWith('//')) return '/';
  if (nextPath.includes('http://') || nextPath.includes('https://')) return '/';
  return nextPath;
}
