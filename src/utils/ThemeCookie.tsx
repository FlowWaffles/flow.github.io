import { useEffect, useState } from 'react';

const COOKIE_NAME = 'theme';

function setCookie(name: string, value: string, days = 365) {
    console.log(`Setting cookie: ${name}=${value}, expires in ${days} days`);
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function useThemeCookie(defaultDark: boolean) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    console.log('Initializing theme from cookie');
    const cookie = getCookie(COOKIE_NAME);
    console.log(`Cookie value: ${cookie}`);
    if (cookie === 'dark') return true;
    if (cookie === 'light') return false;
    return defaultDark;
  });

  useEffect(() => {
    setCookie(COOKIE_NAME, isDark ? 'dark' : 'light', 365);
    document.body.className = isDark ? 'dark-theme' : 'light-theme';
  }, [isDark]);

  return [isDark, setIsDark] as const;
}
