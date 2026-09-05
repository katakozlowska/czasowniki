/**
 * Wspólna funkcja sprawdzania odpowiedzi we wszystkich ćwiczeniach.
 * Ignoruje wielkość liter oraz spacje na początku i końcu.
 * Akceptuje każdy z poprawnych wariantów.
 */
export function checkAnswer(userInput: string, correctVariants: string[]): boolean {
  const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
  const answer = normalize(userInput);
  if (!answer) return false;
  return correctVariants.some((variant) => normalize(variant) === answer);
}
