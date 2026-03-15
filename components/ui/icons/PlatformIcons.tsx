"use client";

/**
 * Íconos SVG del sistema de diseño Política Digital.
 * Uso: <IconInicio size={18} active={true} />
 */
export interface IconProps {
  size?: number;
  /** true = color azul, false = gris */
  active?: boolean;
  /** color del punto de acento, default #00e5a0 */
  accent?: string;
}

const AZUL = "#1428d4";
const GRIS = "#9ca3af";
const ACENTO = "#00e5a0";

export function IconInicio({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M12 28L24 16L36 28V38H30V31H18V38H12V28Z"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
        fillOpacity="0.08"
      />
      <path d="M12 28L24 16L36 28V38H30V31H18V38H12V28Z" fill={c} fillOpacity="0.07" />
      <line x1="24" y1="19" x2="12" y2="28" stroke={accent} strokeWidth="1" strokeOpacity="0.6" />
      <line x1="24" y1="19" x2="36" y2="28" stroke={accent} strokeWidth="1" strokeOpacity="0.6" />
      <circle cx="24" cy="16" r="3" fill={accent} />
      <circle cx="12" cy="28" r="2" fill={c} fillOpacity="0.35" />
      <circle cx="36" cy="28" r="2" fill={c} fillOpacity="0.35" />
    </svg>
  );
}

export function IconCurso({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect
        x="13"
        y="14"
        width="22"
        height="20"
        rx="3"
        fill={c}
        fillOpacity="0.07"
        stroke={c}
        strokeWidth="1.8"
      />
      <line x1="24" y1="14" x2="24" y2="34" stroke={c} strokeWidth="1" strokeOpacity="0.15" />
      <circle cx="18" cy="20" r="1.8" fill={accent} />
      <line x1="19.8" y1="20" x2="22" y2="20" stroke={accent} strokeWidth="1.2" />
      <circle cx="18" cy="25" r="1.8" fill={accent} fillOpacity="0.45" />
      <line x1="19.8" y1="25" x2="22" y2="25" stroke={accent} strokeWidth="1.2" strokeOpacity="0.45" />
      <circle cx="33" cy="33" r="5" fill={active ? AZUL : "#6b7280"} />
      <path
        d="M30.5 33l2 2 3.5-3.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSesiones({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect
        x="12"
        y="17"
        width="24"
        height="15"
        rx="3"
        fill={c}
        fillOpacity="0.07"
        stroke={c}
        strokeWidth="1.8"
      />
      <path d="M22 21.5l6 3.5-6 3.5V21.5Z" fill={c} fillOpacity="0.55" />
      <circle cx="34" cy="14" r="5" fill="#f0f2f5" stroke={c} strokeWidth="1.2" />
      <circle cx="34" cy="14" r="2.5" fill={accent} />
      <line x1="20" y1="32" x2="28" y2="32" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="24" y1="32" x2="24" y2="35" stroke={c} strokeWidth="1.8" />
    </svg>
  );
}

