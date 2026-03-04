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
    --cream: #F6F1E8;
    --canvas: #F6F1E8;
    --canvas-sidebar: #ebe6dd;
    --line: rgba(31,36,48,0.1);
    --line-subtle: rgba(31,36,48,0.08);
    --ink: #1F2430;
    --ink-muted: #5c6370;
    --text: #1F2430;
    --primary: #7569DE;
    --card: #fff;
  }
  html { font-size: 18px; box-sizing: border-box; }
  *, *::before, *::after { box-sizing: inherit; }
  body {
    margin: 0;
    min-height: 100vh;
    background: radial-gradient(1200px 700px at 20% 10%, rgba(117,105,222,0.10), transparent 55%), radial-gradient(900px 600px at 85% 15%, rgba(255,160,70,0.10), transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(246,241,232,1) 55%, rgba(246,241,232,1) 100%);
    color: var(--ink) !important;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  }
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
    background: var(--card);
    border-radius: 1.25rem;
    border: 1px solid rgba(31,36,48,0.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.70), 0 10px 30px rgba(31,36,48,0.08);
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
      <body className="min-h-screen bg-[var(--cream)] text-[var(--text)]" style={{ backgroundColor: "var(--cream)", color: "var(--ink)" }}>
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
        <AssistantProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AssistantProvider>
      </body>
    </html>
  );
}
