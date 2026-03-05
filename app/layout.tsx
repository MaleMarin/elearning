import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { AssistantProvider } from "@/contexts/AssistantContext";

export const metadata: Metadata = {
  title: "E-learning Precisar",
  description: "Plataforma de aprendizaje",
};

const criticalCss = `
  :root {
    --bg: #F3F2EF;
    --surface: #FFFFFF;
    --surface-soft: #FAFAF8;
    --ink: #1F2430;
    --muted: #6B7280;
    --line: rgba(31,36,48,0.08);
    --line-subtle: rgba(31,36,48,0.08);
    --shadow-card: 0 10px 30px rgba(31,36,48,0.06);
    --shadow-card-hover: 0 16px 40px rgba(31,36,48,0.08);
    --shadow-card-inset: inset 0 1px 0 rgba(255,255,255,0.65);
    --primary: #7569DE;
    --primary-soft: #EEEAFD;
    --coral: #FE6845;
    --coral-soft: #FFF0EB;
    --amber: #FFA046;
    --amber-soft: #FFF4E6;
    --success: #9ECB45;
    --success-soft: #F3F9E7;
    --sidebar-bg: #EFEEE9;
    --cream: #F3F2EF;
    --canvas: #F3F2EF;
    --canvas-sidebar: #EFEEE9;
    --ink-muted: #6B7280;
    --card: #FFFFFF;
  }
  html { font-size: 18px; box-sizing: border-box; }
  *, *::before, *::after { box-sizing: inherit; }
  body {
    margin: 0;
    min-height: 100vh;
    font-size: 18px;
    font-weight: 300;
    color: #1F2430;
    background: #F3F2EF;
    font-family: "Avenir Light", "Avenir Next", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
    background: var(--surface);
    border-radius: 20px;
    border: 1px solid var(--line);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.65), 0 10px 30px rgba(31,36,48,0.06);
  }
  .relative { position: relative; }
  .z-10 { z-index: 10; }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#F3F2EF] text-[#1F2430] font-sans antialiased">
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
        <AssistantProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AssistantProvider>
      </body>
    </html>
  );
}
