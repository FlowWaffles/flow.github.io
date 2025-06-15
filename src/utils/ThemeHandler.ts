import { getThemeCookie, setThemeCookie } from './ThemeCookie';

export function getTheme(): 'light' | 'dark' {
    const themeCookieValue = getThemeCookie();

    if (themeCookieValue === 'dark' || themeCookieValue === 'light') {
        return themeCookieValue;
    }

    const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

export function applyTheme() {
    const theme = getTheme();
    document.body.className = `${theme}-theme`;
}

export function setTheme(theme: 'light' | 'dark') {
    setThemeCookie(theme);
    applyTheme();
}
