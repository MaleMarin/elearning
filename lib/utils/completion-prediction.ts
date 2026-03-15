/**
 * Predicción de fecha de finalización del curso según ritmo actual.
 */
export function predictCompletion(
  lessonsCompleted: number,
  totalLessons: number,
  firstActivityDate: Date,
  lastActivityDate: Date
): { date: string; daysLeft: number } | null {
  if (lessonsCompleted === 0 || lessonsCompleted >= totalLessons) return null;

  const daysSinceStart = Math.max(
    1,
    (lastActivityDate.getTime() - firstActivityDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const lessonsPerDay = lessonsCompleted / daysSinceStart;
  if (lessonsPerDay === 0) return null;

  const remainingLessons = totalLessons - lessonsCompleted;
  const daysLeft = Math.ceil(remainingLessons / lessonsPerDay);

  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysLeft);

  return {
    date: completionDate.toLocaleDateString("es-MX", { day: "numeric", month: "long" }),
    daysLeft,
  };
}
