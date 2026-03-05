"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

export function SidebarNavItem({ href, label, icon: Icon, active }: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3.5 rounded-full min-h-[52px] transition-all duration-200 no-underline
        ${active
          ? "bg-[var(--surface)] text-[var(--primary)] font-medium shadow-[var(--shadow-card-inset),0_4px_16px_rgba(31,36,48,0.08)]"
          : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
        }
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar-bg)]
      `}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
      <span>{label}</span>
    </Link>
  );
}
