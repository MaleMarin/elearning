"use client";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutos

let inactivityTimer: ReturnType<typeof setTimeout> | null = null;

function resetTimer(onLogout: () => void) {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(onLogout, INACTIVITY_TIMEOUT);
}

export function startInactivityWatcher(onLogout: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
  const handler = () => resetTimer(onLogout);

  events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
  resetTimer(onLogout);

  return () => {
    events.forEach((e) => window.removeEventListener(e, handler));
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = null;
  };
}