export function IconTareas({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect
        x="12"
        y="16"
        width="7"
        height="16"
        rx="2"
        fill={c}
        fillOpacity="0.08"
        stroke={c}
        strokeWidth="1.2"
      />
      <rect
        x="20.5"
        y="16"
        width="7"
        height="16"
        rx="2"
        fill={c}
        fillOpacity="0.08"
        stroke={c}
        strokeWidth="1.2"
      />
      <rect
        x="29"
        y="16"
        width="7"
        height="16"
        rx="2"
        fill={c}
        fillOpacity="0.08"
        stroke={c}
        strokeWidth="1.2"
      />
      <rect x="13" y="18" width="5" height="3" rx="1" fill={c} fillOpacity="0.3" />
      <rect x="13" y="22.5" width="5" height="3" rx="1" fill={c} fillOpacity="0.3" />
      <rect x="21.5" y="18" width="5" height="3" rx="1" fill={accent} fillOpacity="0.7" />
      <rect x="30" y="18" width="5" height="3" rx="1" fill={c} fillOpacity="0.15" />
      <path
        d="M26 24.5h2.2M27.5 23l1.5 1.5-1.5 1.5"
        stroke={accent}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconComunidad({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="18" r="4.5" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1.5" />
      <circle cx="15" cy="29" r="4" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="1.2" />
      <circle cx="33" cy="29" r="4" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="1.2" />
      <line x1="21" y1="21" x2="17.5" y2="26" stroke={c} strokeWidth="1.2" strokeOpacity="0.4" />
      <line x1="27" y1="21" x2="30.5" y2="26" stroke={c} strokeWidth="1.2" strokeOpacity="0.4" />
      <line x1="19" y1="29" x2="29" y2="29" stroke={c} strokeWidth="1.2" strokeOpacity="0.2" />
      <circle cx="24" cy="18" r="2.2" fill={accent} />
      <circle cx="24" cy="33" r="2.8" fill={accent} fillOpacity="0.4" stroke={accent} strokeWidth="0.8" />
    </svg>
  );
}

export function IconMiColega({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <ellipse
        cx="19"
        cy="24"
        rx="6"
        ry="9"
        stroke={c}
        strokeWidth="1.2"
        fill="none"
        strokeOpacity="0.3"
      />
      <ellipse
        cx="29"
        cy="24"
        rx="6"
        ry="9"
        stroke={c}
        strokeWidth="1.2"
        fill="none"
        strokeOpacity="0.3"
      />
      <circle cx="19" cy="21" r="2.5" fill={c} fillOpacity="0.45" />
      <path
        d="M14.5 29.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
        stroke={c}
        strokeWidth="1.2"
        fill="none"
        strokeOpacity="0.45"
      />
      <circle cx="29" cy="21" r="2.5" fill={c} fillOpacity="0.45" />
      <path
        d="M24.5 29.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
        stroke={c}
        strokeWidth="1.2"
        fill="none"
        strokeOpacity="0.45"
      />
      <circle cx="24" cy="24" r="2.5" fill={accent} />
    </svg>
  );
}

/** Engranajes — mentor y alumno sincronizados */
export function IconMentores({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" aria-hidden>
      <circle cx="20" cy="26" r="9" fill={c} fillOpacity="0.07" stroke={c} strokeWidth="1.4" />
      <circle cx="20" cy="26" r="3" fill={c} fillOpacity="0.2" />
      <rect x="18.5" y="14" width="3" height="4" rx="1" fill={c} fillOpacity="0.4" />
      <rect x="18.5" y="34" width="3" height="4" rx="1" fill={c} fillOpacity="0.4" />
      <rect x="8" y="24.5" width="4" height="3" rx="1" fill={c} fillOpacity="0.4" />
      <rect x="28" y="24.5" width="4" height="3" rx="1" fill={c} fillOpacity="0.4" />
      <circle cx="36" cy="22" r="6" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1.3" />
      <circle cx="36" cy="22" r="2.2" fill={accent} fillOpacity="0.5" />
      <rect x="34.5" y="13.5" width="3" height="3" rx="0.8" fill={accent} fillOpacity="0.55" />
      <rect x="34.5" y="27.5" width="3" height="3" rx="0.8" fill={accent} fillOpacity="0.55" />
      <rect x="41.5" y="20.5" width="3" height="3" rx="0.8" fill={accent} fillOpacity="0.55" />
      <circle cx="28.5" cy="24" r="1.8" fill={accent} />
    </svg>
  );
}

export function IconEgresados({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 14L34 19V24L24 29L14 24V19L24 14Z"
        fill={c}
        fillOpacity="0.07"
        stroke={c}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M17 27v5c0 1.8 3 3 7 3s7-1.2 7-3v-5"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.5"
      />
      <circle cx="24" cy="21.5" r="3.2" fill={accent} fillOpacity="0.7" />
      <circle cx="24" cy="21.5" r="1.6" fill={active ? AZUL : "#6b7280"} />
      <line x1="34" y1="19" x2="34" y2="25" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="34" cy="26.5" r="1.8" fill={accent} fillOpacity="0.6" />
    </svg>
  );
}

export function IconCertificado({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect
        x="13"
        y="13"
        width="16"
        height="20"
        rx="2"
        fill={c}
        fillOpacity="0.07"
        stroke={c}
        strokeWidth="1.8"
      />
      <line
        x1="16"
        y1="19"
        x2="26"
        y2="19"
        stroke={c}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
      <line
        x1="16"
        y1="23"
        x2="24"
        y2="23"
        stroke={c}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />
      <line
        x1="16"
        y1="27"
        x2="22"
        y2="27"
        stroke={c}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeOpacity="0.25"
      />
      <circle cx="31" cy="31" r="7" fill="#f0f2f5" stroke={c} strokeWidth="1.5" />
      <circle cx="31" cy="31" r="4.5" fill={accent} fillOpacity="0.18" />
      <path
        d="M28.5 31l2 2 3.5-3.5"
        stroke={active ? AZUL : "#6b7280"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLaboratorio({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <ellipse
        cx="24"
        cy="24"
        rx="11"
        ry="5"
        stroke={c}
        strokeWidth="1.3"
        fill="none"
        strokeOpacity="0.4"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="11"
        ry="5"
        stroke={c}
        strokeWidth="1.3"
        fill="none"
        strokeOpacity="0.4"
        transform="rotate(60 24 24)"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="11"
        ry="5"
        stroke={c}
        strokeWidth="1.3"
        fill="none"
        strokeOpacity="0.4"
        transform="rotate(120 24 24)"
      />
      <circle cx="24" cy="24" r="4" fill={accent} fillOpacity="0.75" />
      <circle cx="24" cy="24" r="2" fill={active ? AZUL : "#6b7280"} />
      <circle cx="35" cy="24" r="1.8" fill={accent} />
    </svg>
  );
}

export function IconSoporte({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M16 26a11 11 0 0 1 16 0"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.3"
      />
      <path
        d="M19 23a7 7 0 0 1 10 0"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.5"
      />
      <path
        d="M21.5 20a4 4 0 0 1 5 0"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.7"
      />
      <circle cx="24" cy="29" r="2.8" fill={accent} />
      <rect x="28" y="27" width="9" height="7" rx="2.5" fill={active ? AZUL : "#6b7280"} />
      <path d="M28.5 34.5l2 2.5h-2.5l0.5-2.5Z" fill={active ? AZUL : "#6b7280"} />
      <line x1="30" y1="29.5" x2="35" y2="29.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <line x1="30" y1="31.5" x2="33.5" y2="31.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function IconPerfil({ size = 18, active = false, accent = ACENTO }: IconProps) {
  const c = active ? AZUL : GRIS;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 13l9 5v10l-9 5-9-5V18l9-5Z"
        fill={c}
        fillOpacity="0.06"
        stroke={c}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="22" r="4" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.2" />
      <path
        d="M17 32c0-3.9 3.1-7 7-7s7 3.1 7 7"
        stroke={c}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.4"
      />
      <circle cx="30" cy="18" r="4" fill={accent} />
      <path
        d="M28.5 18l1.2 1.2 2.3-2.3"
        stroke="white"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
