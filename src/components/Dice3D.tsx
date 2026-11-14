interface Dice3DProps {
  value: number | null;
  rolling: boolean;
  size?: 'md' | 'lg';
}

const PIP_POSITIONS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72],
  ],
  6: [
    [28, 24],
    [72, 24],
    [28, 50],
    [72, 50],
    [28, 76],
    [72, 76],
  ],
};

export function Dice3D({ value, rolling, size = 'lg' }: Dice3DProps) {
  const displayFace = value && value >= 1 && value <= 6 ? value : 6;
  const pips = PIP_POSITIONS[displayFace];

  return (
    <div
      className={`dice-cube ${rolling ? 'is-rolling' : ''} ${size === 'md' ? 'dice-md' : 'dice-lg'}`}
      role="status"
      aria-live="polite"
      aria-label={rolling ? 'Rolando o dado...' : value ? `Dado caiu em ${value}` : 'Dado pronto'}
    >
      <svg viewBox="0 0 100 100" className="dice-svg" aria-hidden="true">
        <rect x="4" y="4" width="92" height="92" rx="18" className="dice-face" />
        {pips.map(([cx, cy], index) => (
          <circle key={index} cx={cx} cy={cy} r="9" className="dice-pip" />
        ))}
      </svg>
    </div>
  );
}
