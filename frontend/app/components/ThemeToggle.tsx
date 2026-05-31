"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
    >
      <span className={isDark ? "text-amber-300" : "text-sky-600"}>
        {isDark ? "☀️" : "🌙"}
      </span>
      {isDark ? "Modo Claro" : "Modo Oscuro"}
    </button>
  );
}
