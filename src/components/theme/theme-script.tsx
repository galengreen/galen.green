const script = `
(() => {
  const storageKey = 'theme';
  const root = document.documentElement;
  const storedTheme = window.localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : prefersDark
      ? 'dark'
      : 'light';

  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
})();
`;

export function ThemeScript() {
  return <script>{script}</script>;
}
