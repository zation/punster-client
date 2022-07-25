import React, { CSSProperties } from 'react';
import Image from '@/components/ipfs-image';

interface AvatarProps {
  avatarHash: string
  size?: number
  className?: string
  style?: CSSProperties
}

export default function Avatar({ avatarHash, size = 36, style, className }: AvatarProps) {
  return (
    <Image
      className={className}
      style={{
        height: size,
        width: size,
        borderRadius: size / 2,
        border: '1px solid #e4e5e6',
        ...style,
      }}
      hash={avatarHash}
    />
  );
};
