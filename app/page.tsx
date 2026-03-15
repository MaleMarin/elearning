import { redirect } from "next/navigation";

/**
 * Raíz: redirección inmediata a /inicio.
 * En servidor para no mostrar contenido intermedio ni romper jerarquía visual (Nielsen: visibilidad de estado, diseño minimalista).
 */
export default function RootPage() {
  redirect("/inicio");
}
