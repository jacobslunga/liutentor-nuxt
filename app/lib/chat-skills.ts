/**
 * Slash-kommandon i chattens inmatningsfält. Skriv "/" som första tecken och
 * listan öppnas; den valda skillen går som `skill` i payloaden och backend
 * lägger till motsvarande sektion i systemprompten — samma mekanik som
 * webbsökningen redan använder.
 *
 * Själva instruktionerna bor i backend, en fil per skill i
 * `liutentor-hono/src/skills/*.md`. Etiketterna här speglar frontmattern i de
 * filerna; `id` är kontraktet mellan repona.
 */
export type ChatSkillId =
  | "explain"
  | "theory"
  | "solution"
  | "hint"
  | "summary";

export interface ChatSkill {
  id: ChatSkillId;
  command: string;
  /** Skrivs utan diakriter innan man hunnit trycka på rätt tangent. */
  aliases: string[];
  label: string;
  description: string;
}

export const CHAT_SKILLS: ChatSkill[] = [
  {
    id: "explain",
    command: "förklara",
    aliases: ["forklara"],
    label: "Pedagogiskt",
    description: "Steg för steg i enkelt språk, där varje steg motiveras.",
  },
  {
    id: "theory",
    command: "teori",
    aliases: [],
    label: "Teori",
    description: "Djupdykning i definitioner och satser – utan att lösa uppgiften.",
  },
  {
    id: "solution",
    command: "lösning",
    aliases: ["losning"],
    label: "Fullständig lösning",
    description: "Hela uträkningen med alla mellansteg, kontroll och tydligt svar.",
  },
  {
    id: "hint",
    command: "ledtråd",
    aliases: ["ledtrad"],
    label: "Ledtråd",
    description: "Bara nästa knuff och en motfråga. Avslöjar aldrig svaret.",
  },
  {
    id: "summary",
    command: "sammanfatta",
    aliases: [],
    label: "Sammanfattning",
    description: "Komprimerad punktlista med nyckelbegrepp, formler och villkor.",
  },
];

export function getSkillById(id?: string | null): ChatSkill | null {
  if (!id) return null;
  return CHAT_SKILLS.find((skill) => skill.id === id) ?? null;
}

/**
 * Prefixmatch mot kommando, alias och etikett. Tom query ger hela listan, så att
 * enbart "/" öppnar menyn med allt.
 */
export function matchSkills(query: string): ChatSkill[] {
  const q = query.trim().toLowerCase();
  if (!q) return CHAT_SKILLS;
  return CHAT_SKILLS.filter((skill) =>
    [skill.command, ...skill.aliases, skill.label].some((candidate) =>
      candidate.toLowerCase().startsWith(q),
    ),
  );
}
