"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge, type BadgeVariant } from "./Badge";

export interface ListRowProps {
  href?: string;
  left?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: { variant: BadgeVariant; label: string };
  children?: React.ReactNode;
  className?: string;
}

export function ListRow({ href, left, title, subtitle, badge, children, className = "" }: ListRowProps) {
  const padding = "py-4 px-4 sm:px-5";
  const hoverStyles =
    "transition-colors duration-200 hover:bg-[var(--surface-soft)] group";
  const content = (
    <>
      {left && <div className="shrink-0">{left}</div>}
      <div className="flex-1 min-w-0">
        <span className="font-medium text-[var(--ink)] block truncate group-hover:text-[var(--primary)] transition-colors">
          {title}
        </span>
        {subtitle && (
          <span className="text-sm text-[var(--muted)] block truncate mt-0.5">{subtitle}</span>
        )}
      </div>
      {badge && (
        <Badge variant={badge.variant} className="shrink-0">
          {badge.label}
        </Badge>
      )}
      {href && (
        <ChevronRight className="w-5 h-5 text-[var(--muted)] shrink-0 group-hover:text-[var(--primary)] transition-colors" />
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`flex items-center gap-4 rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_8px_rgba(31,36,48,0.05)] ${padding} no-underline transition-all duration-200 hover:bg-[var(--surface-soft)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_6px_20px_rgba(31,36,48,0.07)] hover:-translate-y-px group ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-4 rounded-xl border border-[var(--line-subtle)] bg-[var(--surface)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_2px_8px_rgba(31,36,48,0.05)] ${padding} ${className}`}>
      {content}
    </div>
  );
}
