import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../data/story';
import { randomAvatarConfig, renderAvatarDataUri } from './avatar';
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
  it('has 16 sequential chapters with 4 distinct options (A-D) and one of each kind', () => {
    expect(CHAPTERS).toHaveLength(16);
    CHAPTERS.forEach((ch, idx) => {
      expect(ch.id).toBe(idx + 1);
      expect(ch.options).toHaveLength(4);
      expect(ch.options.map((o) => o.key)).toEqual(['A', 'B', 'C', 'D']);
      const kinds = ch.options.map((o) => o.kind).sort();
      expect(kinds).toEqual(['god', 'god-bold', 'world', 'world-mild']);
    });
  });

  it('alternates god-bold positions so teens cannot guess by button slot', () => {
    const slots = new Set(CHAPTERS.map((c) => c.options.find((o) => o.kind === 'god-bold')?.key));
    expect(slots.size).toBeGreaterThanOrEqual(3);
  });

  it('uses Nossa Senhora do Rosário as the parish reference', () => {
    const text = CHAPTERS.map((c) => `${c.title} ${c.narration} ${c.catholicRef}`).join(' ');
    expect(text).toContain('Nossa Senhora do Rosário');
  });
});

describe('Biased dice engine', () => {
  it('forces world and world-mild choices to roll 1..3 and never 4..6', () => {
    const worldRolls = [0, 0.49, 0.5, 0.84, 0.85, 0.99].map((r) =>
      rollBiasedDie('world', () => r),
    );
    expect(worldRolls).toEqual([1, 1, 2, 2, 3, 3]);

    const mildRolls = [0, 0.24, 0.25, 0.69, 0.7, 0.99].map((r) =>
      rollBiasedDie('world-mild', () => r),
    );
    expect(mildRolls).toEqual([1, 1, 2, 2, 3, 3]);
  });

  it('forces god and god-bold choices to roll 3..6 and never 1..2', () => {
    const godRolls = [0, 0.14, 0.15, 0.54, 0.55, 0.84, 0.85, 0.99].map((r) =>
      rollBiasedDie('god', () => r),
    );
    expect(godRolls).toEqual([3, 3, 4, 4, 5, 5, 6, 6]);

    const boldRolls = [0, 0.04, 0.05, 0.29, 0.3, 0.64, 0.65, 0.99].map((r) =>
      rollBiasedDie('god-bold', () => r),
    );
    expect(boldRolls).toEqual([3, 3, 4, 4, 5, 5, 6, 6]);
  });
});

describe('Scoring, avatar, sanitization, and epilogue', () => {
  it('computes net round points across all 4 tiers', () => {
    const ch = CHAPTERS[0];
    const worldOpt = ch.options.find((o) => o.kind === 'world')!;
    const mildOpt = ch.options.find((o) => o.kind === 'world-mild')!;
    const godOpt = ch.options.find((o) => o.kind === 'god')!;
    const boldOpt = ch.options.find((o) => o.kind === 'god-bold')!;

    expect(calculateRoundPoints(worldOpt, 1)).toBeLessThan(calculateRoundPoints(mildOpt, 2));
    expect(calculateRoundPoints(boldOpt, 5)).toBeGreaterThan(calculateRoundPoints(godOpt, 4));
  });

  it('strips secret kind and outcome text before sending to phones', () => {
    const sanitized = sanitizeChapterForPlayer(CHAPTERS[0]);
    expect(sanitized.options).toHaveLength(4);
    sanitized.options.forEach((opt) => {
      expect(opt).not.toHaveProperty('kind');
      expect(opt).not.toHaveProperty('outcomeText');
      expect(opt).not.toHaveProperty('basePoints');
    });
  });

  it('generates deterministic SVG data URIs for custom avatars', () => {
    const cfg = randomAvatarConfig(() => 0.35);
    const uri = renderAvatarDataUri(cfg);
    expect(uri.startsWith('data:image/svg+xml')).toBe(true);
  });

  it('sorts leaderboard descending by score then connection time', () => {
    const av = randomAvatarConfig(() => 0.2);
    const players: PlayerRecord[] = [
      { id: '1', name: 'Ana', avatar: av, score: 120, connectedAt: 20, rounds: {} },
      { id: '2', name: 'Pedro', avatar: av, score: 300, connectedAt: 30, rounds: {} },
      { id: '3', name: 'Lucas', avatar: av, score: 300, connectedAt: 10, rounds: {} },
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
