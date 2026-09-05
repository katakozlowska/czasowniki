export type Verb = {
  base: string;
  past: string[];
  participle: string[];
  pl: string;
};

export const verbs: Verb[] = [
  { base: "be", past: ["was", "were", "was/were"], participle: ["been"], pl: "być" },
  { base: "break", past: ["broke"], participle: ["broken"], pl: "łamać, psuć" },
  {
    base: "burn",
    past: ["burnt", "burned"],
    participle: ["burnt", "burned"],
    pl: "oparzyć się, spalić",
  },
  { base: "buy", past: ["bought"], participle: ["bought"], pl: "kupować" },
  { base: "come", past: ["came"], participle: ["come"], pl: "przychodzić" },
  { base: "cut", past: ["cut"], participle: ["cut"], pl: "skaleczyć się, ciąć" },
  { base: "do", past: ["did"], participle: ["done"], pl: "robić" },
  { base: "drink", past: ["drank"], participle: ["drunk"], pl: "pić" },
  { base: "eat", past: ["ate"], participle: ["eaten"], pl: "jeść" },
  { base: "fall", past: ["fell"], participle: ["fallen"], pl: "spaść" },
  { base: "feel", past: ["felt"], participle: ["felt"], pl: "czuć" },
  { base: "find", past: ["found"], participle: ["found"], pl: "znaleźć" },
  { base: "fly", past: ["flew"], participle: ["flown"], pl: "latać" },
  { base: "forget", past: ["forgot"], participle: ["forgotten"], pl: "zapominać" },
  { base: "give", past: ["gave"], participle: ["given"], pl: "dawać" },
  { base: "go", past: ["went"], participle: ["gone"], pl: "iść, jechać" },
  { base: "have", past: ["had"], participle: ["had"], pl: "mieć" },
  { base: "hear", past: ["heard"], participle: ["heard"], pl: "słyszeć" },
  { base: "hit", past: ["hit"], participle: ["hit"], pl: "uderzyć" },
  { base: "hurt", past: ["hurt"], participle: ["hurt"], pl: "zranić" },
  {
    base: "learn",
    past: ["learnt", "learned"],
    participle: ["learnt", "learned"],
    pl: "uczyć się",
  },
  { base: "leave", past: ["left"], participle: ["left"], pl: "opuszczać" },
];

/** Formy do wyświetlenia na fiszce, np. "was/were". */
export function displayForms(forms: string[]): string {
  if (forms.includes("was/were")) return "was/were";
  return forms.join(" / ");
}
