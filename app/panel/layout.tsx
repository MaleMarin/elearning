import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Solo admin y mentor pueden acceder a /panel/*.
 * El middleware ya redirige a /login si no hay sesión.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "student";
  if (role !== "admin" && role !== "mentor") {
    redirect("/inicio");
  }

  return <>{children}</>;
}
