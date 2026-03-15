const THEME_KEY = 'flowboard-theme';
type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  return 'light';
}

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem(THEME_KEY, theme);
}

export function getTheme(): Theme {
  const current = document.documentElement.getAttribute('data-theme');
  if (current === 'dark') return 'dark';
  return 'light';
}

export function setTheme(theme: Theme) {
  applyTheme(theme);
}

export function toggleTheme(): Theme {
  const next = getTheme() === 'light' ? 'dark' : 'light';
  applyTheme(next);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  }
  return next;
}

// Initialize on load
if (typeof window !== 'undefined') {
  applyTheme(getInitialTheme());
}
