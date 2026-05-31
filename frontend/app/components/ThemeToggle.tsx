"use client";

import { useTheme } from "./ThemeProvider";
import MaterialIcon from "./MaterialIcon";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center justify-center rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
      title={isDark ? "Modo claro" : "Modo oscuro"}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      <MaterialIcon name={isDark ? "light_mode" : "dark_mode"} />
    </button>
  );
}
