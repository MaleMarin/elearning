"use client";

import { forwardRef } from "react";
import Link from "next/link";

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-medium rounded-full min-h-[48px] min-w-[48px] px-6 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] no-underline";

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
}

export function PrimaryButton({
  children,
  className = "",
  href,
  ...rest
}: PrimaryButtonProps) {
  const classes = `${baseClasses} bg-[var(--primary)] text-white shadow-[0_2px_0_0_rgba(255,255,255,0.25)_inset,0_14px_38px_rgba(31,36,48,0.12)] hover:bg-[var(--primary-hover)] hover:shadow-[0_2px_0_0_rgba(255,255,255,0.3)_inset,0_20px_52px_rgba(31,36,48,0.14)] hover:-translate-y-px active:translate-y-px active:shadow-[0_2px_0_0_rgba(255,255,255,0.2)_inset,0_8px_24px_rgba(31,36,48,0.1)] focus-visible:ring-[var(--primary)] disabled:opacity-50 transition-all duration-200 ${className}`;
  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}

export function AccentButton({
  children,
  className = "",
  href,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode; href?: string }) {
  const classes = `${baseClasses} bg-[var(--coral)] text-white shadow-[0_2px_0_0_rgba(255,255,255,0.25)_inset,0_14px_38px_rgba(31,36,48,0.12)] hover:bg-[var(--coral-hover)] hover:shadow-[0_2px_0_0_rgba(255,255,255,0.3)_inset,0_20px_52px_rgba(31,36,48,0.14)] hover:-translate-y-px active:translate-y-px focus-visible:ring-[var(--coral)] disabled:opacity-50 transition-all duration-200 ${className}`;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}

export interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
}

export const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ children, className = "", href, ...rest }, ref) => {
    const classes = `${baseClasses} bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] shadow-[0_1px_0_0_rgba(255,255,255,0.7)_inset,0_4px_14px_rgba(31,36,48,0.07)] hover:bg-[var(--surface-soft)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.75)_inset,0_8px_24px_rgba(31,36,48,0.08)] hover:-translate-y-px active:translate-y-px active:shadow-[0_1px_0_0_rgba(255,255,255,0.7)_inset,0_2px_8px_rgba(31,36,48,0.06)] focus-visible:ring-[var(--primary)] disabled:opacity-50 transition-all duration-200 ${className}`;
    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }
    return (
      <button ref={ref} type="button" className={classes} {...rest}>
        {children}
      </button>
    );
  }
);
SecondaryButton.displayName = "SecondaryButton";
