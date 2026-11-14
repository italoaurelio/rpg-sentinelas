import {
  CHAPTERS,
  EPILOGUE_TIERS,
  type Chapter,
  type ChoiceKey,
  type EpilogueTier,
  type OptionKind,
  type PublicChapter,
  type StoryOption,
} from '../data/story';

export interface PlayerRoundRecord {
  chapterId: number;
  choice: ChoiceKey;
  kind: OptionKind;
  dieValue: number;
  pointsDelta: number;
}

export interface PlayerRecord {
  id: string;
  name: string;
  score: number;
  connectedAt: number;
  rounds: Record<number, PlayerRoundRecord>;
  finalMemoryDie?: number;
}

/**
 * Rola um d6 viciado conforme o caminho escolhido:
 * - world: 50% -> 1, 35% -> 2, 15% -> 3 (nunca 4..6)
 * - god:   10% -> 3, 30% -> 4, 35% -> 5, 25% -> 6 (nunca 1..2)
 */
export function rollBiasedDie(kind: OptionKind, rng: () => number = Math.random): number {
  const r = Math.min(Math.max(rng(), 0), 0.999999);
  if (kind === 'world') {
    if (r < 0.5) return 1;
    if (r < 0.85) return 2;
    return 3;
  }
  if (r < 0.1) return 3;
  if (r < 0.4) return 4;
  if (r < 0.75) return 5;
  return 6;
}

/**
 * Calcula a variação de pontos da rodada combinando o desfecho da escolha com o dado:
 * - Caminho de Deus: base positiva + bônus pelo valor alto do dado (ex.: dado 6 -> +12 extras).
 * - Caminho do Mundo: base negativa (custo oculto) agravada por dados baixos (1 ou 2).
 */
export function calculateRoundPoints(option: StoryOption, dieValue: number): number {
  if (option.kind === 'god') {
    return option.basePoints + dieValue * 2;
  }
  const penalty = (4 - dieValue) * 3;
  return option.basePoints - Math.max(penalty, 0);
}

/**
 * Remove propriedades secretas (kind, outcomeText, basePoints) antes de enviar ao celular.
 */
export function sanitizeChapterForPlayer(chapter: Chapter): PublicChapter {
  return {
    id: chapter.id,
    act: chapter.act,
    ageLabel: chapter.ageLabel,
    title: chapter.title,
    narration: chapter.narration,
    options: [
      { key: chapter.options[0].key, label: chapter.options[0].label },
      { key: chapter.options[1].key, label: chapter.options[1].label },
    ],
  };
}

export function getChapterById(id: number): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getEpilogue(totalScore: number): EpilogueTier {
  if (totalScore >= 260) return EPILOGUE_TIERS.rock;
  if (totalScore >= 80) return EPILOGUE_TIERS.divided;
  return EPILOGUE_TIERS.shortcuts;
}

export function sortLeaderboard(players: PlayerRecord[]): PlayerRecord[] {
  return [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.connectedAt - b.connectedAt;
  });
}

export function generateRoomCode(rng: () => number = Math.random): string {
  const num = Math.floor(1000 + rng() * 9000);
  return String(num);
}
