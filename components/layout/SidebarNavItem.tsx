"use client";

import { useState } from "react";
import Link from "next/link";

export interface SidebarNavItemProps {
  href: string;
  label: string;
  icon?: React.ReactNode | null;
  active?: boolean;
  title?: string;
  "data-tooltip"?: string;
}

const INACTIVE_SHADOW = "4px 4px 9px #c2c8d6, -4px -4px 9px #ffffff";
const HOVER_SHADOW = "6px 6px 12px #c2c8d6, -6px -6px 12px #ffffff";

export function SidebarNavItem({ href, label, icon, active, title, "data-tooltip": dataTooltip }: SidebarNavItemProps) {
  const tooltip = dataTooltip ?? title;
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      title={tooltip}
      data-tooltip={tooltip}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 12,
        minHeight: 48,
        fontFamily: "'Syne', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        transition: "box-shadow 0.2s ease, transform 0.15s ease",
        ...(active
          ? {
              background: "linear-gradient(135deg, #1428d4, #0a0f8a)",
              color: "white",
              boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.2)",
            }
          : {
              background: "#e8eaf0",
              color: "#4a5580",
              boxShadow: hover ? HOVER_SHADOW : INACTIVE_SHADOW,
            }),
      }}
      aria-current={active ? "page" : undefined}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1428d4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8eaf0]"
    >
      {icon != null && (
        <span style={{ width: 20, height: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden>
          {icon}
        </span>
      )}
      <span>{label}</span>
    </Link>
  );
}
