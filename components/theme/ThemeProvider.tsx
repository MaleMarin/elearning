"use client";

import { useEffect } from "react";

const STORAGE_KEY = "tema";

function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  if (theme === "dark") html.classList.add("dark");
  else html.classList.remove("dark");
}

/**
 * Aplica el tema guardado (o sistema) al montar. Debe envolver la app para modo oscuro en toda la plataforma.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(getTheme());
  }, []);
  return <>{children}</>;
}
