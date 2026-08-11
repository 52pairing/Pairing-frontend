"use client";

import { useTheme, type ThemePreference } from "./ThemeProvider";

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: "system", label: "시스템" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

export function ThemeControl() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-theme-secondary">
      <span className="sr-only">화면 테마</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemePreference)}
        aria-label="화면 테마"
        className="h-10 rounded-md border border-theme bg-surface px-2 text-xs font-semibold text-theme-primary outline-none transition hover:bg-surface-subtle focus:border-brand"
      >
        {THEME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
