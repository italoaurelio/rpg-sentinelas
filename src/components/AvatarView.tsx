import { useMemo } from 'react';
import { renderAvatarDataUri, type AvatarConfig } from '../lib/avatar';

interface AvatarViewProps {
  config: AvatarConfig;
  name: string;
  size?: number;
  className?: string;
}

export function AvatarView({ config, name, size = 48, className = '' }: AvatarViewProps) {
  const uri = useMemo(() => renderAvatarDataUri(config), [config]);

  return (
    <img
      src={uri}
      alt={`Avatar de ${name}`}
      width={size}
      height={size}
      className={`avatar-img ${className}`}
    />
  );
}
