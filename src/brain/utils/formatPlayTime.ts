export function formatPlayTime(
  minutes: number | null | undefined,
): string {
  const safeMinutes = Math.max(
    0,
    Math.floor(minutes ?? 0),
  );

  if (safeMinutes === 0) {
    return "Ainda não jogado";
  }

  if (safeMinutes < 60) {
    return `${safeMinutes} min`;
  }

  const hours = Math.floor(
    safeMinutes / 60,
  );

  const remainingMinutes =
    safeMinutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}