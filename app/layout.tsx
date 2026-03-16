import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { Raleway, Source_Sans_3, Space_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { AssistantProvider } from "@/contexts/AssistantContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { getTenantFromRequest } from "@/lib/tenant-server";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const AxeDev = nextDynamic(
  () => import("@/components/a11y/AxeDev").then((m) => ({ default: m.AxeDev })),
  { ssr: false }
);

export const dynamic = "force-dynamic";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-raleway",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Política Digital — E-learning",
  description: "Plataforma de e-learning de Política Digital",
  manifest: "/manifest.json",
};

/* Neumorfismo: fondo base #f0f2f5 para que las sombras se vean. */
const defaultRootVars = `
  --neu-bg: #f0f2f5;
  --primary: #1428d4;
  --primary-hover: #2b4fff;
  --primary-soft: rgba(20,40,212,0.08);
  --accent: #00e5a0;
  --success: #00b87d;
  --bg: #f0f2f5;
  --surface: #f0f2f5;
  --surface-soft: #f0f2f5;
  --ink: #1428d4;
  --muted: #6b7280;
  --line: rgba(20,40,212,0.1);
  --line-subtle: rgba(20,40,212,0.06);
  --sidebar-bg: #f0f2f5;
  --cream: #f0f2f5;
  --canvas: #f0f2f5;
  --canvas-sidebar: #f0f2f5;
  --ink-muted: #6b7280;
  --card: #f0f2f5;
`;

const criticalCss = `
  :root {
    ${defaultRootVars}
  }
  html, body, #__next, #main-content, .main-content, main {
    background: #f0f2f5 !important;
    font-family: var(--font-body) !important;
  }
  html { font-size: 18px; box-sizing: border-box; }
  *, *::before, *::after { box-sizing: inherit; }
  body {
    margin: 0;
    min-height: 100vh;
    font-size: 18px;
    font-weight: 300;
    color: var(--ink);
    background: #f0f2f5 !important;
    font-family: var(--font-body) !important;
  }
  a { color: inherit; text-decoration: none; }
  .flex { display: flex; }
  .min-h-screen { min-height: 100vh; }
  .flex-1 { flex: 1 1 0%; }
  .min-w-0 { min-width: 0; }
  .w-64 { width: 16rem; flex-shrink: 0; }
  .w-80 { width: 20rem; flex-shrink: 0; }
  .flex-col { flex-direction: column; }
  .border-r { border-right: 1px solid var(--line); }
  .border-l { border-left: 1px solid var(--line); }
  .p-6 { padding: 1.5rem; }
  .p-4 { padding: 1rem; }
  .gap-4 { gap: 1rem; }
  .overflow-y-auto { overflow-y: auto; }
  .card-premium {
    background: #f0f2f5 !important;
    border-radius: 20px;
    border: none !important;
    box-shadow: 8px 8px 18px rgba(174,183,194,0.65), -8px -8px 18px rgba(255,255,255,0.92);
  }
  .relative { position: relative; }
  .z-10 { z-index: 10; }
  .skip-link {
    position: absolute;
    left: -9999px;
    top: 0.5rem;
    z-index: 100;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    background: var(--primary);
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    transition: left 0.15s ease;
  }
  .skip-link:focus {
    left: 1rem;
    outline: none;
    box-shadow: 0 0 0 2px #f0f2f5, 0 0 0 4px var(--primary);
  }
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantFromRequest();
  const tenantCss =
    tenant?.colorPrimario || tenant?.colorSecundario
      ? `
  :root[data-tenant] {
    --primary: ${tenant.colorPrimario || "#1428d4"};
    --primary-hover: ${tenant.colorSecundario || "#2b4fff"};
    --primary-soft: color-mix(in srgb, ${tenant.colorPrimario || "#1428d4"} 12%, transparent);
  }
`
      : "";

  return (
    <html lang="es" data-tenant={tenant?.tenantId ?? undefined} className={`${raleway.variable} ${sourceSans.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen text-[var(--ink)] antialiased" style={{ background: "#f0f2f5" }}>
        <style dangerouslySetInnerHTML={{ __html: criticalCss + tenantCss }} />
        <a
          href="#main-content"
          className="skip-link"
        >
          Saltar al contenido principal
        </a>
        <TenantProvider initialTenant={tenant}>
        <AccessibilityProvider>
        <ThemeProvider>
          {process.env.NODE_ENV === "development" && <AxeDev />}
          <AssistantProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </AssistantProvider>
        </ThemeProvider>
        </AccessibilityProvider>
      </TenantProvider>
      </body>
    </html>
  );
}
