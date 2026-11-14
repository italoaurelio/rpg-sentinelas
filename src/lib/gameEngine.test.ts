import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../data/story';
import {
  calculateRoundPoints,
  generateRoomCode,
  getEpilogue,
  rollBiasedDie,
  sanitizeChapterForPlayer,
  sortLeaderboard,
  type PlayerRecord,
} from './gameEngine';

describe('Story integrity', () => {
  it('has 16 sequential chapters with one world and one god option each', () => {
    expect(CHAPTERS).toHaveLength(16);
    CHAPTERS.forEach((ch, idx) => {
      expect(ch.id).toBe(idx + 1);
      expect(ch.options).toHaveLength(2);
      const kinds = ch.options.map((o) => o.kind).sort();
      expect(kinds).toEqual(['god', 'world']);
      expect(ch.options.map((o) => o.key)).toEqual(['A', 'B']);
    });
  });

  it('alternates option positions so teens cannot guess by button slot', () => {
    const aGodCount = CHAPTERS.filter((c) => c.options[0].kind === 'god').length;
    expect(aGodCount).toBeGreaterThanOrEqual(6);
    expect(aGodCount).toBeLessThanOrEqual(10);
  });
});

describe('Biased dice engine', () => {
  it('forces world choices to roll 1..3 and never 4..6', () => {
    const rolls = [0, 0.25, 0.49, 0.5, 0.84, 0.85, 0.99].map((r) =>
      rollBiasedDie('world', () => r),
    );
    expect(rolls).toEqual([1, 1, 1, 2, 2, 3, 3]);
    rolls.forEach((v) => expect(v).toBeLessThanOrEqual(3));
  });

  it('forces god choices to roll 3..6 and never 1..2', () => {
    const rolls = [0, 0.09, 0.1, 0.39, 0.4, 0.74, 0.75, 0.99].map((r) =>
      rollBiasedDie('god', () => r),
    );
    expect(rolls).toEqual([3, 3, 4, 4, 5, 5, 6, 6]);
    rolls.forEach((v) => expect(v).toBeGreaterThanOrEqual(3));
  });
});

describe('Scoring, sanitization, and epilogue', () => {
  it('computes net round points with die multiplier impact', () => {
    const ch = CHAPTERS[0];
    const worldOpt = ch.options.find((o) => o.kind === 'world')!;
    const godOpt = ch.options.find((o) => o.kind === 'god')!;

    expect(calculateRoundPoints(worldOpt, 1)).toBeLessThan(calculateRoundPoints(worldOpt, 3));
    expect(calculateRoundPoints(godOpt, 6)).toBeGreaterThan(calculateRoundPoints(godOpt, 4));
    expect(calculateRoundPoints(godOpt, 4)).toBeGreaterThan(0);
    expect(calculateRoundPoints(worldOpt, 2)).toBeLessThan(0);
  });

  it('strips secret kind and outcome text before sending to phones', () => {
    const sanitized = sanitizeChapterForPlayer(CHAPTERS[0]);
    expect(sanitized.options[0]).not.toHaveProperty('kind');
    expect(sanitized.options[0]).not.toHaveProperty('outcomeText');
    expect(sanitized.options[0]).not.toHaveProperty('basePoints');
  });

  it('sorts leaderboard descending by score then connection time', () => {
    const players: PlayerRecord[] = [
      { id: '1', name: 'Ana', score: 120, connectedAt: 20, rounds: {} },
      { id: '2', name: 'Pedro', score: 300, connectedAt: 30, rounds: {} },
      { id: '3', name: 'Lucas', score: 300, connectedAt: 10, rounds: {} },
    ];
    expect(sortLeaderboard(players).map((p) => p.name)).toEqual(['Lucas', 'Pedro', 'Ana']);
  });

  it('maps total score to the correct epilogue tier', () => {
    expect(getEpilogue(420).id).toBe('rock');
    expect(getEpilogue(150).id).toBe('divided');
    expect(getEpilogue(-50).id).toBe('shortcuts');
  });

  it('generates 4-digit room codes', () => {
    expect(generateRoomCode(() => 0)).toBe('1000');
    expect(generateRoomCode(() => 0.9999)).toBe('9999');
  });
});
