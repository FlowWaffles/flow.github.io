const COOKIE_NAME = 'theme';
const MTG_COOKIE_NAME = 'theme_mtg';

function writeCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setThemeCookie(value: string, days = 365) {
  writeCookie(COOKIE_NAME, value, days);
}

export function getThemeCookie(): string | null {
  return readCookie(COOKIE_NAME);
}

export function setMtgThemeCookie(value: string, days = 365) {
  writeCookie(MTG_COOKIE_NAME, value, days);
}

export function getMtgThemeCookie(): string | null {
  return readCookie(MTG_COOKIE_NAME);
}

const MTG_COLORS_COOKIE_NAME = 'mtg_player_colors';

export function setPlayerColorsCookie(colors: string[], days = 365) {
  writeCookie(MTG_COLORS_COOKIE_NAME, JSON.stringify(colors), days);
}

export function getPlayerColorsCookie(): string[] | null {
  const raw = readCookie(MTG_COLORS_COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(v => typeof v === 'string')) return parsed as string[];
  } catch { /* ignore */ }
  return null;
}
