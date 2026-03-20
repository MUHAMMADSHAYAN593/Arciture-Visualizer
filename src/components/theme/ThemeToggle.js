"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--fg)] transition hover:shadow-lg"
      aria-label="Toggle theme"
    >
      {isDark ? <Moon size={14} /> : <Sun size={14} />}
      {isDark ? "Night" : "Light"}
    </button>
  );
}
