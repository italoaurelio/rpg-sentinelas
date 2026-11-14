import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import {
  AVATAR_BACKGROUNDS,
  EARRING_OPTIONS,
  EYEBROW_VARIANTS,
  EYE_VARIANTS,
  FEATURE_OPTIONS,
  GLASSES_OPTIONS,
  HAIR_COLORS,
  HAIR_STYLES,
  MOUTH_VARIANTS,
  SKIN_COLORS,
  randomAvatarConfig,
  type AvatarConfig,
} from '../lib/avatar';
import { AvatarView } from './AvatarView';

interface AvatarBuilderProps {
  value: AvatarConfig;
  onChange: (next: AvatarConfig) => void;
  previewName: string;
}

function cycleItem<T>(list: readonly T[], current: T, dir: -1 | 1): T {
  const idx = list.indexOf(current);
  const safeIdx = idx === -1 ? 0 : idx;
  const nextIdx = (safeIdx + dir + list.length) % list.length;
  return list[nextIdx];
}

interface StepperProps {
  label: string;
  currentText: string;
  onPrev: () => void;
  onNext: () => void;
}

function Stepper({ label, currentText, onPrev, onNext }: StepperProps) {
  return (
    <div className="avatar-stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-controls">
        <button type="button" className="stepper-btn" onClick={onPrev} aria-label={`Anterior ${label}`}>
          <ChevronLeft size={18} />
        </button>
        <span className="stepper-value">{currentText}</span>
        <button type="button" className="stepper-btn" onClick={onNext} aria-label={`Próximo ${label}`}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export function AvatarBuilder({ value, onChange, previewName }: AvatarBuilderProps) {
  const hairIdx = HAIR_STYLES.indexOf(value.hair as (typeof HAIR_STYLES)[number]) + 1;
  const eyeIdx = EYE_VARIANTS.indexOf(value.eyes) + 1;
  const mouthIdx = MOUTH_VARIANTS.indexOf(value.mouth) + 1;
  const browIdx = EYEBROW_VARIANTS.indexOf(value.eyebrows) + 1;
  const glassesIdx = GLASSES_OPTIONS.indexOf(value.glasses);
  const earringIdx = EARRING_OPTIONS.indexOf(value.earrings);

  return (
    <div className="avatar-builder">
      <div className="avatar-preview-row">
        <AvatarView config={value} name={previewName || 'Personagem'} size={96} className="avatar-hero" />
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onChange(randomAvatarConfig())}
        >
          <Shuffle size={16} /> Sortear visual
        </button>
      </div>

      <div className="swatch-group">
        <span className="swatch-title">Tom de pele</span>
        <div className="swatch-row">
          {SKIN_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`swatch-btn ${value.skinColor === c.id ? 'is-active' : ''}`}
              style={{ backgroundColor: `#${c.id}` }}
              onClick={() => onChange({ ...value, skinColor: c.id })}
              aria-label={`Pele ${c.label}`}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="swatch-group">
        <span className="swatch-title">Cor do cabelo</span>
        <div className="swatch-row">
          {HAIR_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`swatch-btn ${value.hairColor === c.id ? 'is-active' : ''}`}
              style={{ backgroundColor: `#${c.id}` }}
              onClick={() => onChange({ ...value, hairColor: c.id })}
              aria-label={`Cabelo ${c.label}`}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="swatch-group">
        <span className="swatch-title">Fundo</span>
        <div className="swatch-row">
          {AVATAR_BACKGROUNDS.map((bg) => (
            <button
              key={bg}
              type="button"
              className={`swatch-btn ${value.backgroundColor === bg ? 'is-active' : ''}`}
              style={{ backgroundColor: `#${bg}` }}
              onClick={() => onChange({ ...value, backgroundColor: bg })}
              aria-label={`Fundo #${bg}`}
            />
          ))}
        </div>
      </div>

      <div className="stepper-grid">
        <Stepper
          label="Cabelo"
          currentText={`Estilo ${hairIdx}/${HAIR_STYLES.length}`}
          onPrev={() =>
            onChange({
              ...value,
              hair: cycleItem(HAIR_STYLES, value.hair as (typeof HAIR_STYLES)[number], -1),
            })
          }
          onNext={() =>
            onChange({
              ...value,
              hair: cycleItem(HAIR_STYLES, value.hair as (typeof HAIR_STYLES)[number], 1),
            })
          }
        />

        <Stepper
          label="Olhos"
          currentText={`${eyeIdx}/${EYE_VARIANTS.length}`}
          onPrev={() => onChange({ ...value, eyes: cycleItem(EYE_VARIANTS, value.eyes, -1) })}
          onNext={() => onChange({ ...value, eyes: cycleItem(EYE_VARIANTS, value.eyes, 1) })}
        />

        <Stepper
          label="Sobrancelha"
          currentText={`${browIdx}/${EYEBROW_VARIANTS.length}`}
          onPrev={() =>
            onChange({ ...value, eyebrows: cycleItem(EYEBROW_VARIANTS, value.eyebrows, -1) })
          }
          onNext={() =>
            onChange({ ...value, eyebrows: cycleItem(EYEBROW_VARIANTS, value.eyebrows, 1) })
          }
        />

        <Stepper
          label="Boca"
          currentText={`${mouthIdx}/${MOUTH_VARIANTS.length}`}
          onPrev={() => onChange({ ...value, mouth: cycleItem(MOUTH_VARIANTS, value.mouth, -1) })}
          onNext={() => onChange({ ...value, mouth: cycleItem(MOUTH_VARIANTS, value.mouth, 1) })}
        />

        <Stepper
          label="Óculos"
          currentText={glassesIdx <= 0 ? 'Sem óculos' : `Modelo ${glassesIdx}`}
          onPrev={() =>
            onChange({ ...value, glasses: cycleItem(GLASSES_OPTIONS, value.glasses, -1) })
          }
          onNext={() =>
            onChange({ ...value, glasses: cycleItem(GLASSES_OPTIONS, value.glasses, 1) })
          }
        />

        <Stepper
          label="Brincos"
          currentText={earringIdx <= 0 ? 'Nenhum' : `Par ${earringIdx}`}
          onPrev={() =>
            onChange({ ...value, earrings: cycleItem(EARRING_OPTIONS, value.earrings, -1) })
          }
          onNext={() =>
            onChange({ ...value, earrings: cycleItem(EARRING_OPTIONS, value.earrings, 1) })
          }
        />
      </div>

      <div className="swatch-group">
        <span className="swatch-title">Detalhe extra</span>
        <div className="chip-row">
          {FEATURE_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`mini-chip ${value.feature === f.id ? 'is-active' : ''}`}
              onClick={() => onChange({ ...value, feature: f.id })}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
