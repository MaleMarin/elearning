"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AccessibilityPrefs } from "@/lib/services/profile";

const STORAGE_KEY = "elearning-a11y-prefs";

const defaultPrefs: AccessibilityPrefs = {
  fontSize: "normal",
  reduceMotion: false,
  highContrast: false,
};

type AccessibilityContextValue = {
  prefs: AccessibilityPrefs;
  setPrefs: (p: AccessibilityPrefs) => void;
};

const Context = createContext<AccessibilityContextValue | null>(null);

function loadFromStorage(): AccessibilityPrefs {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrefs;
    const p = JSON.parse(raw) as AccessibilityPrefs;
    return {
      fontSize: p.fontSize === "large" ? "large" : "normal",
      reduceMotion: !!p.reduceMotion,
      highContrast: !!p.highContrast,
    };
  } catch {
    return defaultPrefs;
  }
}

function saveToStorage(prefs: AccessibilityPrefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function applyToDocument(prefs: AccessibilityPrefs) {
  const root = typeof document !== "undefined" ? document.documentElement : null;
  if (!root) return;
  root.classList.remove("a11y-font-large", "a11y-reduce-motion", "a11y-high-contrast");
  if (prefs.fontSize === "large") root.classList.add("a11y-font-large");
  if (prefs.reduceMotion) root.classList.add("a11y-reduce-motion");
  if (prefs.highContrast) root.classList.add("a11y-high-contrast");
}

export function AccessibilityProvider({ children, initialPrefs }: { children: React.ReactNode; initialPrefs?: AccessibilityPrefs | null }) {
  const [prefs, setPrefsState] = useState<AccessibilityPrefs>(() => initialPrefs ?? loadFromStorage());

  useEffect(() => {
    applyToDocument(prefs);
    if (!initialPrefs) saveToStorage(prefs);
  }, [prefs, initialPrefs]);

  const setPrefs = useCallback((p: AccessibilityPrefs) => {
    setPrefsState((prev) => ({ ...prev, ...p }));
  }, []);

  return (
    <Context.Provider value={{ prefs, setPrefs }}>
      {children}
    </Context.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(Context);
  if (!ctx) return {
    prefs: defaultPrefs,
    setPrefs: () => {},
  };
  return ctx;
}
