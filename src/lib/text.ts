export function verbCount(n: number): string {
  if (n === 1) return "1 czasownik";
  const last = n % 10;
  const twoLast = n % 100;
  if (last >= 2 && last <= 4 && !(twoLast >= 12 && twoLast <= 14)) return `${n} czasowniki`;
  return `${n} czasowników`;
}

export function dayCount(n: number): string {
  return n === 1 ? "1 dzień" : `${n} dni`;
}

const GREAT = ["Świetnie!", "Brawo!", "Tak trzymaj!", "Super robota!"];
const OK = ["Coraz lepiej!", "Idzie nieźle!", "Dobra robota!", "Jeszcze trochę i będzie super!"];
const WEAK = [
  "Następnym razem pójdzie lepiej!",
  "Spokojnie, ćwiczenie czyni mistrza!",
  "Powtórz jeszcze raz — dasz radę!",
];

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)]!;
}

export function praise(correct: number, total: number): string {
  if (total <= 0) return pick(OK);
  const ratio = correct / total;
  if (ratio >= 0.8) return pick(GREAT);
  if (ratio >= 0.5) return pick(OK);
  return pick(WEAK);
}
