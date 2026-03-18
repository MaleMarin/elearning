"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { RightRail } from "./RightRail";
import { AssistantFab } from "@/components/assistant/AssistantFab";
import HowItWorksButton from "@/components/ui/HowItWorksButton";
import { AdminShell } from "@/components/admin/AdminShell";
import { registerOnlineSync } from "@/lib/offline/sync-manager";
import { useEffect } from "react";

const STANDALONE_PATHS = [
  "/login",
  "/registro",
  "/privacidad",
  "/recuperar-contrasena",
  "/recuperar",
  "/no-inscrito",
];

const CON_PANEL_DERECHO = ["/inicio"];

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const esStandalone =
    pathname != null && STANDALONE_PATHS.some((p) => pathname.startsWith(p));
  const conPanelDerecho =
    pathname != null && CON_PANEL_DERECHO.some((p) => pathname === p);
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    const unregister = registerOnlineSync();
    return unregister;
  }, []);

  if (esStandalone) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (isAdmin) {
    return <AdminShell>{children}</AdminShell>;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#e8eaf0",
      }}
    >
      <Sidebar collapsed={!conPanelDerecho} />
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
        role="main"
        id="main-content"
      >
        {children}
      </main>
      {conPanelDerecho && <RightRail />}
      <AssistantFab />
      <HowItWorksButton />
    </div>
  );
}
