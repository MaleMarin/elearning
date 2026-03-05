import { redirect } from "next/navigation";

export default function CursosLeccionRedirectPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const raw = params.lessonId ?? "";
  const id = raw.startsWith("leccion-") ? raw.slice(8) : raw;
  redirect(`/curso/lecciones/${id}`);
}
