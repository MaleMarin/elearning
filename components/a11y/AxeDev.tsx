"use client";

import { useEffect } from "react";

/**
 * Inicializa axe-core en desarrollo para auditoría automática de accesibilidad (WCAG).
 * Solo se ejecuta cuando NODE_ENV === "development".
 */
export function AxeDev() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    let cancelled = false;
    Promise.all([
      import("@axe-core/react"),
      import("react"),
      import("react-dom"),
    ]).then(([axe, React, ReactDOM]) => {
      if (cancelled) return;
      axe.default(React.default, ReactDOM.default, 1000);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return null;
}
