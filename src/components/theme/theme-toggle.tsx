"use client";

import { useEffect, useState } from "react";

import { useUiHaptics } from "@/hooks/use-ui-haptics";

type Theme = "light" | "dark";

const storageKey = "theme";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

export function ThemeToggle() {
  const { triggerThemeHaptic } = useUiHaptics();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    const initialTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : getSystemTheme();

    setTheme(initialTheme);
    applyTheme(initialTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemThemeChange() {
      if (window.localStorage.getItem(storageKey)) {
        return;
      }

      const nextTheme = getSystemTheme();
      setTheme(nextTheme);
      applyTheme(nextTheme);
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";

    triggerThemeHaptic();
    setTheme(nextTheme);
    window.localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      title={`Theme: ${theme}`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-black/35 !transition-[color,transform] !duration-[var(--motion-duration)] !ease-[var(--motion-ease)] hover:scale-[1.04] hover:text-black/70 focus-visible:scale-[1.04] focus-visible:text-black/70 focus-visible:outline-none [html.dark_&]:text-white/44 [html.dark_&]:hover:text-white/82 [html.dark_&]:focus-visible:text-white/82"
    >
      {theme === "dark" ? (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4 fill-current"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4 fill-current"
        >
          <path d="M12 17.5A5.5 5.5 0 1 1 17.5 12 5.51 5.51 0 0 1 12 17.5Zm0-16a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2A.75.75 0 0 1 12 1.5Zm0 18a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .75-.75ZM4.25 11.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5Zm17.5 0a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5ZM5.99 4.93a.75.75 0 0 1 1.06 0l1.42 1.41a.75.75 0 0 1-1.06 1.06L5.99 5.99a.75.75 0 0 1 0-1.06Zm11.94 11.94a.75.75 0 0 1 1.06 0l1.42 1.42a.75.75 0 1 1-1.06 1.06l-1.42-1.42a.75.75 0 0 1 0-1.06ZM18 4.93a.75.75 0 0 1 0 1.06L16.58 7.4a.75.75 0 1 1-1.06-1.06l1.42-1.41A.75.75 0 0 1 18 4.93ZM8.47 16.87a.75.75 0 0 1 0 1.06l-1.42 1.42a.75.75 0 0 1-1.06-1.06l1.42-1.42a.75.75 0 0 1 1.06 0Z" />
        </svg>
      )}
    </button>
  );
}
