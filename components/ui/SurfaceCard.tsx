"use client";

import { forwardRef } from "react";

export interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Padding interno. Por defecto generoso (md). */
  padding?: "none" | "sm" | "md" | "lg";
  /** Radius: lg = 24px, md = 20px. */
  size?: "md" | "lg";
  /** Si true (default), aplica hover lift + sombra. Usar false para cards no clickeables. */
  clickable?: boolean;
  as?: "div" | "section" | "article";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

const radiusMap = {
  md: "rounded-card",
  lg: "rounded-card-lg",
};

export const SurfaceCard = forwardRef<HTMLDivElement, SurfaceCardProps>(
  (
    {
      className = "",
      padding = "md",
      size = "md",
      clickable = true,
      as: Component = "div",
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={[
          "border border-[var(--line)] bg-[var(--surface)]",
          "shadow-[var(--shadow-card-inset),var(--shadow-card)]",
          radiusMap[size],
          paddingMap[padding],
          clickable &&
            "transition-[box-shadow,transform] duration-200 ease-out hover:shadow-[var(--shadow-card-inset),var(--shadow-card-hover)] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] active:translate-y-0",
          !clickable && "shadow-[var(--shadow-card-inset),var(--shadow-card)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

SurfaceCard.displayName = "SurfaceCard";
