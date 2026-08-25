import { getThemeCookie, setThemeCookie, getMtgThemeCookie, setMtgThemeCookie } from './ThemeCookie';

export type AppTheme = 'light' | 'dark' | 'static';

export function getTheme(): 'light' | 'dark' {
    const v = getThemeCookie();
    if (v === 'dark' || v === 'light') return v;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

export function applyTheme() {
    document.body.className = `${getTheme()}-theme`;
}

export function setTheme(theme: 'light' | 'dark') {
    setThemeCookie(theme);
    applyTheme();
}

export function getMtgTheme(): AppTheme {
    const v = getMtgThemeCookie();
    if (v === 'dark' || v === 'light' || v === 'static') return v;
    return 'static';
}

export function applyMtgTheme() {
    document.body.className = `${getMtgTheme()}-theme`;
}

export function setMtgTheme(theme: AppTheme) {
    setMtgThemeCookie(theme);
    applyMtgTheme();
}
