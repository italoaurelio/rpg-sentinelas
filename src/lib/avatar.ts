import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';

export interface AvatarConfig {
  skinColor: string;
  hair: string;
  hairColor: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  glasses: string; // 'none' | variant01..variant05
  earrings: string; // 'none' | variant01..variant06
  feature: string; // 'none' | mustache | blush | birthmark | freckles
  backgroundColor: string;
}

export const SKIN_COLORS = [
  { id: 'ffe0c4', label: 'Claro rosado' },
  { id: 'f2d3b1', label: 'Claro bege' },
  { id: 'ecad80', label: 'Pardo claro' },
  { id: 'd08b5b', label: 'Dourado' },
  { id: '9e5622', label: 'Castanho' },
  { id: '763900', label: 'Retinto' },
];

export const HAIR_STYLES = [
  'short01', 'short02', 'short03', 'short04', 'short05',
  'short06', 'short07', 'short08', 'short09', 'short10',
  'short11', 'short12', 'short13', 'short14', 'short15',
  'short16', 'short17', 'short18', 'short19',
  'long01', 'long02', 'long03', 'long04', 'long05',
  'long06', 'long07', 'long08', 'long09', 'long10',
  'long11', 'long12', 'long13', 'long14', 'long15',
  'long16', 'long17', 'long18', 'long19', 'long20',
  'long21', 'long22', 'long23', 'long24', 'long25', 'long26',
] as const;

export const HAIR_COLORS = [
  { id: '0e0e0e', label: 'Preto' },
  { id: '562306', label: 'Castanho escuro' },
  { id: '6a4e35', label: 'Castanho' },
  { id: 'ac6511', label: 'Mel' },
  { id: 'cb6820', label: 'Ruivo' },
  { id: 'ab2a18', label: 'Vinho' },
  { id: 'e5d7a3', label: 'Loiro claro' },
  { id: 'afafaf', label: 'Platinado' },
  { id: '85c2c6', label: 'Azul' },
  { id: '592454', label: 'Roxo' },
];

export const EYE_VARIANTS = Array.from({ length: 26 }, (_, i) =>
  `variant${String(i + 1).padStart(2, '0')}`,
);

export const EYEBROW_VARIANTS = Array.from({ length: 15 }, (_, i) =>
  `variant${String(i + 1).padStart(2, '0')}`,
);

export const MOUTH_VARIANTS = Array.from({ length: 30 }, (_, i) =>
  `variant${String(i + 1).padStart(2, '0')}`,
);

export const GLASSES_OPTIONS = [
  'none',
  'variant01',
  'variant02',
  'variant03',
  'variant04',
  'variant05',
];

export const EARRING_OPTIONS = [
  'none',
  'variant01',
  'variant02',
  'variant03',
  'variant04',
  'variant05',
  'variant06',
];

export const FEATURE_OPTIONS = [
  { id: 'none', label: 'Nenhum' },
  { id: 'blush', label: 'Bochecha' },
  { id: 'freckles', label: 'Sardas' },
  { id: 'birthmark', label: 'Sinal' },
  { id: 'mustache', label: 'Bigode' },
];

export const AVATAR_BACKGROUNDS = [
  'b6e3f4',
  'c0aede',
  'd1d4f9',
  'ffd5dc',
  'ffdfbf',
  'bfe7c7',
  'f5e1a4',
  'e8d7f1',
];

export function randomAvatarConfig(rng: () => number = Math.random): AvatarConfig {
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
  return {
    skinColor: pick(SKIN_COLORS).id,
    hair: pick(HAIR_STYLES),
    hairColor: pick(HAIR_COLORS).id,
    eyes: pick(EYE_VARIANTS),
    eyebrows: pick(EYEBROW_VARIANTS),
    mouth: pick(MOUTH_VARIANTS),
    glasses: rng() < 0.25 ? pick(GLASSES_OPTIONS.slice(1)) : 'none',
    earrings: rng() < 0.2 ? pick(EARRING_OPTIONS.slice(1)) : 'none',
    feature: rng() < 0.2 ? pick(FEATURE_OPTIONS.slice(1)).id : 'none',
    backgroundColor: pick(AVATAR_BACKGROUNDS),
  };
}

type AdventurerOptions = Parameters<typeof createAvatar<typeof adventurer>>[1];

export function renderAvatarDataUri(config: AvatarConfig): string {
  const options = {
    seed: 'sentinela',
    backgroundColor: [config.backgroundColor],
    skinColor: [config.skinColor],
    hair: [config.hair],
    hairColor: [config.hairColor],
    eyes: [config.eyes],
    eyebrows: [config.eyebrows],
    mouth: [config.mouth],
    glassesProbability: config.glasses === 'none' ? 0 : 100,
    ...(config.glasses !== 'none' ? { glasses: [config.glasses] } : {}),
    earringsProbability: config.earrings === 'none' ? 0 : 100,
    ...(config.earrings !== 'none' ? { earrings: [config.earrings] } : {}),
    featuresProbability: config.feature === 'none' ? 0 : 100,
    ...(config.feature !== 'none' ? { features: [config.feature] } : {}),
  } as unknown as AdventurerOptions;

  return createAvatar(adventurer, options).toDataUri();
}
