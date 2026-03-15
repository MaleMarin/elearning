"use client";

import Link from "next/link";

export interface SidebarNavItemProps {
  href: string;
  label: string;
  icon?: React.ReactNode | null;
  active?: boolean;
  title?: string;
  "data-tooltip"?: string;
}

export function SidebarNavItem({ href, label, icon, active, title, "data-tooltip": dataTooltip }: SidebarNavItemProps) {
  const tooltip = dataTooltip ?? title;
  return (
    <Link
      href={href}
      title={tooltip}
      data-tooltip={tooltip}
      className={`
        flex items-center gap-3 px-4 py-3.5 rounded-full min-h-[52px] transition-all duration-200 no-underline
        ${active
          ? "bg-[var(--surface)] text-[var(--primary)] font-medium shadow-[var(--shadow-card-inset)]"
          : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
        }
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar-bg)]
      `}
      aria-current={active ? "page" : undefined}
    >
      {icon != null && (
        <span className="w-5 h-5 shrink-0 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5" aria-hidden suppressHydrationWarning>
          {icon}
        </span>
      )}
      <span>{label}</span>
    </Link>
  );
}
